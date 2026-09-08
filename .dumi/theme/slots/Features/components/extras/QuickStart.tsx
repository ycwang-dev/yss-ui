import { ReactComponent as ArrowRightIcon } from '@ant-design/icons-svg/inline-svg/outlined/arrow-right.svg';
import { Link } from 'dumi';
import React from 'react';
import { HOME_QUICKSTART_STEPS } from '../../constants';
import { CopyCommandButton } from './CopyCommandButton';

/** 首页快速接入区：三条命令完成组件库、Skills 与 MCP 的全部准备。 */
export const QuickStart = () => (
  <section
    className="yss-extras-section yss-extras-quickstart"
    data-extras-section="quickstart"
    aria-labelledby="yss-quickstart-title"
  >
    <header className="yss-extras-head" data-reveal>
      <span className="yss-extras-head__eyebrow">GET STARTED</span>
      <h2 id="yss-quickstart-title">三条命令，接入完整交付能力</h2>
      <p>组件库、AI Skills 与 MCP 查询各一条命令，从安装到 AI 协同交付，3 分钟就绪。</p>
    </header>

    <ol className="yss-quickstart-grid">
      {HOME_QUICKSTART_STEPS.map((step, index) => (
        <li className="yss-qs-card" data-reveal key={step.key}>
          <header className="yss-qs-card__head">
            <i>0{index + 1}</i>
            <div>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </div>
          </header>
          <div className="yss-qs-command">
            <code data-command={step.command}>{step.command}</code>
            <CopyCommandButton command={step.command} />
          </div>
          <Link className="yss-extras-link" to={step.link}>
            {step.linkText}
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ol>
  </section>
);
