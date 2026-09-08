import { ReactComponent as ArrowRightIcon } from '@ant-design/icons-svg/inline-svg/outlined/arrow-right.svg';
import { Link } from 'dumi';
import React, { forwardRef } from 'react';
import { isExternalLink, TONE_ACCENT_MAP, toRgb } from '../constants';
import type { AnchorPointerHandlers, FeatureCard, FeatureCardPreview, FeatureCardVariant } from '../types';
import { toAssetUrl } from '../../../utils';
import { CardPreview } from './Previews';

/** 能力卡片组件属性。 */
interface CapabilityCardProps {
  card: FeatureCard;
  index: number;
  preview: FeatureCardPreview;
  variant: FeatureCardVariant;
  anchorHandlers?: AnchorPointerHandlers;
}

/** 渲染首页工作台中的单张产品能力卡片。 */
export const CapabilityCard = forwardRef<HTMLElement, CapabilityCardProps>(
  ({ card, index, preview, variant, anchorHandlers }, ref) => {
    const accent = card.accent || TONE_ACCENT_MAP[card.tone || ''] || TONE_ACCENT_MAP.blue;
    const capabilities = (card.capabilities?.length ? card.capabilities : card.tags) || [];
    const style = {
      '--feature-accent': accent,
      '--feature-accent-rgb': toRgb(accent),
      '--feature-order': index,
    } as React.CSSProperties;
    const className = ['yss-workbench-card', `yss-workbench-card--${variant}`, `yss-workbench-card--${preview}`].join(
      ' '
    );
    const commonProps = {
      ref,
      className,
      style,
      'data-tone': card.tone || 'blue',
      ...(variant === 'anchor' ? anchorHandlers : undefined),
    };
    const content = (
      <>
        <span className="yss-workbench-card__spotlight" aria-hidden="true" />
        <header className="yss-workbench-card__header">
          <span className="yss-workbench-card__eyebrow">{card.eyebrow || 'Product Capability'}</span>
          <span className="yss-workbench-card__count">{card.count}</span>
        </header>
        <div className="yss-workbench-card__intro">
          {card.iconSrc ? (
            <img
              className="yss-workbench-card__icon"
              src={toAssetUrl(card.iconSrc)}
              alt=""
              aria-hidden="true"
              loading={variant === 'anchor' ? 'eager' : 'lazy'}
              decoding="async"
            />
          ) : null}
          <div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        </div>
        {capabilities.length ? (
          <div className="yss-workbench-card__tags" aria-label="能力标签">
            {capabilities.map(capability => (
              <span key={capability}>{capability}</span>
            ))}
          </div>
        ) : null}
        <CardPreview preview={preview} />
        <footer className="yss-workbench-card__footer">
          <span>{card.ctaText || '立即查看'}</span>
          <ArrowRightIcon aria-hidden="true" />
        </footer>
      </>
    );

    if (isExternalLink(card.link)) {
      return (
        <a {...commonProps} href={card.link} target="_blank" rel="noreferrer">
          {content}
        </a>
      );
    }

    return (
      <Link {...commonProps} to={card.link || '/'}>
        {content}
      </Link>
    );
  }
);

CapabilityCard.displayName = 'CapabilityCard';
