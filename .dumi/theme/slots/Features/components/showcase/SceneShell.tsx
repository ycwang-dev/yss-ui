import React, { type ReactNode } from 'react';
import { TONE_ACCENT_MAP, toRgb } from '../../constants';
import type { FeatureCard } from '../../types';
import { SceneLink } from './SceneLink';

/** 单个产品展厅组件的公共属性。 */
export interface ShowcaseSceneProps {
  card: FeatureCard;
  index: number;
  active: boolean;
}

/** 产品展厅公共框架属性。 */
interface SceneShellProps extends ShowcaseSceneProps {
  children: ReactNode;
  sceneClassName: string;
  visualLabel: string;
}

/** 为四个产品 Scene 提供一致的信息区、主题变量和可访问性结构。 */
export const SceneShell = ({ card, index, active, children, sceneClassName, visualLabel }: SceneShellProps) => {
  const accent = card.accent || TONE_ACCENT_MAP[card.tone || ''] || TONE_ACCENT_MAP.blue;
  const capabilities = (card.capabilities?.length ? card.capabilities : card.tags) || [];
  const titleId = `yss-showcase-scene-title-${index}`;
  const style = {
    '--feature-accent': accent,
    '--feature-accent-rgb': toRgb(accent),
  } as React.CSSProperties;

  return (
    <article
      className={`yss-showcase-scene ${sceneClassName}`}
      data-showcase-scene={card.key || card.preview || index}
      data-showcase-index={index}
      data-tone={card.tone || 'blue'}
      aria-hidden={!active}
      aria-labelledby={titleId}
      style={style}
    >
      <span className="yss-showcase-scene__watermark" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="yss-showcase-scene__copy">
        <div className="yss-showcase-scene__meta">
          <span>Scene {String(index + 1).padStart(2, '0')}</span>
          <i aria-hidden="true" />
          <span>{card.count}</span>
        </div>

        <div className="yss-showcase-scene__identity">
          {card.iconSrc ? <img src={card.iconSrc} alt="" aria-hidden="true" decoding="async" loading="eager" /> : null}
          <span>{card.eyebrow || 'Product Capability'}</span>
        </div>

        <h3 id={titleId}>{card.title}</h3>
        <p>{card.description}</p>

        {capabilities.length ? (
          <div className="yss-showcase-scene__tags" aria-label="能力标签">
            {capabilities.map(capability => (
              <span key={capability}>{capability}</span>
            ))}
          </div>
        ) : null}

        <SceneLink card={card} active={active} />
      </div>

      <div className="yss-showcase-scene__visual-motion">
        <div className="yss-showcase-scene__visual" role="img" aria-label={visualLabel}>
          <span className="yss-showcase-scene__halo" aria-hidden="true" />
          {children}
        </div>
      </div>
    </article>
  );
};
