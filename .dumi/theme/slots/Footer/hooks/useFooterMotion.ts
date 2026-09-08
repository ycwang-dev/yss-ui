import type React from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../../../motion/gsap';

/** 首页专属：关键词滚动带无限循环，滚动越快滚得越快，悬停减速、离屏暂停。 */
const setupMarquee = (scope: HTMLElement) => {
  const marquee = scope.querySelector<HTMLElement>('.yss-footer-marquee');
  const track = scope.querySelector<HTMLElement>('.yss-footer-marquee__track');
  if (!marquee || !track) return;

  const loop = gsap.to(track, {
    xPercent: -50,
    duration: 30,
    ease: 'none',
    repeat: -1,
    paused: true,
  });

  let hovered = false;
  let settleTween: gsap.core.Tween | null = null;

  // 只有滚动带在视口内才消耗帧；滚动速度实时放大播放倍速，停止后缓落回 1
  // refreshPriority: 路由切换时 Footer 先于懒加载正文重建，触发器创建顺序早于正文的
  // 固定滚动区段；置为最后刷新才能把 pin 撑开的高度计入测量，否则位置永远停留在旧布局
  ScrollTrigger.create({
    trigger: marquee,
    start: 'top bottom',
    end: 'bottom top',
    refreshPriority: -1,
    onToggle: self => (self.isActive ? loop.play() : loop.pause()),
    onUpdate: self => {
      if (hovered) return;
      const boost = gsap.utils.clamp(1, 4.2, 1 + Math.abs(self.getVelocity()) / 1400);
      loop.timeScale(boost);
      settleTween?.kill();
      settleTween = gsap.to(loop, { timeScale: 1, duration: 1.6, ease: 'power3.out', delay: 0.12 });
    },
  });

  const slowDown = () => {
    hovered = true;
    settleTween?.kill();
    gsap.to(loop, { timeScale: 0.22, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
  };
  const speedUp = () => {
    hovered = false;
    gsap.to(loop, { timeScale: 1, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
  };
  marquee.addEventListener('pointerenter', slowDown);
  marquee.addEventListener('pointerleave', speedUp);

  return () => {
    marquee.removeEventListener('pointerenter', slowDown);
    marquee.removeEventListener('pointerleave', speedUp);
  };
};

/** 首页专属：目录分区的指针跟随光晕。 */
const setupSectionSpotlights = (scope: HTMLElement) => {
  const sections = gsap.utils.toArray<HTMLElement>('.yss-footer-directory__section', scope);
  if (!sections.length) return;

  const cleanups = sections.map(section => {
    const setX = gsap.quickSetter(section, '--sx', 'px');
    const setY = gsap.quickSetter(section, '--sy', 'px');
    let rect = section.getBoundingClientRect();

    const handleEnter = () => {
      rect = section.getBoundingClientRect();
    };
    const handleMove = (event: PointerEvent) => {
      setX(event.clientX - rect.left);
      setY(event.clientY - rect.top);
    };

    section.addEventListener('pointerenter', handleEnter);
    section.addEventListener('pointermove', handleMove);
    return () => {
      section.removeEventListener('pointerenter', handleEnter);
      section.removeEventListener('pointermove', handleMove);
    };
  });

  return () => cleanups.forEach(cleanup => cleanup());
};

/**
 * 为 Footer 资源目录提供入场动效；首页额外编排滚动带、聚光灯字标与分区光晕。
 * @param scopeRef - Footer 根节点引用，作为 GSAP 选择器作用域
 * @param pathname - 当前路由路径；路由切换会重建首页跑马灯等 DOM，需回收旧动画并基于新 DOM 重跑编排
 */
export const useFooterMotion = (scopeRef: React.RefObject<HTMLElement | null>, pathname: string) => {
  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        context => {
          const scope = scopeRef.current;

          if (context.conditions?.reduceMotion || !scope) {
            gsap.set('.yss-footer-directory__heading, .yss-footer-directory__section, .yss-footer-bottom', {
              clearProps: 'all',
              autoAlpha: 1,
              y: 0,
            });
            return undefined;
          }

          gsap
            .timeline({
              defaults: { duration: 0.62, ease: 'power3.out' },
              scrollTrigger: {
                trigger: '.yss-footer-directory',
                start: 'top 86%',
                toggleActions: 'play none none none',
                once: true,
                refreshPriority: -1,
              },
            })
            .from('.yss-footer-directory__heading', { autoAlpha: 0, y: 20, immediateRender: false })
            .from(
              '.yss-footer-directory__section',
              { autoAlpha: 0, y: 26, stagger: 0.12, immediateRender: false },
              '<0.12'
            )
            .from('.yss-footer-bottom', { autoAlpha: 0, y: 12, immediateRender: false }, '<0.16');

          const cleanupMarquee = setupMarquee(scope);
          const cleanupSpotlights = setupSectionSpotlights(scope);

          return () => {
            cleanupMarquee?.();
            cleanupSpotlights?.();
          };
        }
      );

      return () => media.revert();
    },
    { scope: scopeRef, dependencies: [pathname], revertOnUpdate: true }
  );
};
