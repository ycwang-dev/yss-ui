import { ReactComponent as AppstoreIcon } from '@ant-design/icons-svg/inline-svg/outlined/appstore.svg';
import { ReactComponent as BranchesIcon } from '@ant-design/icons-svg/inline-svg/outlined/branches.svg';
import { ReactComponent as FormIcon } from '@ant-design/icons-svg/inline-svg/outlined/form.svg';
import { ReactComponent as LineChartIcon } from '@ant-design/icons-svg/inline-svg/outlined/line-chart.svg';
import { ReactComponent as TableIcon } from '@ant-design/icons-svg/inline-svg/outlined/table.svg';
import React from 'react';
import {
  COMPONENT_DELIVERY_TREND,
  COMPONENT_FORM_FIELDS,
  COMPONENT_SHOWCASE_ROWS,
  COMPONENT_TREE_NODES,
} from '../../constants';
import { SceneShell, type ShowcaseSceneProps } from './SceneShell';

/** 展示 YSS UI 业务组件装配出的真实中后台工作区。 */
export const ComponentScene = (props: ShowcaseSceneProps) => (
  <SceneShell {...props} sceneClassName="yss-showcase-scene--components" visualLabel="组件库业务页面装配演示">
    <div className="yss-components-console">
      <header className="yss-components-console__bar yss-components-module">
        <span className="yss-components-console__brand">
          <AppstoreIcon aria-hidden="true" />
          数据资产工作台
        </span>
        <span className="yss-components-console__crumb">资产管理 / 交付看板</span>
        <span className="yss-components-console__avatar">YC</span>
      </header>

      <div className="yss-components-console__workspace">
        <aside className="yss-components-tree yss-components-module">
          <strong>组件目录</strong>
          {COMPONENT_TREE_NODES.map((node, index) => (
            <span className={index === 1 ? 'is-active' : undefined} key={node}>
              <BranchesIcon aria-hidden="true" />
              {node}
            </span>
          ))}
        </aside>

        <main className="yss-components-main">
          <div className="yss-components-stats">
            {[
              { display: '13+', value: 13, decimals: 0, suffix: '+', label: '业务组件' },
              { display: '98.6%', value: 98.6, decimals: 1, suffix: '%', label: '页面复用率' },
              { display: '42', value: 42, decimals: 0, suffix: '', label: '本周交付' },
            ].map(stat => (
              <span className="yss-components-stat yss-components-module" key={stat.label}>
                <small>{stat.label}</small>
                <strong
                  data-counter-value={stat.value}
                  data-counter-decimals={stat.decimals}
                  data-counter-suffix={stat.suffix}
                >
                  {stat.display}
                </strong>
              </span>
            ))}
          </div>

          <section className="yss-components-table yss-components-module">
            <header>
              <span>
                <TableIcon aria-hidden="true" />
                交付任务
              </span>
              <i>新建任务</i>
            </header>
            <div className="yss-components-table__filters">
              <span>搜索任务名称</span>
              <span>全部状态</span>
              <b>查询</b>
            </div>
            <div className="yss-components-table__head">
              <span>任务名称</span>
              <span>负责人</span>
              <span>状态</span>
              <span>完成度</span>
            </div>
            {COMPONENT_SHOWCASE_ROWS.map(row => (
              <div className="yss-components-row" key={row.name}>
                <strong>{row.name}</strong>
                <span>{row.owner}</span>
                <span className="yss-components-row__status">
                  <i aria-hidden="true" />
                  {row.status}
                </span>
                <span>{row.progress}</span>
              </div>
            ))}
          </section>

          <section className="yss-components-chart yss-components-module">
            <header>
              <span>
                <LineChartIcon aria-hidden="true" />
                交付趋势
              </span>
              <strong>近 7 日 · +18.4%</strong>
            </header>
            <div className="yss-components-chart__plot" aria-hidden="true">
              {COMPONENT_DELIVERY_TREND.map(item => (
                <i
                  key={item.label}
                  style={{ '--trend-value': `${Math.round(item.value * 0.72)}px` } as React.CSSProperties}
                >
                  <b />
                  <span>{item.label}</span>
                </i>
              ))}
            </div>
          </section>
        </main>

        <aside className="yss-components-drawer yss-components-module">
          <header>
            <span>
              <FormIcon aria-hidden="true" />
              Schema 表单
            </span>
            <i>×</i>
          </header>
          {COMPONENT_FORM_FIELDS.map((field, index) => (
            <label key={field}>
              <span>{field}</span>
              <i>{index === 0 ? '数据资产治理方案' : index === 1 ? '数据中台' : '2026-08-18'}</i>
            </label>
          ))}
          <footer>
            <span>取消</span>
            <strong>保存方案</strong>
          </footer>
        </aside>
      </div>
    </div>
  </SceneShell>
);
