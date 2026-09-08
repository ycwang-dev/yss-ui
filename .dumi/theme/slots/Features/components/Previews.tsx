import { ReactComponent as ApiIcon } from '@ant-design/icons-svg/inline-svg/outlined/api.svg';
import { ReactComponent as CheckCircleIcon } from '@ant-design/icons-svg/inline-svg/outlined/check-circle.svg';
import { ReactComponent as CopyIcon } from '@ant-design/icons-svg/inline-svg/outlined/copy.svg';
import { ReactComponent as ExportIcon } from '@ant-design/icons-svg/inline-svg/outlined/export.svg';
import { ReactComponent as FileDoneIcon } from '@ant-design/icons-svg/inline-svg/outlined/file-done.svg';
import { ReactComponent as FileTextIcon } from '@ant-design/icons-svg/inline-svg/outlined/file-text.svg';
import { ReactComponent as LinkIcon } from '@ant-design/icons-svg/inline-svg/outlined/link.svg';
import { ReactComponent as ReloadIcon } from '@ant-design/icons-svg/inline-svg/outlined/reload.svg';
import { ReactComponent as SafetyCertificateIcon } from '@ant-design/icons-svg/inline-svg/outlined/safety-certificate.svg';
import { ReactComponent as SearchIcon } from '@ant-design/icons-svg/inline-svg/outlined/search.svg';
import { ReactComponent as ToolIcon } from '@ant-design/icons-svg/inline-svg/outlined/tool.svg';
import React from 'react';
import { AI_CHANNELS, COMPONENT_PREVIEW_ROWS, HOOK_CODE_LINES, UTILITY_ACTIONS } from '../constants';
import type { FeatureCardPreview } from '../types';

/** 组件目录的静态表格预览。 */
const ComponentTablePreview = () => (
  <div className="yss-workbench-table" aria-label="组件目录预览">
    <div className="yss-workbench-table__filters">
      <span className="yss-workbench-table__search">
        <SearchIcon aria-hidden="true" />
        搜索组件
      </span>
      <span className="yss-workbench-table__select">全部状态</span>
      <span className="yss-workbench-table__action yss-workbench-table__action--primary">查询</span>
      <span className="yss-workbench-table__action">
        <ReloadIcon aria-hidden="true" />
        重置
      </span>
    </div>
    <div className="yss-workbench-table__grid" role="table">
      <div className="yss-workbench-table__row yss-workbench-table__row--head" role="row">
        <span role="columnheader">组件</span>
        <span role="columnheader">场景</span>
        <span role="columnheader">状态</span>
        <span role="columnheader">操作</span>
      </div>
      {COMPONENT_PREVIEW_ROWS.map(row => (
        <div className="yss-workbench-table__row" role="row" key={row.name}>
          <strong role="cell">{row.name}</strong>
          <span role="cell">{row.scene}</span>
          <span role="cell" className={`yss-workbench-table__status is-${row.tone}`}>
            <i aria-hidden="true" />
            {row.status}
          </span>
          <span role="cell" className="yss-workbench-table__link">
            查看
          </span>
        </div>
      ))}
    </div>
    <div className="yss-workbench-table__pagination" aria-hidden="true">
      <span>共 13 项</span>
      <i className="is-active">1</i>
      <i>2</i>
      <i>3</i>
    </div>
  </div>
);

/** Hooks 的代码片段预览。 */
const HookCodePreview = () => (
  <div className="yss-workbench-code" aria-label="Hooks 代码预览">
    <div className="yss-workbench-code__bar" aria-hidden="true">
      <span />
      <span />
      <span />
      <em>useTableHeight.ts</em>
    </div>
    <pre>
      <code>
        {HOOK_CODE_LINES.map((line, index) => (
          <span key={line}>
            <i>{String(index + 1).padStart(2, '0')}</i>
            {line}
          </span>
        ))}
      </code>
    </pre>
  </div>
);

const utilityIconMap = {
  format: ToolIcon,
  download: ExportIcon,
  auth: SafetyCertificateIcon,
  link: LinkIcon,
  copy: CopyIcon,
} as const;

/** Utils 高频动作预览。 */
const UtilityActionsPreview = () => (
  <div className="yss-workbench-actions" aria-label="工具能力预览">
    {UTILITY_ACTIONS.map(action => {
      const Icon = utilityIconMap[action.key];
      return (
        <div className="yss-workbench-actions__item" key={action.key}>
          <span className="yss-workbench-actions__icon">
            <Icon aria-hidden="true" />
          </span>
          <span>
            <strong>{action.label}</strong>
            <small>{action.detail}</small>
          </span>
          <CheckCircleIcon aria-hidden="true" />
        </div>
      );
    })}
  </div>
);

const channelIconMap = {
  skills: FileDoneIcon,
  mcp: ApiIcon,
  llms: FileTextIcon,
} as const;

/** AI 生态三条集成通道预览（Skills / MCP / LLMs.txt）。 */
const SkillFlowPreview = () => (
  <ol className="yss-workbench-flow" aria-label="AI 生态集成通道">
    {AI_CHANNELS.map((channel, index) => {
      const Icon = channelIconMap[channel.key];
      return (
        <li className="yss-workbench-skill-step" key={channel.key}>
          <span className="yss-workbench-flow__track" aria-hidden="true">
            <i>{String(index + 1).padStart(2, '0')}</i>
          </span>
          <span className="yss-workbench-flow__icon">
            <Icon aria-hidden="true" />
          </span>
          <span className="yss-workbench-flow__copy">
            <strong>{channel.name}</strong>
            <small>{channel.detail}</small>
          </span>
          <b className="yss-workbench-flow__level">{channel.level}</b>
        </li>
      );
    })}
  </ol>
);

/** 根据卡片类型渲染对应的产品能力预览。 */
export const CardPreview = ({ preview }: { preview: FeatureCardPreview }) => {
  if (preview === 'component-table') return <ComponentTablePreview />;
  if (preview === 'hook-code') return <HookCodePreview />;
  if (preview === 'utility-actions') return <UtilityActionsPreview />;
  return <SkillFlowPreview />;
};
