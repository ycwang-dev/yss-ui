import { ref, type Ref } from 'vue';
import { useResizeObserver } from '@vueuse/core';

/**
 * 布局信息缓存 Hook
 * 缓存 getBoundingClientRect() 结果，避免频繁触发布局重排
 * @param targetRef - 目标元素 ref
 * @returns 缓存的布局信息和更新方法
 */
export const useLayoutCache = (targetRef: Ref<HTMLElement | null>) => {
  /** 缓存的 DOMRect 信息 */
  const cachedRect = ref<DOMRect | null>(null);

  /**
   * 更新布局缓存
   * 仅在必要时调用（如窗口 resize、组件挂载）
   */
  const updateCache = () => {
    if (!targetRef.value) {
      cachedRect.value = null;
      return;
    }
    cachedRect.value = targetRef.value.getBoundingClientRect();
  };

  /**
   * 监听容器尺寸变化，自动更新缓存
   * 使用 @vueuse/core 的 useResizeObserver 优化性能
   */
  useResizeObserver(targetRef, updateCache);

  return {
    cachedRect,
    updateCache,
  };
};
