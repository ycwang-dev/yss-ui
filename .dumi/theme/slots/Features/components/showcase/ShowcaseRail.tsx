import React from 'react';
import { TONE_ACCENT_MAP, toRgb } from '../../constants';
import type { FeatureCard } from '../../types';

/** 全屏展厅章节轨道属性。 */
interface ShowcaseRailProps {
  cards: FeatureCard[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/** 渲染可点击、可键盘操作的四章产品导航和总进度。 */
export const ShowcaseRail = ({ cards, activeIndex, onSelect }: ShowcaseRailProps) => (
  <nav className="yss-showcase-rail" aria-label="产品能力章节">
    <div className="yss-showcase-rail__progress" aria-hidden="true">
      <i />
    </div>
    <ol>
      {cards.map((card, index) => {
        const active = index === activeIndex;
        const accent = card.accent || TONE_ACCENT_MAP[card.tone || ''] || TONE_ACCENT_MAP.blue;
        return (
          <li
            className={active ? 'is-active' : undefined}
            key={card.key || card.title}
            style={
              {
                '--feature-accent': accent,
                '--feature-accent-rgb': toRgb(accent),
              } as React.CSSProperties
            }
          >
            <button
              type="button"
              aria-current={active ? 'step' : undefined}
              aria-label={`跳转到第 ${index + 1} 章：${card.title}`}
              onClick={() => onSelect(index)}
            >
              <span>0{index + 1}</span>
              <strong>{card.title}</strong>
              <i aria-hidden="true" />
            </button>
          </li>
        );
      })}
    </ol>
  </nav>
);
