import { ReactComponent as ArrowRightIcon } from '@ant-design/icons-svg/inline-svg/outlined/arrow-right.svg';
import { Link } from 'dumi';
import React from 'react';

/** 首页收口 CTA：Apple 风格的行遮罩标题揭示 + 双按钮转化。 */
export const FinalCta = () => (
  <section className="yss-extras-section yss-extras-cta" data-extras-section="cta" aria-labelledby="yss-cta-title">
    <div className="yss-cta-panel" data-cta-panel>
      <span className="yss-cta-aurora" aria-hidden="true" />
      <span className="yss-cta-grid" aria-hidden="true" />

      <h2 id="yss-cta-title">
        <span className="yss-cta-line" data-reveal-line>
          <span>从第一个组件，</span>
        </span>
        <span className="yss-cta-line" data-reveal-line>
          <span>到 AI 协同交付</span>
        </span>
      </h2>
      <p data-reveal>组件、Hooks、Utils 与 AI 生态已经就绪，只差你的第一条命令。</p>

      <div className="yss-cta-actions" data-reveal>
        <Link className="yss-cta-btn yss-cta-btn--primary" to="/guide">
          快速开始
          <ArrowRightIcon aria-hidden="true" />
        </Link>
        <Link className="yss-cta-btn" to="/guide/ai-skills">
          接入 AI 生态
          <ArrowRightIcon aria-hidden="true" />
        </Link>
      </div>
    </div>
  </section>
);
