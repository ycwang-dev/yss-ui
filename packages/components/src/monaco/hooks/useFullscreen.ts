import type { Ref } from 'vue';
import { useLocale } from '../../locale/useLocale';

interface FullscreenTransitionOptions {
  duration?: number;
  easing?: string;
}

/**
 * useFullscreen - 负责容器级"应用内全屏"控制（不进入系统全屏）
 * @param containerRef - 容器引用
 * @param onLayout - 布局回调
 * @param onStatusChange - 状态变更回调
 * @param zIndex - 全屏时的 z-index 层级（默认 10000）
 * @param transitionOptions - 全屏过渡动画配置（false 关闭）
 */
export const useFullscreen = (
  containerRef: Ref<HTMLDivElement | null>,
  onLayout: () => void,
  onStatusChange?: (isFullscreen: boolean) => void,
  zIndex = 10000,
  transitionOptions: boolean | FullscreenTransitionOptions = { duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
) => {
  const { t } = useLocale('monaco');
  let isFullscreen = false;
  let isTransitioning = false;
  let escHandler: ((e: KeyboardEvent) => void) | null = null;
  let fsHintEl: HTMLDivElement | null = null;
  let fsHintTimer: number | null = null;
  let transitionTimer: number | null = null;
  let fullscreenContextKey: any | null = null;
  let prevInlineStyles: {
    position?: string;
    left?: string;
    top?: string;
    width?: string;
    height?: string;
    zIndex?: string;
    transition?: string;
  } | null = null;
  let originalParent: Node | null = null;
  let originalNextSibling: Node | null = null;
  let placeholder: HTMLDivElement | null = null;
  let resizeHandler: (() => void) | null = null;
  let scrollHandler: (() => void) | null = null;

  const getViewportRect = () => ({
    left: 0,
    top: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const isRectValid = (rect: { width: number; height: number; left?: number; top?: number }) => {
    return (
      Number.isFinite(rect.width) &&
      Number.isFinite(rect.height) &&
      Number.isFinite(rect.left ?? 0) &&
      Number.isFinite(rect.top ?? 0) &&
      rect.width > 0 &&
      rect.height > 0
    );
  };

  const isViewportTarget = (target: HTMLElement) => target === document.documentElement || target === document.body;

  const resolveFullscreenTarget = (fullTarget?: HTMLElement | string | null): HTMLElement => {
    if (!fullTarget) return document.documentElement;
    if (typeof fullTarget === 'string') {
      return (document.querySelector(fullTarget) as HTMLElement) || document.documentElement;
    }
    return fullTarget as HTMLElement;
  };

  const resolveTargetRect = (
    target: HTMLElement,
    fallbackRect?: { left: number; top: number; width: number; height: number }
  ) => {
    if (isViewportTarget(target)) return getViewportRect();
    const rect = target.getBoundingClientRect();
    if (!isRectValid(rect)) {
      if (fallbackRect && isRectValid(fallbackRect)) return fallbackRect;
      return getViewportRect();
    }
    return rect;
  };

  const setImportant = (el: HTMLElement, prop: string, value: string) => {
    try {
      el.style.setProperty(prop, value, 'important');
    } catch {
      (el.style as any)[prop as any] = value;
    }
  };

  const setFixedRect = (el: HTMLElement, rect: { left: number; top: number; width: number; height: number }) => {
    setImportant(el, 'position', 'fixed');
    setImportant(el, 'left', `${rect.left}px`);
    setImportant(el, 'top', `${rect.top}px`);
    setImportant(el, 'width', `${rect.width}px`);
    setImportant(el, 'height', `${rect.height}px`);
    setImportant(el, 'z-index', String(zIndex));
  };

  const applyFullscreenRect = (
    el: HTMLElement,
    target: HTMLElement,
    fallbackRect?: { left: number; top: number; width: number; height: number }
  ) => {
    setFixedRect(el, resolveTargetRect(target, fallbackRect));
    el.classList.add('yss-monaco-fullscreen');
  };

  const getTransitionConfig = () => {
    if (transitionOptions === false) return { enabled: false, duration: 0, easing: '' };
    const cfg =
      transitionOptions === true || transitionOptions === null || transitionOptions === undefined
        ? {}
        : transitionOptions;
    const duration = Math.max(0, Number(cfg.duration ?? 220));
    const easing = String(cfg.easing ?? 'cubic-bezier(0.22, 1, 0.36, 1)');
    const reduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return {
      enabled: !reduceMotion && duration > 0,
      duration,
      easing,
    };
  };

  const clearTransitionTimer = () => {
    if (transitionTimer !== null) {
      window.clearTimeout(transitionTimer);
      transitionTimer = null;
    }
  };

  const setTransitionVars = (el: HTMLElement, duration: number, easing: string) => {
    el.style.setProperty('--yss-monaco-fs-duration', `${duration}ms`);
    el.style.setProperty('--yss-monaco-fs-easing', easing);
  };

  const clearTransitionVars = (el: HTMLElement) => {
    el.style.removeProperty('--yss-monaco-fs-duration');
    el.style.removeProperty('--yss-monaco-fs-easing');
  };

  const rectChanged = (
    fromRect: { left: number; top: number; width: number; height: number },
    toRect: { left: number; top: number; width: number; height: number }
  ) => {
    const EPS = 0.5;
    return (
      Math.abs(fromRect.left - toRect.left) > EPS ||
      Math.abs(fromRect.top - toRect.top) > EPS ||
      Math.abs(fromRect.width - toRect.width) > EPS ||
      Math.abs(fromRect.height - toRect.height) > EPS
    );
  };

  const animateRect = (
    el: HTMLElement,
    fromRect: { left: number; top: number; width: number; height: number },
    toRect: { left: number; top: number; width: number; height: number }
  ) => {
    const cfg = getTransitionConfig();
    if (!cfg.enabled || !rectChanged(fromRect, toRect)) {
      setFixedRect(el, toRect);
      return Promise.resolve();
    }

    isTransitioning = true;
    clearTransitionTimer();
    setTransitionVars(el, cfg.duration, cfg.easing);
    el.classList.add('yss-monaco-fullscreen-transitioning');
    setFixedRect(el, fromRect);
    // 强制 reflow，确保 transition 生效
    void el.offsetWidth;

    return new Promise<void>(resolve => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTransitionTimer();
        el.removeEventListener('transitionend', onEnd);
        el.classList.remove('yss-monaco-fullscreen-transitioning');
        clearTransitionVars(el);
        isTransitioning = false;
        resolve();
      };
      const onEnd = (evt: TransitionEvent) => {
        if (evt.target !== el) return;
        finish();
      };

      el.addEventListener('transitionend', onEnd);
      transitionTimer = window.setTimeout(finish, cfg.duration + 120);
      requestAnimationFrame(() => setFixedRect(el, toRect));
    });
  };

  const detachToBody = (el: HTMLElement) => {
    if (!el.parentNode || originalParent) return;
    const rect = el.getBoundingClientRect();
    originalParent = el.parentNode;
    originalNextSibling = el.nextSibling;
    placeholder = document.createElement('div');
    placeholder.className = 'yss-monaco-placeholder';
    placeholder.setAttribute('aria-hidden', 'true');
    if (isRectValid(rect)) {
      placeholder.style.width = `${rect.width}px`;
      placeholder.style.height = `${rect.height}px`;
    }
    placeholder.style.minWidth = '0';
    placeholder.style.minHeight = '0';
    placeholder.style.pointerEvents = 'none';
    placeholder.style.visibility = 'hidden';

    try {
      (originalParent as Node).insertBefore(placeholder, el);
    } catch {}
    document.body.appendChild(el);
  };

  const restoreFromBody = (el: HTMLElement) => {
    if (!originalParent) return;
    try {
      if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
        (originalParent as Node).insertBefore(el, originalNextSibling);
      } else {
        (originalParent as Node).appendChild(el);
      }
      if (placeholder?.parentNode) placeholder.parentNode.removeChild(placeholder);
    } catch {
    } finally {
      originalParent = null;
      originalNextSibling = null;
      placeholder = null;
    }
  };

  const clearFullscreenStyles = (el: HTMLElement) => {
    el.classList.remove('yss-monaco-fullscreen');
    el.classList.remove('yss-monaco-fullscreen-transitioning');
    clearTransitionVars(el);
    if (prevInlineStyles) {
      el.style.position = prevInlineStyles.position ?? '';
      el.style.left = prevInlineStyles.left ?? '';
      el.style.top = prevInlineStyles.top ?? '';
      el.style.width = prevInlineStyles.width ?? '';
      el.style.height = prevInlineStyles.height ?? '';
      el.style.zIndex = prevInlineStyles.zIndex ?? '';
      el.style.transition = prevInlineStyles.transition ?? '';
    } else {
      el.style.position = '';
      el.style.left = '';
      el.style.top = '';
      el.style.width = '';
      el.style.height = '';
      el.style.zIndex = '';
      el.style.transition = '';
    }
    prevInlineStyles = null;
  };

  const removeFullscreenHint = () => {
    if (fsHintTimer !== null) {
      window.clearTimeout(fsHintTimer);
      fsHintTimer = null;
    }
    if (fsHintEl && fsHintEl.parentElement) fsHintEl.parentElement.removeChild(fsHintEl);
    fsHintEl = null;
  };

  const showFullscreenHint = () => {
    const el = containerRef.value;
    if (!el) return;
    removeFullscreenHint();
    const hint = document.createElement('div');
    hint.className = 'yss-monaco-fs-hint';
    hint.innerHTML = t('exitFullscreenHint');
    el.appendChild(hint);
    fsHintEl = hint as HTMLDivElement;
    fsHintTimer = window.setTimeout(() => removeFullscreenHint(), 2600);
  };

  const bindEsc = () => {
    if (escHandler) return;
    escHandler = (e: KeyboardEvent) => {
      if (!isFullscreen || isTransitioning) return;
      const isEsc = e.key === 'Escape' || e.code === 'Escape' || (e as any).keyCode === 27;
      if (!isEsc) return;
      e.preventDefault();
      e.stopPropagation();
      // 调用toggle时传递contextKey，确保Monaco的上下文键状态同步更新
      void toggle({ contextKey: fullscreenContextKey });
    };
    window.addEventListener('keydown', escHandler, true);
  };

  const unbindEsc = () => {
    if (!escHandler) return;
    window.removeEventListener('keydown', escHandler, true);
    escHandler = null;
  };

  const updateRect = (target?: HTMLElement) => {
    if (!isFullscreen || isTransitioning) return;
    const el = containerRef.value;
    if (!el) return;
    const currentRect = el.getBoundingClientRect();
    applyFullscreenRect(el, target ?? document.documentElement, isRectValid(currentRect) ? currentRect : undefined);
    onLayout();
  };

  const toggle = async (opts?: { contextKey?: any; target?: HTMLElement | string | null }) => {
    if (isTransitioning) return;
    const el = containerRef.value;
    if (!el) return;

    isFullscreen = !isFullscreen;
    const targetEl = resolveFullscreenTarget(opts?.target as any);
    const contextKey = opts?.contextKey ?? fullscreenContextKey;

    if (isFullscreen) {
      onStatusChange?.(true);
      prevInlineStyles = {
        position: el.style.position,
        left: el.style.left,
        top: el.style.top,
        width: el.style.width,
        height: el.style.height,
        zIndex: el.style.zIndex,
        transition: el.style.transition,
      };

      const startRect = el.getBoundingClientRect();
      detachToBody(el);
      el.classList.add('yss-monaco-fullscreen');
      const fromRect = isRectValid(startRect) ? startRect : resolveTargetRect(targetEl);
      const toRect = resolveTargetRect(targetEl, fromRect);
      setFixedRect(el, fromRect);
      await animateRect(el, fromRect, toRect);

      const onResize = () => updateRect(targetEl);
      resizeHandler = onResize;
      window.addEventListener('resize', onResize);
      const onScroll = () => updateRect(targetEl);
      scrollHandler = onScroll;
      window.addEventListener('scroll', onScroll, true);

      try {
        contextKey?.set?.(true);
      } catch {}
      bindEsc();
      showFullscreenHint();
    } else {
      onStatusChange?.(false);
      if (resizeHandler) window.removeEventListener('resize', resizeHandler);
      if (scrollHandler) window.removeEventListener('scroll', scrollHandler, true);
      resizeHandler = null;
      scrollHandler = null;

      const startRect = el.getBoundingClientRect();
      const fromRect = isRectValid(startRect)
        ? startRect
        : ({ ...resolveTargetRect(targetEl) } as { left: number; top: number; width: number; height: number });
      const placeholderRect = placeholder?.getBoundingClientRect();
      const toRect = placeholderRect && isRectValid(placeholderRect) ? placeholderRect : fromRect;
      setFixedRect(el, fromRect);
      await animateRect(el, fromRect, toRect);

      clearFullscreenStyles(el);
      restoreFromBody(el);

      try {
        contextKey?.set?.(false);
      } catch {}
      unbindEsc();
      removeFullscreenHint();
    }

    onLayout();
  };

  return {
    toggle,
    updateRect,
    bindEsc,
    unbindEsc,
    setContextKey: (ck: any) => (fullscreenContextKey = ck),
    get isFullscreen() {
      return isFullscreen;
    },
    get isTransitioning() {
      return isTransitioning;
    },
  };
};
