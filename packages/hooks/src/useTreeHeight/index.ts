import { ref, onMounted, onUnmounted, nextTick, type Ref } from 'vue';
import type { UseTreeHeightOptions, UseTreeHeightReturn } from './types';

export type { UseTreeHeightOptions, UseTreeHeightReturn } from './types';

/**
 * YTree 搜索框高度常量
 * @description 当 YTree 启用 filterable 时，内部搜索框会占用固定高度，可通过 extraOffset 传入此值
 */
export const YTREE_SEARCH_HEIGHT = 48;

/**
 * 树高度计算 Hook
 *
 * @description 用于动态计算虚拟滚动树组件的可用高度。
 * 用户传入树区域的 ref（即树的直接父容器），hook 会响应式监听该区域的高度变化。
 * 配合 flex 布局使用，容器会自动填充剩余空间，无需手动计算 offset。
 *
 * @param treeAreaRef - 树区域 DOM 引用（树的直接父容器，建议使用 flex: 1 自动填充）
 * @param options - 配置选项
 * @returns 包含响应式高度值和手动计算方法
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { useTreeHeight } from '@yss-ui/hooks';
 * import { YTree } from '@yss-ui/components';
 *
 * const treeAreaRef = ref<HTMLDivElement>();
 * const { treeHeight } = useTreeHeight(treeAreaRef);
 * </script>
 *
 * <template>
 *   <div class="container" style="height: 400px; display: flex; flex-direction: column;">
 *     <div class="header">下拉框、搜索框等</div>
 *     <div ref="treeAreaRef" style="flex: 1; overflow: hidden;">
 *       <YTree :height="treeHeight" :filterable="false" :tree-data="treeData" />
 *     </div>
 *     <div class="footer">底部按钮等</div>
 *   </div>
 * </template>
 * ```
 */
export const useTreeHeight = (
  treeAreaRef: Ref<HTMLDivElement | undefined>,
  options: UseTreeHeightOptions = {}
): UseTreeHeightReturn => {
  const { minHeight = 200, defaultHeight = 400, extraOffset = 0 } = options;

  /** 响应式树高度 */
  const treeHeight = ref(defaultHeight);

  /** ResizeObserver 实例 */
  let resizeObserver: ResizeObserver | null = null;

  /** 最近一次已处理的容器高度，仅宽度变化时跳过计算。 */
  let lastObservedHeight: number | null = null;

  /** 合并 ResizeObserver 回调的 RAF ID。 */
  let resizeRafId: number | null = null;

  /**
   * 计算树高度
   * @description 直接获取树区域的高度，减去可选的额外偏移量
   */
  const calculateHeight = (observedHeight?: number): void => {
    if (!treeAreaRef.value) return;

    const sourceHeight = observedHeight ?? treeAreaRef.value.getBoundingClientRect().height;
    if (sourceHeight <= 0) return;
    lastObservedHeight = sourceHeight;
    // 直接使用树区域高度，减去可选的额外偏移量
    const height = Math.floor(sourceHeight - extraOffset);
    treeHeight.value = Math.max(minHeight, height);
  };

  /**
   * 初始化 ResizeObserver 监听容器尺寸变化
   */
  const setupObserver = (): void => {
    if (!treeAreaRef.value) return;

    resizeObserver = new ResizeObserver(entries => {
      const observedHeight = entries[0]?.contentRect.height ?? 0;
      if (observedHeight <= 0) return;
      if (lastObservedHeight !== null && Math.abs(lastObservedHeight - observedHeight) < 0.5) return;

      lastObservedHeight = observedHeight;
      if (resizeRafId !== null) window.cancelAnimationFrame(resizeRafId);
      resizeRafId = window.requestAnimationFrame(() => {
        resizeRafId = null;
        calculateHeight(observedHeight);
      });
    });

    resizeObserver.observe(treeAreaRef.value);
  };

  /**
   * 清理 ResizeObserver
   */
  const cleanup = (): void => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (resizeRafId !== null) {
      window.cancelAnimationFrame(resizeRafId);
      resizeRafId = null;
    }
  };

  /** 挂载时初始化 */
  onMounted(() => {
    nextTick(() => {
      calculateHeight();
      setupObserver();
    });
  });

  /** 卸载时清理 */
  onUnmounted(() => {
    cleanup();
  });

  return {
    /** 响应式树高度 */
    treeHeight,
    /** 手动重新计算高度 */
    recalculateHeight: calculateHeight,
  };
};
