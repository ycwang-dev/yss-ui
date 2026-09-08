import { ReactComponent as ApiIcon } from '@ant-design/icons-svg/inline-svg/outlined/api.svg';
import { ReactComponent as CheckCircleIcon } from '@ant-design/icons-svg/inline-svg/outlined/check-circle.svg';
import { ReactComponent as DeploymentIcon } from '@ant-design/icons-svg/inline-svg/outlined/deployment-unit.svg';
import { ReactComponent as FileDoneIcon } from '@ant-design/icons-svg/inline-svg/outlined/file-done.svg';
import { ReactComponent as FileTextIcon } from '@ant-design/icons-svg/inline-svg/outlined/file-text.svg';
import React from 'react';
import { AI_CHANNELS, AI_SESSION_LINES } from '../../constants';
import { SceneShell, type ShowcaseSceneProps } from './SceneShell';

const channelIconMap = {
  skills: FileDoneIcon,
  mcp: ApiIcon,
  llms: FileTextIcon,
} as const;

const sessionMarkMap = {
  prompt: '❯',
  call: '✓',
  result: '✦',
} as const;

/** 展示 Skills、MCP 与 LLMs.txt 三条 AI 集成通道协同交付页面的控制台。 */
export const SkillsScene = (props: ShowcaseSceneProps) => (
  <SceneShell
    {...props}
    sceneClassName="yss-showcase-scene--skills"
    visualLabel="AI 生态集成演示：Skills、MCP 与 LLMs.txt 协同交付页面"
  >
    <div className="yss-ai-hub">
      <header className="yss-ai-hub__header">
        <span>
          <DeploymentIcon aria-hidden="true" />
          AI INTEGRATION HUB
        </span>
        <i>
          03 CHANNELS <b />
        </i>
      </header>

      <div className="yss-ai-hub__workspace">
        <ul className="yss-ai-channels">
          {AI_CHANNELS.map((channel, index) => {
            const Icon = channelIconMap[channel.key];
            return (
              <li className="yss-ai-channel" data-level={channel.levelKey} key={channel.key}>
                <span className="yss-ai-channel__beam" aria-hidden="true" />
                <header>
                  <i className="yss-ai-channel__index">0{index + 1}</i>
                  <i className="yss-ai-channel__icon">
                    <Icon aria-hidden="true" />
                  </i>
                  <span>
                    <strong>{channel.name}</strong>
                    <small>{channel.detail}</small>
                  </span>
                  <b className="yss-ai-channel__level">{channel.level}</b>
                </header>
                <code className="yss-ai-channel__command">{channel.command}</code>
              </li>
            );
          })}
        </ul>

        <div className="yss-ai-session">
          <header>
            <i />
            <i />
            <i />
            <span>yss-ui · agent session</span>
          </header>
          <ol className="yss-ai-session__lines">
            {AI_SESSION_LINES.map(line => (
              <li className={`yss-ai-session__line yss-ai-session__line--${line.kind}`} key={line.key}>
                <i aria-hidden="true">{sessionMarkMap[line.kind]}</i>
                <b>{line.source}</b>
                <span>{line.text}</span>
              </li>
            ))}
          </ol>
          <footer className="yss-ai-verdict">
            <CheckCircleIcon aria-hidden="true" />
            <span>
              <strong>页面已通过交付校验</strong>
              <small>规范、API 与文档三路对齐，无虚构组件</small>
            </span>
          </footer>
        </div>
      </div>
    </div>
  </SceneShell>
);
