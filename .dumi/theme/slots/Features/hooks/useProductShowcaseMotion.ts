import type React from 'react';
import { useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../../../motion/gsap';

/** 产品展厅动效 Hook 参数。 */
interface ProductShowcaseMotionOptions {
  scopeRef: React.RefObject<HTMLElement | null>;
  chapterCount: number;
}

/** 产品展厅动效 Hook 返回值。 */
export interface ProductShowcaseMotionResult {
  activeIndex: number;
  selectChapter: (index: number) => void;
}

/** 单章时间线长度，用于均匀分配四个独立展厅。 */
const CHAPTER_DURATION = 1.15;

/** 章节导航落在功能演示稳定段，避开入场和退场交界。 */
const CHAPTER_FOCUS_OFFSET = 0.78;

/** 下一展厅提前进入，与上一展厅退场形成连续交叠。 */
const CHAPTER_TRANSITION_OVERLAP = 0.24;

/** 在交叠前短暂预热下一场景，摊开内容恢复与图层创建的单帧开销。 */
const CHAPTER_RENDER_PREWARM = 0.12;

/** 等待字体和非懒加载图片就绪后刷新滚动测量。 */
const refreshAfterAssetsReady = async (scope: HTMLElement, isCancelled: () => boolean) => {
  const imageTasks = Array.from(scope.querySelectorAll('img')).map(image => {
    if (image.loading === 'lazy' || image.complete) return image.decode?.().catch(() => undefined);
    return new Promise<void>(resolve => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => resolve(), { once: true });
    });
  });
  const fontTask = document.fonts?.ready ?? Promise.resolve();

  await Promise.allSettled([fontTask, ...imageTasks]);
  if (!isCancelled()) requestAnimationFrame(() => ScrollTrigger.refresh());
};

/** 首访播放一次组件章统计数字滚动，不参与滚动 scrub，保证静止帧始终可读。 */
const playComponentCounters = (scope: HTMLElement) => {
  gsap.utils.toArray<HTMLElement>('.yss-components-stat strong[data-counter-value]', scope).forEach((el, order) => {
    const target = Number.parseFloat(el.dataset.counterValue || '0');
    const decimals = Number.parseInt(el.dataset.counterDecimals || '0', 10);
    const suffix = el.dataset.counterSuffix || '';
    const proxy = { value: 0 };

    gsap.to(proxy, {
      value: target,
      duration: 1.15,
      delay: 0.35 + order * 0.12,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = `${proxy.value.toFixed(decimals)}${suffix}`;
      },
    });
  });
};

/** 为组件展厅追加页面模块装配动画。 */
const addComponentDetailMotion = (timeline: ReturnType<typeof gsap.timeline>, position: number) => {
  timeline
    .fromTo(
      '.yss-showcase-scene--components .yss-components-module:not(.yss-components-drawer)',
      { autoAlpha: 1, y: 8, scale: 0.99 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, stagger: 0.045, ease: 'power2.out' },
      position + 0.18
    )
    .fromTo(
      '.yss-showcase-scene--components .yss-components-row',
      { autoAlpha: 1, x: 10 },
      { autoAlpha: 1, x: 0, duration: 0.22, stagger: 0.045, ease: 'power2.out' },
      position + 0.42
    );
};

/** 为 Hooks 展厅追加尺寸测量、代码高亮和加载态动画。 */
const addHooksDetailMotion = (timeline: ReturnType<typeof gsap.timeline>, position: number) => {
  timeline
    .fromTo(
      '.yss-showcase-scene--hooks .yss-hook-mechanic',
      { autoAlpha: 0, y: -14 },
      { autoAlpha: 1, y: 0, duration: 0.24, stagger: 0.045, ease: 'power2.out' },
      position + 0.14
    )
    .fromTo(
      '.yss-showcase-scene--hooks .yss-hook-window',
      { autoAlpha: 0, scaleY: 0.86 },
      { autoAlpha: 1, scaleY: 1, transformOrigin: 'bottom center', duration: 0.36, ease: 'power2.out' },
      position + 0.2
    )
    .fromTo(
      '.yss-showcase-scene--hooks .yss-hook-ruler--x i',
      { scaleX: 0 },
      { scaleX: 1, transformOrigin: 'left center', duration: 0.36, ease: 'none' },
      position + 0.22
    )
    .fromTo(
      '.yss-showcase-scene--hooks .yss-hook-ruler--y i',
      { scaleY: 0 },
      { scaleY: 1, transformOrigin: 'top center', duration: 0.36, ease: 'none' },
      position + 0.22
    )
    .fromTo(
      '.yss-showcase-scene--hooks .yss-hook-code-line',
      { autoAlpha: 0, x: 20 },
      { autoAlpha: 1, x: 0, duration: 0.2, stagger: 0.035, ease: 'power2.out' },
      position + 0.42
    )
    .fromTo(
      '.yss-showcase-scene--hooks .yss-hook-loading-state',
      { autoAlpha: 0, scale: 0.92 },
      { autoAlpha: 1, scale: 1, duration: 0.16, ease: 'power2.out' },
      position + 0.52
    )
    .to(
      '.yss-showcase-scene--hooks .yss-hook-loading-state',
      { autoAlpha: 0, scale: 1.04, duration: 0.16, ease: 'power2.in' },
      position + 0.7
    );
};

