import React from 'react';
import { TONE_ACCENT_MAP, toRgb } from '../../constants';
import type { FeatureCard, FeatureCardPreview } from '../../types';
import { ComponentScene } from './ComponentScene';
import { HooksScene } from './HooksScene';
import type { ShowcaseSceneProps } from './SceneShell';
import { ShowcaseRail } from './ShowcaseRail';
import { SkillsScene } from './SkillsScene';
import { UtilsScene } from './UtilsScene';

/** 全屏产品展厅舞台属性。 */
interface ProductShowcaseStageProps {
  cards: FeatureCard[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/** Preview 类型到独立展厅组件的稳定映射。 */
const sceneComponentMap: Record<FeatureCardPreview, React.ComponentType<ShowcaseSceneProps>> = {
  'component-table': ComponentScene,
  'hook-code': HooksScene,
  'utility-actions': UtilsScene,
  'skill-flow': SkillsScene,
};

/** 渲染桌面端固定舞台、氛围背景、四个 Scene 和章节轨道。 */
export const ProductShowcaseStage = ({ cards, activeIndex, onSelect }: ProductShowcaseStageProps) => (
  <div className="yss-showcase-pin" aria-labelledby="yss-showcase-title">
    <div className="yss-showcase-auroras" aria-hidden="true">
      {cards.map((card, index) => {
        const accent = card.accent || TONE_ACCENT_MAP[card.tone || ''] || TONE_ACCENT_MAP.blue;
        return (
          <span
            className="yss-showcase-aurora"
            data-showcase-index={index}
            key={card.key || card.title}
            style={
              {
                '--feature-accent': accent,
                '--feature-accent-rgb': toRgb(accent),
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>

    <header className="yss-showcase-header">
      <span className="yss-showcase-header__eyebrow">YSS PRODUCT WORKBENCH</span>
      <h2 id="yss-showcase-title">一套系统，完成中后台页面交付</h2>
      <span className="yss-showcase-header__cue">
        <i aria-hidden="true" />
        Scroll to explore
      </span>
    </header>

    <div className="yss-showcase-scenes">
      {cards.map((card, index) => {
        const preview =
          card.preview || (['component-table', 'hook-code', 'utility-actions', 'skill-flow'] as const)[index];
        const Scene = sceneComponentMap[preview || 'component-table'];
        return <Scene key={card.key || card.title} card={card} index={index} active={index === activeIndex} />;
      })}
    </div>

    <ShowcaseRail cards={cards} activeIndex={activeIndex} onSelect={onSelect} />
  </div>
);
