import { computed, onScopeDispose, ref, type Ref } from 'vue';
import { useThrottleFn } from '@vueuse/core';
import type { YSplitPaneProps } from '../types';
import { clampWidth, saveWidthToStorage, RESIZE_EVENT_THROTTLE_MS } from '../constant';

/** SplitPane 尺寸更新事件定义。 */
interface SplitPaneResizeEmits {
  (e: 'update:leftWidth', v: number): void;
  (e: 'update:topHeight', v: number): void;
  (e: 'resize', payload: { size: number; width?: number; height?: number }): void;
}

/** 当前拖拽会话中不会变化的布局数据。 */
interface DragContext {
  startPosition: number;
  startSize: number;
  maxSize: number;
  latestPosition: number;
  lastAppliedSize: number;
  moved: boolean;
}

/**
 * 拖拽调整大小逻辑 Hook。
 * deferred 模式只移动代理线，释放鼠标后才提交一次真实布局尺寸。
 * @param props - 组件属性
 * @param paneSize - 当前左侧宽度或上侧高度
 * @param isControlled - 是否为受控模式
 * @param isCollapsed - 折叠状态
 * @param cachedRect - 根容器缓存布局
 * @param emits - 组件事件派发函数
 * @returns 拖拽状态、代理尺寸和事件处理方法
 */
