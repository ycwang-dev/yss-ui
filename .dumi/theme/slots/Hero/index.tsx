import { ReactComponent as ArrowRightIcon } from '@ant-design/icons-svg/inline-svg/outlined/arrow-right.svg';
import { Link, useRouteMeta } from 'dumi';
import React, { useEffect, useRef, type FC } from 'react';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../../motion/gsap';
import { toAssetUrl } from '../../utils';
import './index.less';

/** Hero 标题图走 public 静态资源并配合 head preload，保证 LCP 优先加载。 */
const heroTitleImg = toAssetUrl('/branding/hero-title.webp');

/** 首页 Hero 行为入口配置。 */
type HeroAction = {
  text: string;
  link: string;
  type?: string;
  intent?: 'primary' | 'secondary';
  desc?: string;
};

/** 浏览组件入口使用的四宫格图标。 */
const ComponentGridIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
    <path d="M15 17h4M17 15v4" />
  </svg>
);

/** 快速开始入口使用的路线箭头图标。 */
const QuickStartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M5 12h12" />
    <path d="m13 7 5 5-5 5" />
    <circle cx="5" cy="12" r="1.5" />
  </svg>
);

/** Hero 入场、常驻漂移、指针视差与滚动退场的 GSAP 编排。 */
const useHeroMotion = (scopeRef: React.RefObject<HTMLDivElement | null>, enabled: boolean) => {
  useGSAP(
    () => {
      const scope = scopeRef.current;
      if (!scope || !enabled) return undefined;

      const media = gsap.matchMedia();

      media.add(
        {
          motionOk: '(prefers-reduced-motion: no-preference)',
          finePointer: '(hover: hover) and (pointer: fine)',
        },
        context => {
          const { motionOk, finePointer } = context.conditions || {};
          if (!motionOk) return undefined;

          const titleWrap = scope.querySelector<HTMLElement>('.dumi-default-hero-title');
          const titleImage = scope.querySelector<HTMLElement>('.hero-title-image');
          const value = scope.querySelector<HTMLElement>('.hero-value');
          const support = scope.querySelector<HTMLElement>('.hero-support');
          const stackPills = scope.querySelectorAll<HTMLElement>('.hero-stack i');
          const actionButtons = scope.querySelectorAll<HTMLElement>('.hero-action-btn');
          const actionsWrap = scope.querySelector<HTMLElement>('.dumi-default-hero-actions');
          const desc = scope.querySelector<HTMLElement>('.dumi-default-hero-desc');
          const auroras = gsap.utils.toArray<HTMLElement>('.hero-aurora', scope);
          const auroraWrap = scope.querySelector<HTMLElement>('.hero-aurora-wrap');
          const glow = scope.querySelector<HTMLElement>('.hero-cursor-glow');

          // 价值主张逐字入场；失败时整段淡入兜底
          let split: SplitText | null = null;
          if (value) {
            gsap.set(value, { perspective: 640 });
            try {
              split = new SplitText(value, { type: 'chars', charsClass: 'hero-value-char' });
            } catch {
              split = null;
            }
          }

          const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });
          entrance.from(auroras, { autoAlpha: 0, scale: 0.82, duration: 1.15, ease: 'power2.out', stagger: 0.08 }, 0);

          if (titleImage) {
            entrance.from(
              titleImage,
              { autoAlpha: 0, y: 38, scale: 0.93, filter: 'blur(16px)', duration: 0.95, ease: 'power4.out' },
              0.06
            );
          }

          if (split?.chars?.length) {
            entrance.from(
              split.chars,
              { autoAlpha: 0, y: 20, rotationX: -58, transformOrigin: '50% 100%', duration: 0.6, stagger: 0.022 },
              0.42
            );
          } else if (value) {
            entrance.from(value, { autoAlpha: 0, y: 18, duration: 0.55 }, 0.42);
          }

          if (support) entrance.from(support, { autoAlpha: 0, y: 16, duration: 0.5 }, '-=0.3');
          if (stackPills.length) {
            entrance.from(
              stackPills,
              { autoAlpha: 0, y: 10, scale: 0.86, duration: 0.4, stagger: 0.06, ease: 'back.out(1.9)' },
              '-=0.28'
            );
          }
          if (actionButtons.length) {
            entrance.from(actionButtons, { autoAlpha: 0, y: 24, duration: 0.6, stagger: 0.1 }, '-=0.24');
          }

          // 光斑常驻漂移与标题轻浮动，保持画面呼吸感
          const drifts = [
            auroras[0] &&
              gsap.to(auroras[0], {
                xPercent: 6,
                yPercent: 9,
                duration: 9,
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut',
              }),
            auroras[1] &&
              gsap.to(auroras[1], {
                xPercent: -7,
                yPercent: 7,
                duration: 11,
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut',
              }),
            auroras[2] &&
              gsap.to(auroras[2], { yPercent: -9, duration: 8, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
            titleImage &&
              gsap.to(titleImage, { y: -7, duration: 3.6, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.3 }),
          ].filter(Boolean) as gsap.core.Tween[];

          /** 根据 Hero 可见状态暂停或恢复常驻漂移动画，并保留原播放进度。 */
          const syncDriftPlayback = (isActive: boolean) => {
            drifts.forEach(tween => tween.paused(!isActive));
          };
          const driftVisibilityTrigger = ScrollTrigger.create({
            trigger: scope,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: self => syncDriftPlayback(self.isActive),
            onRefresh: self => syncDriftPlayback(self.isActive),
          });
          syncDriftPlayback(driftVisibilityTrigger.isActive);

          // 滚动退场：内容分层上移淡出，光斑反向下沉制造景深
          const exitTimeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: scope, start: 'top top', end: 'bottom 22%', scrub: true },
          });
          if (titleWrap) exitTimeline.to(titleWrap, { y: -52, autoAlpha: 0.32 }, 0);
          if (desc) exitTimeline.to(desc, { y: -34, autoAlpha: 0.24 }, 0);
          if (actionsWrap) exitTimeline.to(actionsWrap, { y: -20, autoAlpha: 0.4 }, 0);
          if (auroraWrap) exitTimeline.to(auroraWrap, { y: 64 }, 0);

          // 指针视差与跟随光晕仅在精确指针设备启用
          let removePointerListeners: (() => void) | undefined;
          if (finePointer) {
            const titleX = titleWrap ? gsap.quickTo(titleWrap, 'x', { duration: 0.7, ease: 'power3' }) : null;
            const auroraX = auroraWrap ? gsap.quickTo(auroraWrap, 'x', { duration: 0.9, ease: 'power3' }) : null;
            const glowX = glow ? gsap.quickTo(glow, 'x', { duration: 0.5, ease: 'power3' }) : null;
            const glowY = glow ? gsap.quickTo(glow, 'y', { duration: 0.5, ease: 'power3' }) : null;

            // 缓存容器几何，避免 pointermove 每帧触发布局读取
            let rect = scope.getBoundingClientRect();
            const refreshRect = () => {
              rect = scope.getBoundingClientRect();
            };

            const handleMove = (event: PointerEvent) => {
              const ratioX = (event.clientX - rect.left) / rect.width - 0.5;
              titleX?.(ratioX * 18);
              auroraX?.(ratioX * -30);
              glowX?.(event.clientX - rect.left - 230);
              glowY?.(event.clientY - rect.top - 230);
            };
            const handleEnter = () => {
              refreshRect();
              if (glow) gsap.to(glow, { opacity: 1, duration: 0.4 });
            };
            const handleLeave = () => {
              if (glow) gsap.to(glow, { opacity: 0, duration: 0.5 });
              titleX?.(0);
              auroraX?.(0);
            };

            scope.addEventListener('pointermove', handleMove);
            scope.addEventListener('pointerenter', handleEnter);
            scope.addEventListener('pointerleave', handleLeave);
            window.addEventListener('resize', refreshRect);
            removePointerListeners = () => {
              scope.removeEventListener('pointermove', handleMove);
              scope.removeEventListener('pointerenter', handleEnter);
              scope.removeEventListener('pointerleave', handleLeave);
              window.removeEventListener('resize', refreshRect);
            };
          }

          return () => {
            removePointerListeners?.();
            drifts.forEach(tween => tween.kill());
            split?.revert();
          };
        }
      );

      return () => {
        media.revert();
      };
    },
    { scope: scopeRef, dependencies: [enabled], revertOnUpdate: true }
  );
};

