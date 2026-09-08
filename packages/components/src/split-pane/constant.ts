/**
 * YSplitPane 组件常量定义
 * @module constant
 */

/** 默认配置常量 */
export const DEFAULT_INITIAL_WIDTH = 280;
export const DEFAULT_MIN_WIDTH = 200;
export const DEFAULT_MAX_WIDTH = 480;
export const DEFAULT_GUTTER_SIZE = 6;
export const DEFAULT_MIN_HEIGHT = 200;
export const DEFAULT_MAX_HEIGHT = 400;

/** 性能优化常量 */
export const MOUSEMOVE_THROTTLE_MS = 16; // 60fps = ~16ms
export const RESIZE_EVENT_THROTTLE_MS = 100; // 降低父组件响应频率
export const HOVER_THRESHOLD_MULTIPLIER = 2; // 悬停检测阈值倍数
/** 与样式中的折叠动画时长保持一致 */
export const PANE_COLLAPSE_TRANSITION_MS = 300;

export const DEFAULT_QUICK_ACTIONS_TOP_OFFSET = -6;
export const DEFAULT_QUICK_ACTIONS_RESET_OFFSET = 0;
export const DEFAULT_QUICK_ACTIONS_BOTTOM_OFFSET = -12;
/**
 * 约束宽度在指定范围内
 * @param width - 待约束的宽度值
 * @param minWidth - 最小宽度
 * @param maxWidth - 最大宽度
 * @returns 约束后的宽度
 */
export const clampWidth = (width: number, minWidth: number, maxWidth: number): number => {
  return Math.max(minWidth, Math.min(width, maxWidth));
};

/**
 * 从 localStorage 读取缓存的宽度值
 * @param key - 存储键名
 * @param fallback - 读取失败时的默认值
 * @returns 缓存的宽度值或默认值
 */
export const loadWidthFromStorage = (key: string, fallback: number): number => {
  if (!key) return fallback;
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return fallback;
    const value = Number(cached);
    return Number.isNaN(value) ? fallback : value;
  } catch {
    return fallback;
  }
};

/**
 * 保存宽度值到 localStorage
 * @param key - 存储键名
 * @param width - 待保存的宽度值
 */
export const saveWidthToStorage = (key: string, width: number): void => {
  if (!key) return;
  try {
    localStorage.setItem(key, String(width));
  } catch (error) {
    console.warn('[YSplitPane] Failed to save width to localStorage:', error);
  }
};
