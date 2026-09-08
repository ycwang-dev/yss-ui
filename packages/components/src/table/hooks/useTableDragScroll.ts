import { onMounted, onUnmounted, Ref } from 'vue';

/**
 * 表格行拖拽自动滚动 Hook
 *
 * 当启用行拖拽且表格有内部滚动条时，将鼠标/手指拖到表格可视区域的
 * 顶部或底部边界（以及越出边界）会自动滚动，方便用户将行拖到远处。
 *
 * 核心设计要点：
 * 1. vxe-table 行拖拽使用 HTML5 原生 Drag API（在 <tr> 上设 draggable）
 * 2. vxe-table 仅在行 <tr> 上绑定 dragover 并调用 preventDefault()
 * 3. 当鼠标拖出 table 外时，没有元素对 dragover 调用 preventDefault()，
 *    浏览器会视为无效放置目标，导致坐标不准确或事件降频
 * 4. 因此本 hook 在 document 级别的 dragover 中调用 preventDefault()，
 *    确保整个页面都是有效放置目标，dragover 持续准确触发
 * 5. 同时监听 drag 事件（在拖拽源元素上触发，不受光标位置影响）作为后备坐标源
 *
 * @param tableRef - vxe-table 组件实例 ref
 * @param options  - 配置项
 */
