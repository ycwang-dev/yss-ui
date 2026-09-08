import React, { useRef } from 'react';
import { useHomeExtrasMotion } from '../../hooks/useHomeExtrasMotion';
import { FinalCta } from './FinalCta';
import { QuickStart } from './QuickStart';
import { ReleasePulse } from './ReleasePulse';
import { StatsBand } from './StatsBand';
import { ToolsMarquee } from './ToolsMarquee';
import './index.less';

/** 首页展厅之后的补充区块：指标带、快速接入、工具矩阵、版本动态与收口 CTA。 */
export const HomeExtras = () => {
  const scopeRef = useRef<HTMLDivElement>(null);
  useHomeExtrasMotion({ scopeRef });

  return (
    <div ref={scopeRef} className="yss-home-extras">
      <StatsBand />
      <QuickStart />
      <ToolsMarquee />
      <ReleasePulse />
      <FinalCta />
    </div>
  );
};