/** 为 Utils 展厅追加数据输入、节点处理和结果输出动画。 */
const addUtilsDetailMotion = (timeline: ReturnType<typeof gsap.timeline>, position: number) => {
  timeline
    .fromTo(
      '.yss-showcase-scene--utils .yss-utils-pipeline__source',
      { autoAlpha: 0, x: -24 },
      { autoAlpha: 1, x: 0, duration: 0.28, ease: 'power2.out' },
      position + 0.14
    )
    .fromTo(
      '.yss-showcase-scene--utils .yss-utils-route-progress',
      { scaleX: 0 },
      { scaleX: 1, transformOrigin: 'left center', duration: 0.56, ease: 'none' },
      position + 0.22
    )
    .fromTo(
      '.yss-showcase-scene--utils .yss-utils-node',
      { autoAlpha: 0, y: 22, scale: 0.94 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, stagger: 0.06, ease: 'back.out(1.4)' },
      position + 0.26
    )
    .fromTo(
      '.yss-showcase-scene--utils .yss-utils-pipeline__result',
      { autoAlpha: 0, x: 24 },
      { autoAlpha: 1, x: 0, duration: 0.28, ease: 'power2.out' },
      position + 0.56
    );
};

/** 为 AI 生态展厅追加通道接入、会话流与交付校验动画。 */
const addSkillsDetailMotion = (timeline: ReturnType<typeof gsap.timeline>, position: number) => {
  timeline
    .fromTo(
      '.yss-showcase-scene--skills .yss-ai-channel',
      { autoAlpha: 0, x: -22 },
      { autoAlpha: 1, x: 0, duration: 0.24, stagger: 0.08, ease: 'power2.out' },
      position + 0.14
    )
    .fromTo(
      '.yss-showcase-scene--skills .yss-ai-channel__beam',
      { scaleX: 0 },
      { scaleX: 1, transformOrigin: 'left center', duration: 0.22, stagger: 0.08, ease: 'none' },
      position + 0.24
    )
    .fromTo(
      '.yss-showcase-scene--skills .yss-ai-session',
      { autoAlpha: 0, x: 26, scale: 0.97 },
      { autoAlpha: 1, x: 0, scale: 1, duration: 0.3, ease: 'power2.out' },
      position + 0.3
    )
    .fromTo(
      '.yss-showcase-scene--skills .yss-ai-session__line',
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.18, stagger: 0.055, ease: 'power2.out' },
      position + 0.42
    )
    .fromTo(
      '.yss-showcase-scene--skills .yss-ai-verdict',
      { autoAlpha: 0, y: 14, scale: 0.97 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.22, ease: 'power2.out' },
      position + 0.72
    );
};