/** 渲染文档首页 Hero。 */
const Hero: FC = () => {
  const { frontmatter } = useRouteMeta();
  const hero = frontmatter?.hero;
  const hasHero = Boolean(hero);
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 路由切换时同步首页标记，避免首页舞台样式泄漏到内容页
    if (hasHero) {
      document.body.setAttribute('data-homepage', 'true');
    } else {
      document.body.removeAttribute('data-homepage');
    }

    return () => {
      document.body.removeAttribute('data-homepage');
    };
  }, [hasHero]);

  useHeroMotion(scopeRef, hasHero);

  if (!hero) return null;
  const actions = (hero.actions || []) as HeroAction[];

  return (
    <div className="dumi-default-hero" ref={scopeRef}>
      {/* Aurora 极光光斑层 */}
      <div className="hero-aurora-wrap">
        <div className="hero-aurora aurora-1" />
        <div className="hero-aurora aurora-2" />
        <div className="hero-aurora aurora-3" />
      </div>

      {/* 科技网格纹理与指针跟随光晕 */}
      <div className="hero-grid-overlay" aria-hidden="true" />
      <div className="hero-cursor-glow" aria-hidden="true" />

      {/* 玻璃底部反光条 */}
      <div className="hero-bottom-shine" />

      {hero.title && (
        <div className="dumi-default-hero-title hero-title hero-title-clicked">
          <img
            src={heroTitleImg}
            alt={hero.title}
            className="hero-title-image"
            width={934}
            height={267}
            decoding="async"
            {...({ fetchpriority: 'high' } as Record<string, string>)}
          />
        </div>
      )}

      {hero.description && (
        <p className="dumi-default-hero-desc" dangerouslySetInnerHTML={{ __html: hero.description }} />
      )}

      {Boolean(actions.length) && (
        <div className="dumi-default-hero-actions">
          {actions.map((action: HeroAction) => {
            const { text, link, type, intent, desc } = action;
            const isPrimary = type !== 'default';
            const resolvedPrimary = intent ? intent === 'primary' : isPrimary;
            const finalClass = resolvedPrimary ? 'hero-action-btn primary-btn' : 'hero-action-btn secondary-btn';
            const btnProps = { className: finalClass };
            const actionChildren = (
              <>
                <i className="btn-orbit" aria-hidden="true" />
                <i className="btn-prismatic-shimmer" aria-hidden="true" />
                <span className="btn-content">
                  <span className="btn-icon">{resolvedPrimary ? <ComponentGridIcon /> : <QuickStartIcon />}</span>
                  <span className="btn-copy">
                    <span className="btn-label">{text}</span>
                    {desc && <span className="btn-desc">{desc}</span>}
                  </span>
                </span>
                <span className="btn-arrow" aria-hidden="true">
                  <ArrowRightIcon />
                </span>
              </>
            );

            return /^(\w+):\/\/|^(mailto|tel):/.test(link) ? (
              <a href={link} target="_blank" rel="noreferrer" key={text} {...btnProps}>
                {actionChildren}
              </a>
            ) : (
              <Link key={text} to={link} {...btnProps}>
                {actionChildren}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Hero;
