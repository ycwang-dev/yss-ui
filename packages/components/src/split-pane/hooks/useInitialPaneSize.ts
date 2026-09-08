import { loadWidthFromStorage } from '../constant';
import type { YSplitPaneProps } from '../types';

interface InitPaneSizeOptions {
  props: YSplitPaneProps;
  isControlled: boolean;
  isCollapsed: boolean;
  setPaneSize: (size: number) => void;
  clampPaneSize: (size: number) => number;
  getVerticalInitialHeight: () => number;
  emitTopHeight: (size: number) => void;
}

/**
 * 初始化分割尺寸
 * 将 vertical/horizontal 的初始化与缓存恢复逻辑集中在一个方法中
 */
export const initPaneSize = ({
  props,
  isControlled,
  isCollapsed,
  setPaneSize,
  clampPaneSize,
  getVerticalInitialHeight,
  emitTopHeight,
}: InitPaneSizeOptions): void => {
  // vertical 初始化优先级：
  // 1) 默认使用 initialHeight（或回退值）
  // 2) 若存在本地缓存（代表用户拖拽过），优先使用缓存
  if (props.direction === 'vertical') {
    const initialHeight = clampPaneSize(props.initialHeight ?? getVerticalInitialHeight());
    setPaneSize(initialHeight);
    if (isControlled && props.topHeight !== initialHeight) {
      emitTopHeight(initialHeight);
    }
    if (!isControlled && props.storageKey) {
      const cachedHeight = loadWidthFromStorage(props.storageKey, initialHeight);
      setPaneSize(clampPaneSize(cachedHeight));
    }
  } else if (!isControlled && props.storageKey) {
    // horizontal 非受控下读取缓存
    const cachedWidth = clampPaneSize(loadWidthFromStorage(props.storageKey, props.initialWidth ?? 200));
    setPaneSize(cachedWidth);
  }

  // 如果初始为折叠状态，设置尺寸为 0
  if (!isControlled && isCollapsed) {
    setPaneSize(0);
  }
};
