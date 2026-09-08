import { computed, ref, type ComputedRef, type Ref } from 'vue';
import {
  clampWidth,
  DEFAULT_GUTTER_SIZE,
  DEFAULT_QUICK_ACTIONS_BOTTOM_OFFSET,
  DEFAULT_QUICK_ACTIONS_RESET_OFFSET,
  DEFAULT_QUICK_ACTIONS_TOP_OFFSET,
  loadWidthFromStorage,
  saveWidthToStorage,
} from '../constant';

interface UseVerticalQuickActionsOptions {
  showVerticalQuickActions: ComputedRef<boolean>;
  rootRef: Ref<HTMLElement | null>;
  cachedRect: Ref<DOMRect | null>;
  gutterSize?: number;
  draggable?: boolean;
  storageKey?: string;
  getMaxSize: () => number;
  getVerticalInitialHeight: () => number;
  getPaneSize: () => number;
  setPaneSize: (size: number) => void;
  emitTopHeight: (size: number) => void;
}

export const useVerticalQuickActions = ({
  showVerticalQuickActions,
  rootRef,
  cachedRect,
  gutterSize,
  storageKey,
  getMaxSize,
  getVerticalInitialHeight,
  getPaneSize,
  setPaneSize,
  emitTopHeight,
}: UseVerticalQuickActionsOptions) => {
  const verticalViewMode = ref<'normal' | 'top-only' | 'bottom-only'>('normal');
  const quickActionsTopOffset = ref<number>(DEFAULT_QUICK_ACTIONS_TOP_OFFSET);

  const setVerticalPaneSize = (size: number): void => {
    const nextSize = clampWidth(size, size, getMaxSize());
    setPaneSize(nextSize);
    emitTopHeight(nextSize);
  };

  const saveCachedHeight = (height: number): void => {
    if (!storageKey) return;
    saveWidthToStorage(storageKey, height);
  };

  const getVerticalFullSize = (): number => {
    const containerHeight = rootRef.value?.clientHeight ?? cachedRect.value?.height ?? 0;
    const gutter = gutterSize ?? DEFAULT_GUTTER_SIZE;
    return Math.max(0, containerHeight - gutter);
  };

  const hideTopPane = (): void => {
    // 先保存当前上侧高度，供“恢复”按钮使用
    saveCachedHeight(getPaneSize());
    verticalViewMode.value = 'bottom-only';
    quickActionsTopOffset.value = DEFAULT_QUICK_ACTIONS_RESET_OFFSET;
    setVerticalPaneSize(0);
  };

  const resetVerticalPane = (): void => {
    verticalViewMode.value = 'normal';
    quickActionsTopOffset.value = DEFAULT_QUICK_ACTIONS_TOP_OFFSET;
    const fallbackHeight = getVerticalInitialHeight();
    // 新规则：showVerticalQuickActions=true 时，恢复按钮固定回到 initialHeight（不读取缓存）
    const restoredHeight = showVerticalQuickActions.value
      ? fallbackHeight
      : storageKey
        ? loadWidthFromStorage(storageKey, fallbackHeight)
        : fallbackHeight;
    setVerticalPaneSize(restoredHeight);
    // 恢复后也同步写回缓存，保持“按钮点击即持久化”一致性
    saveCachedHeight(restoredHeight);
  };

  const hideBottomPane = (): void => {
    // 先保存当前上侧高度，供“恢复”按钮使用
    saveCachedHeight(getPaneSize());
    verticalViewMode.value = 'top-only';
    quickActionsTopOffset.value = DEFAULT_QUICK_ACTIONS_BOTTOM_OFFSET;
    setVerticalPaneSize(getVerticalFullSize());
  };

  const showHideTopButton = computed(() => showVerticalQuickActions.value && verticalViewMode.value !== 'bottom-only');
  const showResetButton = computed(() => showVerticalQuickActions.value && verticalViewMode.value !== 'normal');
  const showHideBottomButton = computed(() => showVerticalQuickActions.value && verticalViewMode.value !== 'top-only');

  return {
    quickActionsTopOffset,
    hideTopPane,
    resetVerticalPane,
    hideBottomPane,
    showHideTopButton,
    showResetButton,
    showHideBottomButton,
  };
};