export const useDragResize = (
  props: YSplitPaneProps,
  paneSize: Ref<number>,
  isControlled: Ref<boolean>,
  isCollapsed: Ref<boolean>,
  cachedRect: Ref<DOMRect | null>,
  emits: SplitPaneResizeEmits
) => {
  const isVertical = (): boolean => props.direction === 'vertical';
  const isDeferred = (): boolean => props.resizeMode === 'deferred';
  const getInitialSize = (): number => (isVertical() ? (props.initialHeight ?? 200) : (props.initialWidth ?? 280));
  const getMinSize = (): number => (isVertical() ? (props.minHeight ?? 200) : (props.minWidth ?? 200));
  const getMaxSize = (): number => (isVertical() ? (props.maxHeight ?? 480) : (props.maxWidth ?? 480));

  /** 拖拽中标记。 */
  const dragging = ref(false);

  /** 鼠标接近分割线标记。 */
  const near = ref(false);

  /** deferred 模式代理线对应的目标尺寸。 */
  const previewSize = ref(paneSize.value || getInitialSize());

  /** deferred 模式是否显示拖拽代理线。 */
  const previewVisible = computed(() => dragging.value && isDeferred());

  let rafId: number | null = null;
  let dragContext: DragContext | null = null;
  let activeMoveHandler: ((event: MouseEvent) => void) | null = null;
  let activeUpHandler: (() => void) | null = null;

  /**
   * 立即派发 resize 事件。
   * @param size - 最新面板尺寸
   */
  const emitResizeImmediately = (size: number): void => {
    if (isVertical()) {
      emits('resize', { size, height: size });
      return;
    }
    emits('resize', { size, width: size });
  };

  /** realtime 模式降低父组件 resize 响应频率。 */
  const emitResizeThrottled = useThrottleFn(emitResizeImmediately, RESIZE_EVENT_THROTTLE_MS);

  /**
   * 更新面板模型值。
   * @param size - 新尺寸
   */
  const updatePaneSize = (size: number): void => {
    if (!isControlled.value) {
      paneSize.value = size;
    }
    if (isVertical()) {
      emits('update:topHeight', size);
      return;
    }
    emits('update:leftWidth', size);
  };

  /**
   * 根据当前指针位置计算受约束的面板尺寸。
   * @param position - 当前 X 或 Y 坐标
   * @returns 限制在拖拽边界内的尺寸
   */
  const calculateSize = (position: number): number => {
    if (!dragContext) return paneSize.value;
    return clampWidth(dragContext.startSize + position - dragContext.startPosition, getMinSize(), dragContext.maxSize);
  };

  /** 取消尚未执行的拖拽动画帧。 */
  const cancelPendingFrame = (): void => {
    if (rafId === null) return;
    cancelAnimationFrame(rafId);
    rafId = null;
  };

  /** 移除当前拖拽会话的全局监听。 */
  const removeGlobalListeners = (): void => {
    if (activeMoveHandler) {
      window.removeEventListener('mousemove', activeMoveHandler);
    }
    if (activeUpHandler) {
      window.removeEventListener('mouseup', activeUpHandler);
    }
    activeMoveHandler = null;
    activeUpHandler = null;
  };

  /**
   * 在动画帧内更新实时尺寸或代理线位置。
   * @param position - 当前 X 或 Y 坐标
   */
  const scheduleDragUpdate = (position: number): void => {
    if (!dragContext) return;
    dragContext.latestPosition = position;
    dragContext.moved = dragContext.moved || position !== dragContext.startPosition;
    cancelPendingFrame();
    rafId = requestAnimationFrame(() => {
      rafId = null;
      if (!dragContext) return;
      const nextSize = calculateSize(dragContext.latestPosition);
      isCollapsed.value = false;
      if (isDeferred()) {
        previewSize.value = nextSize;
        return;
      }
      dragContext.lastAppliedSize = nextSize;
      updatePaneSize(nextSize);
      emitResizeThrottled(nextSize);
    });
  };

  /**
   * 完成当前拖拽会话，并保证最后一个指针位置不会因 RAF 取消而丢失。
   */
  const finishDrag = (): void => {
    if (!dragContext) return;
    const context = dragContext;
    const finalSize = calculateSize(context.latestPosition);
    cancelPendingFrame();

    if (context.moved) {
      isCollapsed.value = false;
      if (isDeferred() || finalSize !== context.lastAppliedSize) {
        updatePaneSize(finalSize);
      }
      previewSize.value = finalSize;
      emitResizeImmediately(finalSize);
      if (props.storageKey && !isControlled.value) {
        saveWidthToStorage(props.storageKey, finalSize);
      }
    }

    dragging.value = false;
    dragContext = null;
    removeGlobalListeners();
  };

  /**
   * 开始拖拽。
   * @param event - 鼠标按下事件
   */
  const startDrag = (event: MouseEvent): void => {
    if (!props.draggable || event.button !== 0 || dragging.value) return;
    event.preventDefault();

    const rootElement = (event.currentTarget as HTMLElement | null)?.parentElement;
    const containerSize = rootElement
      ? isVertical()
        ? rootElement.clientHeight
        : rootElement.clientWidth
      : isVertical()
        ? cachedRect.value?.height
        : cachedRect.value?.width;
    const minSize = getMinSize();
    const gutterSize = props.gutterSize ?? 6;
    const dynamicMaxSize = containerSize ? containerSize - gutterSize - minSize : getMaxSize();
    const maxSize = Math.max(minSize, Math.min(getMaxSize(), dynamicMaxSize));
    const startPosition = isVertical() ? event.clientY : event.clientX;
    const startSize = clampWidth(paneSize.value || getInitialSize(), minSize, maxSize);

    dragContext = {
      startPosition,
      startSize,
      maxSize,
      latestPosition: startPosition,
      lastAppliedSize: startSize,
      moved: false,
    };
    previewSize.value = startSize;
    dragging.value = true;

    activeMoveHandler = moveEvent => {
      if (!dragging.value) return;
      scheduleDragUpdate(isVertical() ? moveEvent.clientY : moveEvent.clientX);
    };
    activeUpHandler = finishDrag;
    window.addEventListener('mousemove', activeMoveHandler);
    window.addEventListener('mouseup', activeUpHandler);
  };

  /**
   * 检测鼠标是否接近分割线。
   * @param event - 鼠标移动事件
   */
  const handleMouseMove = (event: MouseEvent): void => {
    if (dragging.value || !cachedRect.value || !props.draggable) return;
    const currentSize = paneSize.value || getInitialSize();
    const dividerCenter = isVertical()
      ? cachedRect.value.top + currentSize + (props.gutterSize ?? 6) / 2
      : cachedRect.value.left + currentSize + (props.gutterSize ?? 6) / 2;
    const threshold = Math.max(12, (props.gutterSize ?? 6) * 2);
    near.value = Math.abs((isVertical() ? event.clientY : event.clientX) - dividerCenter) <= threshold;
  };

  /** 鼠标离开容器时重置悬停状态。 */
  const handleMouseLeave = (): void => {
    near.value = false;
  };

  onScopeDispose(() => {
    cancelPendingFrame();
    removeGlobalListeners();
  });

  return {
    dragging,
    near,
    previewSize,
    previewVisible,
    startDrag,
    handleMouseMove,
    handleMouseLeave,
  };
};
