import { ref, onMounted, onUnmounted, readonly } from 'vue';
import { unrefElement } from '@vueuse/core';
import screenfull from 'screenfull';
import type { Target, UseFullscreenOptions, UseFullscreenReturn } from './types';

/**
 * 判断是否为布尔值
 */
const isBoolean = (val: unknown): val is boolean => typeof val === 'boolean';

/**
 * 管理 DOM 全屏的 Hook
 *
 * @param target - 需要全屏的目标元素
 * @param options - 配置选项
 * @returns 全屏状态和控制方法
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { useFullscreen } from '@yss-ui/hooks';
 *
 * const containerRef = ref<HTMLElement>();
 * const { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen } = useFullscreen(containerRef);
 * </script>
 *
 * <template>
 *   <div ref="containerRef">
 *     <p>{{ isFullscreen ? '全屏中' : '未全屏' }}</p>
 *     <button @click="toggleFullscreen">切换全屏</button>
 *   </div>
 * </template>
 * ```
 */
export const useFullscreen = (target: Target, options?: UseFullscreenOptions): UseFullscreenReturn => {
  const { onExit, onEnter, pageFullscreen = false, escTip = true } = options || {};

  // 页面全屏配置
  const { className = 'yss-page-fullscreen', zIndex = 999999 } =
    isBoolean(pageFullscreen) || !pageFullscreen ? {} : pageFullscreen;

  // 全屏状态
  const isFullscreen = ref(false);

  // Esc 提示元素的 ID
  const ESC_TIP_ID = 'yss-fullscreen-esc-tip';

  /**
   * 获取目标元素
   */
  const getTargetElement = (): HTMLElement | null | undefined => {
    if (typeof target === 'function') {
      return target();
    }
    return unrefElement(target);
  };

  /**
   * 判断当前元素是否处于全屏状态
   */
  const getIsFullscreen = (): boolean => {
    const el = getTargetElement();
    if (!el) return false;

    return screenfull.isEnabled && !!screenfull.element && screenfull.element === el;
  };

  /**
   * 创建 Esc 键退出提示
   */
  const createEscTip = () => {
    if (!escTip) return;

    // 如果已存在则不重复创建
    if (document.getElementById(ESC_TIP_ID)) return;

    const tipText = typeof escTip === 'string' ? escTip : '若要退出全屏模式，请按 esc';

    const tipElement = document.createElement('div');
    tipElement.id = ESC_TIP_ID;
    tipElement.innerHTML = `
      <span>${tipText}</span>
      <kbd>esc</kbd>
    `;

    // 添加样式
    tipElement.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999999;
      background: rgba(30, 35, 45, 0.95);
      color: #fff;
      padding: 12px 24px;
      border-radius: 4px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      animation: yss-esc-tip-fadein 0.3s ease-out;
    `;

    // 为 kbd 标签添加样式
    const kbdStyle = document.createElement('style');
    kbdStyle.textContent = `
      @keyframes yss-esc-tip-fadein {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
      #${ESC_TIP_ID} kbd {
        display: inline-block;
        padding: 2px 8px;
        font-size: 12px;
        font-family: monospace;
        line-height: 1.4;
        color: #333;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 3px;
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
      }
    `;

    document.head.appendChild(kbdStyle);
    document.body.appendChild(tipElement);

    // 2秒后自动隐藏
    setTimeout(() => {
      removeEscTip();
    }, 2000);
  };

  /**
   * 移除 Esc 键退出提示
   */
  const removeEscTip = () => {
    const tipElement = document.getElementById(ESC_TIP_ID);
    if (tipElement) {
      tipElement.remove();
    }
  };

  /**
   * 调用回调函数
   */
  const invokeCallback = (fullscreen: boolean) => {
    if (fullscreen) {
      onEnter?.();
    } else {
      onExit?.();
    }
  };

  /**
   * 更新全屏状态
   */
  const updateFullscreenState = (fullscreen: boolean) => {
    if (isFullscreen.value !== fullscreen) {
      invokeCallback(fullscreen);
      isFullscreen.value = fullscreen;
    }
  };

  /**
   * screenfull change 事件处理
   */
  const onScreenfullChange = () => {
    const fullscreen = getIsFullscreen();
    updateFullscreenState(fullscreen);
  };

  /**
   * 切换页面全屏状态
   */
  const togglePageFullscreen = (fullscreen: boolean) => {
    const el = getTargetElement();
    if (!el) return;

    let styleElem = document.getElementById(className);

    if (fullscreen) {
      el.classList.add(className);

      if (!styleElem) {
        styleElem = document.createElement('style');
        styleElem.setAttribute('id', className);
        styleElem.textContent = `
          .${className} {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: ${zIndex} !important;
          }`;
        el.appendChild(styleElem);
      }
    } else {
      el.classList.remove(className);

      if (styleElem) {
        styleElem.remove();
      }
    }

    updateFullscreenState(fullscreen);
  };

  /**
   * 进入全屏
   */
  const enterFullscreen = () => {
    const el = getTargetElement();
    if (!el) return;

    if (pageFullscreen) {
      togglePageFullscreen(true);
      createEscTip();
      return;
    }

    if (screenfull.isEnabled) {
      try {
        screenfull.request(el);
        createEscTip();
      } catch (error) {
        console.error('进入全屏失败:', error);
      }
    }
  };

  /**
   * 退出全屏
   */
  const exitFullscreen = () => {
    const el = getTargetElement();
    if (!el) return;

    // 移除提示
    removeEscTip();

    if (pageFullscreen) {
      togglePageFullscreen(false);
      return;
    }

    if (screenfull.isEnabled && screenfull.element === el) {
      screenfull.exit();
    }
  };

  /**
   * 切换全屏状态
   */
  const toggleFullscreen = () => {
    if (isFullscreen.value) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  /**
   * 处理键盘事件（Esc 键退出全屏）
   */
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isFullscreen.value) {
      exitFullscreen();
    }
  };

  // 监听 screenfull 的 change 事件
  onMounted(() => {
    // 浏览器全屏模式：监听 screenfull 的 change 事件
    if (screenfull.isEnabled && !pageFullscreen) {
      screenfull.on('change', onScreenfullChange);
    }

    // 页面全屏模式：监听 Esc 键
    if (pageFullscreen) {
      document.addEventListener('keydown', onKeyDown);
    }
  });

  // 清理事件监听
  onUnmounted(() => {
    // 清理 screenfull 事件监听
    if (screenfull.isEnabled && !pageFullscreen) {
      screenfull.off('change', onScreenfullChange);
    }

    // 清理键盘事件监听
    if (pageFullscreen) {
      document.removeEventListener('keydown', onKeyDown);
    }
  });

  return {
    isFullscreen: readonly(isFullscreen),
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    isEnabled: screenfull.isEnabled,
  };
};