/** 构建首页四章产品展厅的主滚动编排和紧凑端降级。 */
export const useProductShowcaseMotion = ({
  scopeRef,
  chapterCount,
}: ProductShowcaseMotionOptions): ProductShowcaseMotionResult => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const timelineRef = useRef<ReturnType<typeof gsap.timeline> | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  const { contextSafe } = useGSAP(
    () => {
      const scope = scopeRef.current;
      if (!scope || !chapterCount) return undefined;

      const pin = scope.querySelector<HTMLElement>('.yss-showcase-pin');
      const fallback = scope.querySelector<HTMLElement>('.yss-workbench-fallback');
      let cancelled = false;
      const media = gsap.matchMedia();

      media.add(
        {
          desktop: '(min-width: 1200px)',
          compact: '(max-width: 1199px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        context => {
          const { desktop, reduceMotion } = context.conditions || {};

          if (reduceMotion) {
            gsap.set('.yss-workbench-heading > *, .yss-workbench-card', {
              clearProps: 'all',
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
            });
            return undefined;
          }

          if (desktop && pin) {
            const totalDuration = (chapterCount - 1) * CHAPTER_DURATION + 1;
            const scenes = gsap.utils.toArray<HTMLElement>('.yss-showcase-scene');
            const auroras = gsap.utils.toArray<HTMLElement>('.yss-showcase-aurora');
            const watermarks = gsap.utils.toArray<HTMLElement>('.yss-showcase-scene__watermark');
            const visualMotions = gsap.utils.toArray<HTMLElement>('.yss-showcase-scene__visual-motion');
            const progress = scope.querySelector<HTMLElement>('.yss-showcase-rail__progress i');
            const scenesWrap = scope.querySelector<HTMLElement>('.yss-showcase-scenes');

            // pin 之前的“工作台升起就位”衔接：随滚动从轻微下沉透视状态归位
            if (scenesWrap) {
              gsap.fromTo(
                scenesWrap,
                { y: 84, scale: 0.952, rotationX: 5.5, transformPerspective: 1200, transformOrigin: 'center 85%' },
                {
                  y: 0,
                  scale: 1,
                  rotationX: 0,
                  ease: 'none',
                  scrollTrigger: {
                    id: 'yss-showcase-dock',
                    trigger: scope,
                    start: 'top 98%',
                    end: 'top 76px',
                    scrub: 0.6,
                    invalidateOnRefresh: true,
                  },
                }
              );
            }

            playComponentCounters(scope);

            gsap.set(scenes, {
              autoAlpha: 0,
              y: 36,
              scale: 1.04,
              pointerEvents: 'none',
              contentVisibility: 'hidden',
              willChange: 'auto',
            });
            gsap.set(auroras, { autoAlpha: 0, scale: 1.08, xPercent: 3, willChange: 'auto' });
            gsap.set(visualMotions, { willChange: 'auto' });
            gsap.set(watermarks, { x: 0, willChange: 'auto' });
            if (progress) gsap.set(progress, { willChange: 'transform' });
            gsap.set(scenes[0], {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              pointerEvents: 'auto',
              contentVisibility: 'visible',
              willChange: 'transform, opacity',
            });
            gsap.set(auroras[0], { autoAlpha: 1, scale: 1, xPercent: 0, willChange: 'transform, opacity' });
            gsap.set(visualMotions[0], { willChange: 'transform, opacity' });
            gsap.set(watermarks[0], { willChange: 'transform' });

            const timeline = gsap.timeline({
              defaults: { ease: 'power2.out' },
              scrollTrigger: {
                id: 'yss-product-showcase',
                trigger: scope,
                start: 'top 76px',
                end: () => `+=${Math.max(window.innerHeight * 4.5, 3000)}`,
                pin,
                scrub: 0.8,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: self => {
                  const currentTime = self.progress * timeline.duration();
                  let nextIndex = 0;
                  for (let index = 1; index < chapterCount; index += 1) {
                    if (currentTime >= timeline.labels[`scene-${index}`]) nextIndex = index;
                  }
                  if (nextIndex !== activeIndexRef.current) {
                    activeIndexRef.current = nextIndex;
                    setActiveIndex(nextIndex);
                  }
                },
              },
            });

            timelineRef.current = timeline;
            triggerRef.current = timeline.scrollTrigger || null;

            if (progress) {
              timeline.fromTo(
                progress,
                { scaleX: 0 },
                { scaleX: 1, duration: totalDuration, transformOrigin: 'left center', ease: 'none' },
                0
              );
            }

            if (watermarks.length) {
              timeline.fromTo(watermarks, { x: 0 }, { x: -72, duration: totalDuration, ease: 'none' }, 0);
            }

            scenes.forEach((scene, index) => {
              const position = index * CHAPTER_DURATION;
              const transitionPosition = index > 0 ? position - CHAPTER_TRANSITION_OVERLAP : position;
              const renderPreparationPosition = Math.max(transitionPosition - CHAPTER_RENDER_PREWARM, 0);
              const contentPosition = index > 0 ? position - CHAPTER_TRANSITION_OVERLAP + 0.04 : position;
              const copyTargets = scene.querySelectorAll(
                '.yss-showcase-scene__meta, .yss-showcase-scene__identity, h3, .yss-showcase-scene__copy > p, .yss-showcase-scene__tags, .yss-showcase-scene__cta'
              );
              const visualMotion = scene.querySelector<HTMLElement>('.yss-showcase-scene__visual-motion');

              timeline
                .addLabel(`scene-${index}`, position)
                .addLabel(`chapter-${index}`, position + CHAPTER_FOCUS_OFFSET);
              if (index > 0) {
                const previousScene = scenes[index - 1];
                const previousVisualMotion = visualMotions[index - 1];
                const previousAurora = auroras[index - 1];
                const previousWatermark = watermarks[index - 1];

                timeline
                  .set(
                    scene,
                    { contentVisibility: 'visible', willChange: 'transform, opacity' },
                    renderPreparationPosition
                  )
                  .set(visualMotion, { willChange: 'transform, opacity' }, renderPreparationPosition)
                  .set(auroras[index], { willChange: 'transform, opacity' }, renderPreparationPosition)
                  .set(watermarks[index], { willChange: 'transform' }, renderPreparationPosition)
                  .to(previousAurora, { autoAlpha: 0, scale: 0.96, xPercent: -2, duration: 0.3 }, transitionPosition)
                  .fromTo(
                    auroras[index],
                    { autoAlpha: 0, scale: 1.08, xPercent: 3 },
                    { autoAlpha: 1, scale: 1, xPercent: 0, duration: 0.42 },
                    transitionPosition
                  )
                  .fromTo(
                    scene,
                    { autoAlpha: 0, y: 36, scale: 1.04, pointerEvents: 'none' },
                    { autoAlpha: 1, y: 0, scale: 1, pointerEvents: 'auto', duration: 0.3 },
                    transitionPosition
                  )
                  .set(previousScene, { contentVisibility: 'hidden', willChange: 'auto' }, position)
                  .set(previousVisualMotion, { willChange: 'auto' }, position)
                  .set(previousAurora, { willChange: 'auto' }, position)
                  .set(previousWatermark, { willChange: 'auto' }, position);
              }

              if (index === 0) {
                gsap.set(copyTargets, { autoAlpha: 1, y: 0 });
                gsap.set(visualMotion, { autoAlpha: 1, y: 0, scale: 1 });
              } else {
                timeline
                  .fromTo(
                    copyTargets,
                    { autoAlpha: 0, y: 22 },
                    { autoAlpha: 1, y: 0, duration: 0.28, stagger: 0.035 },
                    contentPosition + 0.02
                  )
                  .fromTo(
                    visualMotion,
                    {
                      autoAlpha: 0,
                      y: 46,
                      scale: 0.965,
                      rotationX: 7,
                      transformPerspective: 1150,
                      transformOrigin: 'center 82%',
                    },
                    { autoAlpha: 1, y: 0, scale: 1, rotationX: 0, duration: 0.38 },
                    contentPosition + 0.08
                  );
              }

              if (index === 0) addComponentDetailMotion(timeline, position);
              if (index === 1) addHooksDetailMotion(timeline, position);
              if (index === 2) addUtilsDetailMotion(timeline, position);
              if (index === 3) addSkillsDetailMotion(timeline, position);

              if (index < scenes.length - 1) {
                timeline.to(
                  scene,
                  { autoAlpha: 0, y: -30, scale: 0.94, pointerEvents: 'none', duration: 0.24, ease: 'power2.in' },
                  position + 0.9
                );
                // 视觉区带反向透视退场，与整卡淡出叠加出景深
                if (visualMotion) {
                  timeline.to(
                    visualMotion,
                    { y: -20, rotationX: -5, transformPerspective: 1150, duration: 0.24, ease: 'power2.in' },
                    position + 0.9
                  );
                }
              }
            });
          } else if (fallback) {
            gsap
              .timeline({
                defaults: { duration: 0.6, ease: 'power3.out' },
                scrollTrigger: {
                  trigger: fallback,
                  start: 'top 82%',
                  toggleActions: 'play none none none',
                  once: true,
                },
              })
              .from('.yss-workbench-heading > *', { autoAlpha: 0, y: 24, stagger: 0.08 })
              .from('.yss-workbench-signal', { autoAlpha: 0, scaleX: 0.7 }, '<0.12')
              .from('.yss-workbench-card', { autoAlpha: 0, y: 32, scale: 0.98, stagger: 0.1 }, '<0.18');
          }

          return undefined;
        }
      );

      void refreshAfterAssetsReady(scope, () => cancelled);

      return () => {
        cancelled = true;
        media.revert();
        timelineRef.current = null;
        triggerRef.current = null;
      };
    },
    { scope: scopeRef, dependencies: [chapterCount], revertOnUpdate: true }
  );

  /** 跳转到指定章节；紧凑端则滚动到对应静态卡片。 */
  const selectChapter = contextSafe((index: number) => {
    const scope = scopeRef.current;
    const timeline = timelineRef.current;
    const trigger = triggerRef.current;
    const safeIndex = gsap.utils.clamp(0, Math.max(chapterCount - 1, 0), index);

    if (timeline && trigger) {
      const labelTime = timeline.labels[`chapter-${safeIndex}`] ?? 0;
      const progress = timeline.duration() ? labelTime / timeline.duration() : 0;
      window.scrollTo({
        top: trigger.start + (trigger.end - trigger.start) * progress,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
      return;
    }

    scope?.querySelectorAll<HTMLElement>('.yss-workbench-card')[safeIndex]?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center',
    });
  });

  return { activeIndex, selectChapter };
};
