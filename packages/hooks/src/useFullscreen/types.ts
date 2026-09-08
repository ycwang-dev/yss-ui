import type { Ref } from 'vue';

/**
 * 页面全屏配置
 */
export interface PageFullscreenOptions {
  /** 全屏元素的类名 */
  className?: string;
  /** 全屏元素的 z-index */
  zIndex?: number;
}

/**
 * useFullscreen 配置项
 */
export interface UseFullscreenOptions {
  /** 退出全屏时的回调 */
  onExit?: () => void;
  /** 进入全屏时的回调 */
  onEnter?: () => void;
  /** 是否使用页面全屏模式（伪全屏），或传入配置对象 */
  pageFullscreen?: boolean | PageFullscreenOptions;
  /**
   * Esc 键退出提示配置
   * - true: 显示默认提示"若要退出全屏模式，请按 esc"
   * - string: 自定义提示文案
   * - false: 不显示提示
   * @default true
   */
  escTip?: boolean | string;
}

/**
 * 目标元素类型
 */
export type Target = HTMLElement | Ref<HTMLElement | undefined> | (() => HTMLElement | null);

/**
 * useFullscreen 返回值
 */
export interface UseFullscreenReturn {
  /** 是否处于全屏状态 */
  isFullscreen: Readonly<Ref<boolean>>;
  /** 进入全屏 */
  enterFullscreen: () => void;
  /** 退出全屏 */
  exitFullscreen: () => void;
  /** 切换全屏状态 */
  toggleFullscreen: () => void;
  /** 浏览器是否支持全屏 */
  isEnabled: boolean;
}
