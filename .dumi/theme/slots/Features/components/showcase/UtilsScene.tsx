import { ReactComponent as CheckCircleIcon } from '@ant-design/icons-svg/inline-svg/outlined/check-circle.svg';
import { ReactComponent as CopyIcon } from '@ant-design/icons-svg/inline-svg/outlined/copy.svg';
import { ReactComponent as DatabaseIcon } from '@ant-design/icons-svg/inline-svg/outlined/database.svg';
import { ReactComponent as ExportIcon } from '@ant-design/icons-svg/inline-svg/outlined/export.svg';
import { ReactComponent as LinkIcon } from '@ant-design/icons-svg/inline-svg/outlined/link.svg';
import { ReactComponent as SafetyCertificateIcon } from '@ant-design/icons-svg/inline-svg/outlined/safety-certificate.svg';
import { ReactComponent as ToolIcon } from '@ant-design/icons-svg/inline-svg/outlined/tool.svg';
import React from 'react';
import { UTILITY_ACTIONS, UTILITY_RESULT_ROWS } from '../../constants';
import { SceneShell, type ShowcaseSceneProps } from './SceneShell';

const utilityIconMap = {
  format: ToolIcon,
  download: ExportIcon,
  auth: SafetyCertificateIcon,
  link: LinkIcon,
  copy: CopyIcon,
} as const;

/** 展示数据经过五类 Utils 节点后形成可交付结果的处理通路。 */
export const UtilsScene = (props: ShowcaseSceneProps) => (
  <SceneShell {...props} sceneClassName="yss-showcase-scene--utils" visualLabel="Utils 数据处理通路演示">
    <div className="yss-utils-toolbar" aria-hidden="true">
      <span>
        <ToolIcon aria-hidden="true" />
        UTILS PIPELINE
      </span>
      <i>
        7 类基础动作 · TREE-SHAKABLE <b />
      </i>
    </div>
    <div className="yss-utils-pipeline">
      <div className="yss-utils-pipeline__source yss-utils-endpoint">
        <header>
          <DatabaseIcon aria-hidden="true" />
          API RESPONSE
        </header>
        <code>
          <span>{'{'}</span>
          <span> createdAt: 1786415400,</span>
          <span> file: Blob(248KB),</span>
          <span> token: '••••••••'</span>
          <span>{'}'}</span>
        </code>
        <footer>RAW PAYLOAD</footer>
      </div>

      <div className="yss-utils-pipeline__route" aria-hidden="true">
        <i className="yss-utils-route-progress" />
        <span>INPUT</span>
        <span>PROCESS</span>
        <span>OUTPUT</span>
      </div>

      <div className="yss-utils-nodes">
        {UTILITY_ACTIONS.map((action, index) => {
          const Icon = utilityIconMap[action.key];
          return (
            <div className="yss-utils-node" key={action.key}>
              <span className="yss-utils-node__index">0{index + 1}</span>
              <i className="yss-utils-node__icon">
                <Icon aria-hidden="true" />
              </i>
              <strong>{action.label}</strong>
              <small>{action.detail}</small>
              <CheckCircleIcon className="yss-utils-node__check" aria-hidden="true" />
            </div>
          );
        })}
      </div>

      <div className="yss-utils-pipeline__result yss-utils-endpoint">
        <header>
          <CheckCircleIcon aria-hidden="true" />
          READY TO USE
        </header>
        <div>
          {UTILITY_RESULT_ROWS.map(row => (
            <span key={row.label}>
              <small>{row.label}</small>
              <strong>{row.value}</strong>
            </span>
          ))}
        </div>
        <footer>
          <span>5 个动作已收口</span>
          <b>COMPLETED</b>
        </footer>
      </div>
    </div>
  </SceneShell>
);
