import React from 'react';
import { resolvePreview, resolveVariant } from '../constants';
import type { FeatureCard } from '../types';
import { CapabilityCard } from './CapabilityCard';

/** 紧凑端与减弱动效模式的静态工作台属性。 */
interface FallbackWorkbenchProps {
  cards: FeatureCard[];
}

/** 保留原四卡工作台，作为平板、移动端和 reduced-motion 的完整降级。 */
export const FallbackWorkbench = ({ cards }: FallbackWorkbenchProps) => (
  <div className="yss-workbench-fallback">
    <div className="yss-workbench-sticky">
      <div className="yss-workbench-heading">
        <span className="yss-workbench-heading__rule" aria-hidden="true" />
        <div>
          <span className="yss-workbench-heading__eyebrow">YSS PRODUCT WORKBENCH</span>
          <h2>一套系统，完成中后台页面交付</h2>
          <p>组件承载业务，Hooks 与 Utils 提供支撑，AI 生态（Skills · MCP · LLMs.txt）串联完整研发流程。</p>
        </div>
        <span className="yss-workbench-heading__rule" aria-hidden="true" />
      </div>

      <div className="yss-workbench-signal" aria-hidden="true">
        <span className="yss-workbench-signal__line">
          <i className="yss-workbench-signal__progress" />
        </span>
        {cards.map(card => (
          <span key={card.key || card.title} />
        ))}
      </div>

      <div className="yss-workbench-grid">
        {cards.map((card, index) => (
          <CapabilityCard
            key={card.key || card.title}
            card={card}
            index={index}
            preview={resolvePreview(card, index)}
            variant={resolveVariant(card, index)}
          />
        ))}
      </div>
    </div>
  </div>
);
