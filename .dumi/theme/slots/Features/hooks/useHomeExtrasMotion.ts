import type React from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../../../motion/gsap';

/** 首页补充区块动效 Hook 参数。 */
interface HomeExtrasMotionOptions {
  scopeRef: React.RefObject<HTMLDivElement | null>;
}

/** 通用揭示元素选择器。 */
const REVEAL_SELECTOR = '[data-reveal]';

/** 控制各补充区块内的无限 CSS 动画，仅在区块位于视口时运行。 */
const addSectionAnimationVisibility = (scope: HTMLElement): (() => void) => {
  const sections = gsap.utils.toArray<HTMLElement>('[data-extras-section]', scope);

  sections.forEach(section => {
    /** 同步当前区块内无限动画的播放状态。 */
    const syncMotionState = (isActive: boolean) => {
      section.classList.toggle('is-motion-active', isActive);
    };
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: self => syncMotionState(self.isActive),
      onRefresh: self => syncMotionState(self.isActive),
    });
    syncMotionState(trigger.isActive);
  });

  return () => sections.forEach(section => section.classList.remove('is-motion-active'));
};

/** 各区块通用的进入揭示：淡入 + 上移 + 错峰。 */
const addSectionReveals = (scope: HTMLElement) => {
  gsap.utils.toArray<HTMLElement>('[data-extras-section]', scope).forEach(section => {
    const targets = section.querySelectorAll(REVEAL_SELECTOR);
    if (!targets.length) return;
    gsap.from(targets, {
      autoAlpha: 0,
      y: 34,
      duration: 0.75,
      ease: 'power3.out',
      stagger: 0.09,
      clearProps: 'all',
      scrollTrigger: { trigger: section, start: 'top 80%', once: true },
    });
  });
};

/** 指标带数字滚动计数，进入视口播放一次。 */
const addStatsCounters = (scope: HTMLElement) => {
  const section = scope.querySelector<HTMLElement>('[data-extras-section="stats"]');
  if (!section) return;

  gsap.utils.toArray<HTMLElement>('strong[data-counter-value]', section).forEach((el, order) => {
    const target = Number.parseFloat(el.dataset.counterValue || '0');
    const suffix = el.dataset.counterSuffix || '';
    const proxy = { value: 0 };

    gsap.to(proxy, {
      value: target,
      duration: 1.25,
      delay: 0.15 + order * 0.08,
      ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 84%', once: true },
      onStart: () => {
        el.textContent = `0${suffix}`;
      },
      onUpdate: () => {
        el.textContent = `${Math.round(proxy.value)}${suffix}`;
      },
    });
  });
};

/** 快速接入命令的打字机效果，进入视口逐条敲出。 */
const addCommandTyping = (scope: HTMLElement) => {
  const section = scope.querySelector<HTMLElement>('[data-extras-section="quickstart"]');
  if (!section) return;

  gsap.utils.toArray<HTMLElement>('code[data-command]', section).forEach((el, order) => {
    const full = el.dataset.command || '';
    const proxy = { count: 0 };
    el.textContent = '';

    gsap.to(proxy, {
      count: full.length,
      duration: Math.min(0.35 + full.length * 0.03, 1.35),
      delay: 0.45 + order * 0.22,
      ease: 'none',
      snap: { count: 1 },
      scrollTrigger: { trigger: section, start: 'top 78%', once: true },
      onUpdate: () => {
        el.textContent = full.slice(0, Math.round(proxy.count));
      },
    });
  });
};

/** 工具矩阵双向跑马灯：离屏暂停，悬停减速营造可读的“慢镜头”。 */
const addToolsMarquee = (scope: HTMLElement): (() => void) | undefined => {
  const section = scope.querySelector<HTMLElement>('[data-extras-section="tools"]');
  if (!section) return undefined;

  const marqueeTweens = gsap.utils.toArray<HTMLElement>('.yss-tools-row__track', section).map(track => {
    const reversed = track.closest<HTMLElement>('.yss-tools-row')?.dataset.direction === 'right';
    return gsap.fromTo(
      track,
      { xPercent: reversed ? -50 : 0 },
      { xPercent: reversed ? 0 : -50, duration: 38, ease: 'none', repeat: -1, paused: true }
    );
  });
  if (!marqueeTweens.length) return undefined;

  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: self => marqueeTweens.forEach(tween => (self.isActive ? tween.play() : tween.pause())),
  });

  const rows = section.querySelector<HTMLElement>('.yss-tools-rows');
  const slowDown = () =>
    marqueeTweens.forEach(tween =>
      gsap.to(tween, { timeScale: 0.14, duration: 0.6, ease: 'power2.out', overwrite: true })
    );
  const resume = () =>
    marqueeTweens.forEach(tween =>
      gsap.to(tween, { timeScale: 1, duration: 0.9, ease: 'power2.out', overwrite: true })
    );

  rows?.addEventListener('pointerenter', slowDown);
  rows?.addEventListener('pointerleave', resume);

  return () => {
    rows?.removeEventListener('pointerenter', slowDown);
    rows?.removeEventListener('pointerleave', resume);
  };
};

/** 收口 CTA：面板轻微缩放入场 + 标题行遮罩揭示。 */
const addCtaReveal = (scope: HTMLElement) => {
  const section = scope.querySelector<HTMLElement>('[data-extras-section="cta"]');
  if (!section) return;

  const panel = section.querySelector('[data-cta-panel]');
  if (panel) {
    gsap.from(panel, {
      autoAlpha: 0,
      y: 46,
      scale: 0.968,
      duration: 0.9,
      ease: 'power3.out',
      clearProps: 'all',
      scrollTrigger: { trigger: section, start: 'top 82%', once: true },
    });
  }

  const lines = section.querySelectorAll('[data-reveal-line] > span');
  if (lines.length) {
    gsap.from(lines, {
      yPercent: 112,
      duration: 0.85,
      delay: 0.12,
      ease: 'power4.out',
      stagger: 0.11,
      clearProps: 'transform',
      scrollTrigger: { trigger: section, start: 'top 82%', once: true },
    });
  }
};

/** 编排首页补充区块的滚动入场、计数、打字机与跑马灯动效。 */
export const useHomeExtrasMotion = ({ scopeRef }: HomeExtrasMotionOptions): void => {
  useGSAP(
    () => {
      const scope = scopeRef.current;
      if (!scope) return undefined;

      const media = gsap.matchMedia();

      media.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          reduce: '(prefers-reduced-motion: reduce)',
        },
        context => {
          if (context.conditions?.reduce) {
            gsap.set(scope.querySelectorAll(`${REVEAL_SELECTOR}, [data-reveal-line] > span, [data-cta-panel]`), {
              clearProps: 'all',
              autoAlpha: 1,
              y: 0,
            });
            return undefined;
          }

          addSectionReveals(scope);
          addStatsCounters(scope);
          addCommandTyping(scope);
          const cleanupAnimationVisibility = addSectionAnimationVisibility(scope);
          const cleanupMarquee = addToolsMarquee(scope);
          addCtaReveal(scope);

          // 上方存在 pin 展厅，Hook 执行顺序与页面顺序不同，显式按位置重排刷新序
          ScrollTrigger.sort();

          return () => {
            cleanupMarquee?.();
            cleanupAnimationVisibility();
          };
        }
      );

      return () => media.revert();
    },
    { scope: scopeRef }
  );
};
