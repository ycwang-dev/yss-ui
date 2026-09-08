import { ref, watch, type Ref } from 'vue';
import type { YSplitPaneProps } from '../types';
import { clampWidth, loadWidthFromStorage, saveWidthToStorage } from '../constant';

/**
 * 折叠展开逻辑 Hook
 * @param props - 组件 props
 * @param leftWidth - 左侧宽度响应式引用
 * @param isControlled - 是否为受控模式
 * @param emits - 事件触发函数
 * @returns 折叠状态和切换方法
 */
export const useCollapse = (
  props: YSplitPaneProps,
  leftWidth: Ref<number>,
  isControlled: Ref<boolean>,
  emits: {
    (e: 'update:collapsed', v: boolean): void;
    (e: 'update:leftWidth', v: number): void;
    (e: 'update:topHeight', v: number): void;
    (e: 'toggle', v: boolean): void;
  }
) => {
  const isVertical = () => props.direction === 'vertical';
  const getInitialSize = () => {
    if (isVertical()) {
      return props.initialHeight ?? props.topHeight ?? props.minHeight ?? 200;
    }
    return props.initialWidth ?? props.leftWidth ?? props.minWidth ?? 280;
  };
  const getMinSize = () => (isVertical() ? (props.minHeight ?? 200) : (props.minWidth ?? 200));
  const getMaxSize = () => (isVertical() ? (props.maxHeight ?? 480) : (props.maxWidth ?? 480));
  const getRestoredSize = () => {
    // 先用内存缓存；若缓存无效，则回退到 localStorage 缓存
    const memorySize = lastWidth.value;
    if (memorySize > 0) {
      return clampWidth(memorySize, getMinSize(), getMaxSize());
    }
    const fallback = getInitialSize();
    const cachedSize = props.storageKey ? loadWidthFromStorage(props.storageKey, fallback) : fallback;
    return clampWidth(cachedSize, getMinSize(), getMaxSize());
  };
  const emitSizeUpdate = (size: number) => {
    if (isVertical()) {
      emits('update:topHeight', size);
      return;
    }
    emits('update:leftWidth', size);
  };

  /** 折叠状态 */
  const isCollapsed = ref<boolean>(props.collapsed ?? false);

  /** 折叠前的宽度（用于展开时恢复） */
  const lastWidth = ref<number>(getInitialSize());

  /**
   * 同步外部传入的 collapsed 状态
   */
  watch(
    () => props.collapsed,
    newCollapsed => {
      if (newCollapsed === undefined) return;
      isCollapsed.value = newCollapsed;

      if (newCollapsed) {
        // 折叠：记录当前宽度，然后设置为 0
        const currentSize = leftWidth.value;
        if (currentSize > 0) {
          lastWidth.value = currentSize;
          if (props.storageKey) {
            saveWidthToStorage(props.storageKey, currentSize);
          }
        }
        if (!isControlled.value) {
          leftWidth.value = 0;
        }
      } else {
        // 展开：恢复到上次的宽度（约束在 min/max 范围内）
        const restoredWidth = getRestoredSize();
        if (!isControlled.value) {
          leftWidth.value = restoredWidth;
        }
        // 受控模式也主动同步恢复尺寸，避免父组件中的旧值覆盖恢复位置
        emitSizeUpdate(restoredWidth);
      }
    }
  );

  /**
   * 切换折叠状态
   * 响应用户点击切换按钮
   */
  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed.value;
    isCollapsed.value = newCollapsed;

    // 触发事件
    emits('update:collapsed', newCollapsed);
    emits('toggle', newCollapsed);

    if (newCollapsed) {
      // 折叠
      const currentSize = leftWidth.value;
      if (currentSize > 0) {
        lastWidth.value = currentSize;
        if (props.storageKey) {
          saveWidthToStorage(props.storageKey, currentSize);
        }
      }
      if (!isControlled.value) {
        leftWidth.value = 0;
      }
    } else {
      // 展开
      const restoredWidth = getRestoredSize();
      if (!isControlled.value) {
        leftWidth.value = restoredWidth;
      }
      // 展开时始终同步恢复尺寸，确保 vertical 能回到折叠前位置
      emitSizeUpdate(restoredWidth);
    }
  };

  /**
   * 键盘事件处理（Enter 和 Space）
   */
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleCollapse();
    }
  };

  return {
    isCollapsed,
    lastWidth,
    toggleCollapse,
    handleKeydown,
  };
};
