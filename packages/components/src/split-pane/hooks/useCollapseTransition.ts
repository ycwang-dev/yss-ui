import { computed, nextTick, onBeforeUnmount, ref, watch, type ComputedRef, type Ref } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { PANE_COLLAPSE_TRANSITION_MS } from '../constant';
import type { YSplitPaneCollapseAnimation, YSplitPaneProps } from '../types';

/** SplitPane 折叠过渡阶段。 */
export type CollapseTransitionPhase = 'idle' | 'collapsing' | 'expanding';

/** 折叠过渡 Hook 参数。 */
interface UseCollapseTransitionOptions {
  props: YSplitPaneProps;
  isCollapsed: Ref<boolean>;
  isVertical: ComputedRef<boolean>;
  getTransitionSize: () => number;
}

/** 折叠过渡结束兜底延迟。 */
const TRANSITION_FALLBACK_DELAY_MS = PANE_COLLAPSE_TRANSITION_MS + 80;

/**
 * 管理 SplitPane 的目标折叠状态、真实布局状态与内容保留时机。
 * @param options - 折叠过渡配置
 * @returns 折叠过渡状态与完成方法
 */
export const useCollapseTransition = ({
  props,
  isCollapsed,
  isVertical,
  getTransitionSize,
}: UseCollapseTransitionOptions) => {
  /** 系统是否要求减少动态效果。 */
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  /** 实际采用的折叠动画模式。 */
  const effectiveAnimation = computed<YSplitPaneCollapseAnimation>(() =>
    prefersReducedMotion.value ? 'none' : (props.collapseAnimation ?? 'size')
  );

  /** 当前参与 flex 布局的折叠状态。 */
  const layoutCollapsed = ref(isCollapsed.value);

  /** 当前折叠过渡阶段。 */
  const transitionPhase = ref<CollapseTransitionPhase>('idle');

  /** transform 初始态是否已切换为运动终态。 */
  const transitionActive = ref(false);

  /** 本次过渡使用的稳定面板尺寸。 */
  const transitionSize = ref(Math.max(0, getTransitionSize()));

  /** 面板内容是否保留在 DOM 中。 */
  const paneContentRendered = ref(!isCollapsed.value || !props.destroyOnCollapse);

  /** 面板内容是否参与显示。 */
  const paneContentVisible = ref(!isCollapsed.value);

  /** 当前过渡要完成的目标状态。 */
  const transitionTarget = ref<boolean | null>(null);

  /** 过渡期间收到的最新目标状态。 */
  const pendingCollapsed = ref<boolean | null>(null);

  /** 是否正在执行折叠过渡。 */
  const isTransitioning = computed(() => transitionPhase.value !== 'idle');

  /** 动画兜底定时器。 */
  let transitionTimer: number | null = null;

  /** transform 启动 RAF。 */
  let transitionRaf: number | null = null;

  /** 清理折叠过渡异步任务。 */
  const clearTransitionTasks = (): void => {
    if (transitionTimer !== null) {
      window.clearTimeout(transitionTimer);
      transitionTimer = null;
    }
    if (transitionRaf !== null) {
      window.cancelAnimationFrame(transitionRaf);
      transitionRaf = null;
    }
  };

  /** 按最终折叠状态同步内容显示与卸载策略。 */
  const syncContentState = (collapsed: boolean): void => {
    if (collapsed) {
      paneContentVisible.value = false;
      paneContentRendered.value = !props.destroyOnCollapse;
      return;
    }
    paneContentRendered.value = true;
    paneContentVisible.value = true;
  };

  /** 启动过渡结束兜底定时器。 */
  const scheduleTransitionFallback = (): void => {
    if (transitionTimer !== null) window.clearTimeout(transitionTimer);
    transitionTimer = window.setTimeout(() => {
      transitionTimer = null;
      completeTransition();
    }, TRANSITION_FALLBACK_DELAY_MS);
  };

  /**
   * 立即落定到指定折叠状态。
   * @param collapsed - 最终折叠状态
   */
  const settleImmediately = (collapsed: boolean): void => {
    clearTransitionTasks();
    transitionPhase.value = 'idle';
    transitionActive.value = false;
    transitionTarget.value = null;
    pendingCollapsed.value = null;
    layoutCollapsed.value = collapsed;
    syncContentState(collapsed);
  };

  /**
   * 启动指定目标的折叠过渡。
   * @param collapsed - 目标折叠状态
   */
  const startTransition = (collapsed: boolean): void => {
    if (isTransitioning.value) {
      if (transitionTarget.value !== collapsed) pendingCollapsed.value = collapsed;
      return;
    }

    const animation = effectiveAnimation.value;
    if (animation === 'none') {
      settleImmediately(collapsed);
      return;
    }

    transitionTarget.value = collapsed;
    transitionPhase.value = collapsed ? 'collapsing' : 'expanding';
    transitionActive.value = false;
    transitionSize.value = Math.max(0, getTransitionSize());
    paneContentRendered.value = true;
    paneContentVisible.value = true;

    if (animation === 'size') {
      layoutCollapsed.value = collapsed;
      scheduleTransitionFallback();
      return;
    }

    // transform 模式在过渡期间保持起始布局，仅在完成时提交最终 flex 布局。
    layoutCollapsed.value = !collapsed;
    void nextTick(() => {
      if (transitionTarget.value !== collapsed || transitionPhase.value === 'idle') return;
      transitionRaf = window.requestAnimationFrame(() => {
        transitionRaf = null;
        transitionActive.value = true;
        scheduleTransitionFallback();
      });
    });
  };

  /** 完成当前过渡并处理过渡期间排队的目标状态。 */
  const completeTransition = (): void => {
    const completedTarget = transitionTarget.value;
    if (completedTarget === null) return;

    clearTransitionTasks();
    layoutCollapsed.value = completedTarget;
    transitionPhase.value = 'idle';
    transitionActive.value = false;
    transitionTarget.value = null;
    syncContentState(completedTarget);

    const queuedTarget = pendingCollapsed.value;
    pendingCollapsed.value = null;
    if (queuedTarget !== null && queuedTarget !== completedTarget) {
      void nextTick(() => startTransition(queuedTarget));
    }
  };

  watch(isCollapsed, startTransition);

  watch(effectiveAnimation, () => {
    settleImmediately(isCollapsed.value);
  });

  watch(isVertical, () => {
    settleImmediately(isCollapsed.value);
  });

  watch(
    () => props.destroyOnCollapse,
    () => {
      if (!isTransitioning.value) syncContentState(isCollapsed.value);
    }
  );

  onBeforeUnmount(() => {
    clearTransitionTasks();
  });

  return {
    effectiveAnimation,
    layoutCollapsed,
    transitionPhase,
    transitionActive,
    transitionSize,
    paneContentRendered,
    paneContentVisible,
    isTransitioning,
    completeTransition,
  };
};
