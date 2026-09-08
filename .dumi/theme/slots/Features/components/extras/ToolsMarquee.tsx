import { ReactComponent as ArrowRightIcon } from '@ant-design/icons-svg/inline-svg/outlined/arrow-right.svg';
import { Link } from 'dumi';
import React from 'react';
import { HOME_AI_TOOLS } from '../../constants';

type HomeAiTool = (typeof HOME_AI_TOOLS)[number];

/** 上下两行反向流动，各取一半工具并复制一份实现无缝循环。 */
const toolRows: HomeAiTool[][] = [
  HOME_AI_TOOLS.slice(0, Math.ceil(HOME_AI_TOOLS.length / 2)),
  HOME_AI_TOOLS.slice(Math.ceil(HOME_AI_TOOLS.length / 2)),
];

/** 首页 AI 工具兼容矩阵：双向跑马灯展示 MCP 安装器覆盖的全部工具。 */
export const ToolsMarquee = () => (
  <section
    className="yss-extras-section yss-extras-tools"
    data-extras-section="tools"
    aria-labelledby="yss-tools-title"
  >
    <header className="yss-extras-head" data-reveal>
      <span className="yss-extras-head__eyebrow">AI TOOLCHAIN</span>
      <h2 id="yss-tools-title">12 个 AI 工具，一条命令接入</h2>
      <p>
        <code>npx -y @yss-ui/mcp install</code> 自动把 yss-ui 写入所选工具的 MCP
        配置，各家格式差异由安装器抹平，重复执行安全。
      </p>
    </header>

    <p className="yss-visually-hidden">支持的工具：{HOME_AI_TOOLS.map(tool => tool.name).join('、')}。</p>

    <div className="yss-tools-rows" data-reveal aria-hidden="true">
      {toolRows.map((row, rowIndex) => (
        <div className="yss-tools-row" data-direction={rowIndex === 0 ? 'left' : 'right'} key={rowIndex}>
          <div className="yss-tools-row__track">
            {[...row, ...row].map((tool, index) => (
              <span
                className="yss-tools-chip"
                data-duplicate={index >= row.length ? 'true' : undefined}
                key={`${tool.name}-${index}`}
              >
                <b>{tool.name}</b>
                <small>{tool.kind}</small>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>

    <footer className="yss-extras-foot" data-reveal>
      <Link className="yss-extras-link" to="/guide/mcp">
        查看 MCP 接入指南
        <ArrowRightIcon aria-hidden="true" />
      </Link>
    </footer>
  </section>
);