export function useTableDragScroll(
  tableRef: Ref<any>,
  options: { enabled: Ref<boolean>; threshold?: number; maxSpeed?: number }
) {
  /** 是否处于拖拽中（普通 mousedown 或 HTML5 drag） */
  let isDragging = false;
  /** 是否处于 HTML5 原生拖拽中（dragstart 后置为 true） */
  let isNativeDragging = false;
  /** requestAnimationFrame 句柄 */
  let scrollFrameId: number | null = null;
  /** 当前指针的 clientY 坐标 */
  let currentY = 0;
  /**
   * 实际执行 scrollTop 的容器（.vxe-table--body-inner-wrapper）
   * vxe-table 中 .vxe-table--body-wrapper 是 overflow:hidden 的外壳，
   * 真正可滚动的是其子元素 .vxe-table--body-inner-wrapper（overflow-y:scroll）
   */
  let activeScrollContainer: HTMLElement | null = null;
  /**
   * 用于边界检测的容器（.vxe-table--body-wrapper）
   * 它的 getBoundingClientRect 反映表格 body 的可视区域
   */
  let activeRectContainer: HTMLElement | null = null;
  /** 缓存的容器 BoundingClientRect，减少 reflow 开销 */
  let cachedRect: DOMRect | null = null;
  /** rect 缓存的帧计数器 */
  let rectCacheFrames = 0;

  /** 边界检测距离 (px) */
  const threshold = options.threshold ?? 50;
  /** 最大滚动速度 (px/frame) */
  const maxSpeed = options.maxSpeed ?? 15;
  /**
   * rect 缓存刷新间隔（帧数）
   * 拖拽期间容器位置几乎不变，每 10 帧刷新一次足够
   */
  const RECT_CACHE_INTERVAL = 10;

  // ────────────────────────────────────────────────────────
  //  事件处理器
  // ────────────────────────────────────────────────────────

  /**
   * mousedown / touchstart 处理
   * 在表格体内部按下时标记为潜在拖拽起点
   */
  const handleMouseDown = (e: MouseEvent | TouchEvent) => {
    if (!options.enabled.value) return;

    const target = e.target as HTMLElement;
    const wrapper = target.closest('.vxe-table--body-wrapper');
    if (wrapper) {
      const innerWrapper = wrapper.querySelector('.vxe-table--body-inner-wrapper') as HTMLElement;
      activeRectContainer = wrapper as HTMLElement;
      activeScrollContainer = innerWrapper || (wrapper as HTMLElement);
      isDragging = true;
      invalidateRectCache();
    }
  };

  /**
   * HTML5 dragstart 处理（capture 阶段，先于 vxe-table 触发）
   *
   * vxe-table 在 handleCellDragMousedownEvent 中对 mousedown 调用了
   * stopPropagation()，但 dragstart 是一个独立事件，capture 阶段监听
   * 可以可靠捕获。标记 isNativeDragging 以切换坐标策略。
   */
  const handleDragStart = (e: DragEvent) => {
    if (!options.enabled.value) return;

    const target = e.target as HTMLElement;
    const wrapper = target.closest('.vxe-table--body-wrapper');
    if (wrapper) {
      const innerWrapper = wrapper.querySelector('.vxe-table--body-inner-wrapper') as HTMLElement;
      isNativeDragging = true;
      activeRectContainer = wrapper as HTMLElement;
      activeScrollContainer = innerWrapper || (wrapper as HTMLElement);
      isDragging = true;
      invalidateRectCache();
    }
  };

  /**
   * mousemove / touchmove 处理
   * 非原生拖拽场景下的坐标追踪
   */
  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    // 原生拖拽模式下忽略 mousemove（坐标不可靠）
    if (isNativeDragging && e.type === 'mousemove') return;

    // 非原生拖拽：左键未按下则终止
    if (e.type === 'mousemove' && 'buttons' in e && (e as MouseEvent).buttons !== 1) {
      stopDrag();
      return;
    }

    if (e.type === 'touchmove') {
      currentY = (e as TouchEvent).touches[0].clientY;
    } else {
      currentY = (e as MouseEvent).clientY;
    }

    ensureScrollLoop();
  };

  /**
   * dragover 处理 —— 原生拖拽模式下的核心坐标来源
   *
   * 关键：必须调用 preventDefault() 以告知浏览器此区域可接受放置，
   * 否则浏览器会在 table 外的区域降低 dragover 事件频率或不传递准确坐标。
   * vxe-table 仅在行 <tr> 上做了 preventDefault()，离开 table 后无人处理。
   */
  const handleDragOver = (e: DragEvent) => {
    if (!isDragging || !isNativeDragging) return;

    // 关键：让整个文档成为有效放置目标
    e.preventDefault();

    const y = e.clientY;
    // 拖出浏览器窗口时 clientY 可能为 0，保留上次有效值
    if (y > 0) {
      currentY = y;
    }

    ensureScrollLoop();
  };

  /**
   * drag 事件处理 —— 后备坐标源
   *
   * drag 事件在拖拽源元素（被拖的行）上触发，不受光标位置影响，
   * 即使光标离开了 table 也会持续触发。当 dragover 坐标不可用时，
   * 可从 drag 事件获取近似坐标。
   *
   * 注意：部分浏览器中 drag 事件的 clientY 可能为 0，需过滤。
   */
  const handleDrag = (e: DragEvent) => {
    if (!isDragging || !isNativeDragging) return;

    const y = e.clientY;
    if (y > 0) {
      currentY = y;
    }

    ensureScrollLoop();
  };

  /** mouseup / touchend → 终止拖拽（非原生拖拽场景） */
  const handlePointerEnd = () => {
    stopDrag();
  };

  /**
   * dragend 处理（capture 阶段，先于 vxe-table 内部的 handleRowDragDragendEvent）
   *
   * 核心修正：当鼠标在表格外部松开时，vxe-table 的 prevDragRow/prevDragPos
   * 会停留在「鼠标离开前最后悬停的行」，而非第一行/最后一行。
   * 在这里检测鼠标位置，如果在表格外则直接修正 internalData，
   * 使后续 vxe-table 的 handleRowDragSwapEvent 能将行放到正确位置。
   */
  const handleDragEnd = (e: DragEvent) => {
    if (isNativeDragging && activeRectContainer) {
      correctDropPositionIfOutside(e);
    }
    stopDrag();
  };

  // ────────────────────────────────────────────────────────
  //  内部辅助方法
  // ────────────────────────────────────────────────────────

  /** 清除 rect 缓存 */
  const invalidateRectCache = () => {
    cachedRect = null;
    rectCacheFrames = 0;
  };

  /** 终止拖拽，清理所有状态 */
  const stopDrag = () => {
    isDragging = false;
    isNativeDragging = false;

    // 清理 DOM 上残留的拖拽目标放置高亮类名
    if (tableRef.value?.$el) {
      const el = tableRef.value.$el as HTMLElement;
      el.querySelectorAll('.row--drag-over, .is--drag-over').forEach(node => {
        node.classList.remove('row--drag-over', 'is--drag-over');
      });
    }

    activeScrollContainer = null;
    activeRectContainer = null;
    invalidateRectCache();
    if (scrollFrameId) {
      cancelAnimationFrame(scrollFrameId);
      scrollFrameId = null;
    }
  };

  /**
   * 修正拖拽结束时的放置位置
   *
   * 当鼠标在表格 body 区域外部松开时，vxe-table 的 internalData.prevDragRow
   * 仍然指向「鼠标离开前最后悬停的那一行」，导致排序结果不符合预期。
   *
   * 修正策略：
   * - 鼠标在表格上方 → prevDragRow 设为第一行，prevDragPos 设为 'top'
   * - 鼠标在表格下方 → prevDragRow 设为最后一行，prevDragPos 设为 'bottom'
   */
  const correctDropPositionIfOutside = (e: DragEvent) => {
    const y = e.clientY > 0 ? e.clientY : currentY;
    if (!activeRectContainer || y <= 0) return;

    const rect = activeRectContainer.getBoundingClientRect();
    const isAbove = y < rect.top;
    const isBelow = y > rect.bottom;

    if (!isAbove && !isBelow) return;

    // 获取 vxe-table 实例的 internalData
    const xTable = tableRef.value;
    if (!xTable?.internalData) return;

    const { internalData } = xTable;
    // afterFullData 是 vxe-table 处理后的完整行数据数组
    const rows: any[] = internalData.afterFullData;
    if (!rows?.length) return;

    if (isAbove) {
      // 鼠标在上方 → 目标为第一行上方
      internalData.prevDragRow = rows[0];
      internalData.prevDragPos = 'top';
    } else {
      // 鼠标在下方 → 目标为最后一行下方
      internalData.prevDragRow = rows[rows.length - 1];
      internalData.prevDragPos = 'bottom';
    }
  };

  /** 确保 rAF 滚动循环已启动 */
  const ensureScrollLoop = () => {
    if (!scrollFrameId) {
      scrollFrameId = requestAnimationFrame(autoScroll);
    }
  };

  /**
   * 获取滚动容器的 BoundingClientRect（带帧级缓存）
   * 拖拽期间滚动容器位置基本不变，缓存避免每帧触发 reflow
   */
  const getContainerRect = (container: HTMLElement): DOMRect => {
    rectCacheFrames++;
    if (!cachedRect || rectCacheFrames >= RECT_CACHE_INTERVAL) {
      cachedRect = container.getBoundingClientRect();
      rectCacheFrames = 0;
    }
    return cachedRect;
  };

  /**
   * 核心自动滚动逻辑（requestAnimationFrame 每帧执行）
   *
   * 根据指针 Y 坐标与滚动容器边界的关系计算滚动速度：
   * - 超出容器顶部 → 以最大速度向上滚动
   * - 在顶部阈值区域 → 二次缓动加速
   * - 在底部阈值区域 → 二次缓动加速
   * - 超出容器底部 → 以最大速度向下滚动
   */
  const autoScroll = () => {
    if (!isDragging) {
      scrollFrameId = null;
      return;
    }

    let scrollContainer = activeScrollContainer;
    let rectContainer = activeRectContainer;
    if (!scrollContainer) {
      const xTable = tableRef.value;
      if (xTable?.$el) {
        const wrapper = xTable.$el.querySelector('.vxe-table--body-wrapper') as HTMLElement;
        if (wrapper) {
          rectContainer = wrapper;
          scrollContainer = (wrapper.querySelector('.vxe-table--body-inner-wrapper') as HTMLElement) || wrapper;
        }
      }
    }

    if (scrollContainer && rectContainer) {
      const rect = getContainerRect(rectContainer);
      let scrollSpeed = 0;

      if (currentY < rect.top) {
        // 指针在容器顶部之上：最大速度向上滚动
        scrollSpeed = -maxSpeed;
      } else if (currentY < rect.top + threshold) {
        // 指针在顶部阈值区域：二次缓动（ratio² 提供丝滑加速感）
        const ratio = 1 - (currentY - rect.top) / threshold;
        scrollSpeed = -Math.round(ratio * ratio * maxSpeed);
      } else if (currentY > rect.bottom) {
        // 指针在容器底部之下：最大速度向下滚动
        scrollSpeed = maxSpeed;
      } else if (currentY > rect.bottom - threshold) {
        // 指针在底部阈值区域：二次缓动加速
        const ratio = 1 - (rect.bottom - currentY) / threshold;
        scrollSpeed = Math.round(ratio * ratio * maxSpeed);
      }

      if (scrollSpeed !== 0) {
        scrollContainer.scrollTop += scrollSpeed;
      }
    }

    // 持续循环直到拖拽结束
    scrollFrameId = requestAnimationFrame(autoScroll);
  };

  // ────────────────────────────────────────────────────────
  //  生命周期：注册 / 注销事件监听
  // ────────────────────────────────────────────────────────

  onMounted(() => {
    // capture 阶段：确保先于 vxe-table 内部的 stopPropagation 触发
    document.addEventListener('mousedown', handleMouseDown, { capture: true });
    document.addEventListener('touchstart', handleMouseDown, { capture: true, passive: true });
    document.addEventListener('dragstart', handleDragStart, { capture: true });

    // 坐标追踪
    document.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('touchmove', handlePointerMove, { passive: true });
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drag', handleDrag);

    // 拖拽结束
    document.addEventListener('mouseup', handlePointerEnd);
    document.addEventListener('touchend', handlePointerEnd);
    document.addEventListener('dragend', handleDragEnd, { capture: true });
  });

  onUnmounted(() => {
    document.removeEventListener('mousedown', handleMouseDown, { capture: true });
    document.removeEventListener('touchstart', handleMouseDown, { capture: true });
    document.removeEventListener('dragstart', handleDragStart, { capture: true });

    document.removeEventListener('mousemove', handlePointerMove);
    document.removeEventListener('touchmove', handlePointerMove);
    document.removeEventListener('dragover', handleDragOver);
    document.removeEventListener('drag', handleDrag);

    document.removeEventListener('mouseup', handlePointerEnd);
    document.removeEventListener('touchend', handlePointerEnd);
    document.removeEventListener('dragend', handleDragEnd, { capture: true });
    stopDrag();
  });
}
