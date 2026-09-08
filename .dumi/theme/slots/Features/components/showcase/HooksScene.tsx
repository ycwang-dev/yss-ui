import { ReactComponent as CodeIcon } from '@ant-design/icons-svg/inline-svg/outlined/code.svg';
import { ReactComponent as ColumnHeightIcon } from '@ant-design/icons-svg/inline-svg/outlined/column-height.svg';
import { ReactComponent as FullscreenIcon } from '@ant-design/icons-svg/inline-svg/outlined/fullscreen.svg';
import { ReactComponent as LoadingIcon } from '@ant-design/icons-svg/inline-svg/outlined/loading.svg';
import { ReactComponent as TableIcon } from '@ant-design/icons-svg/inline-svg/outlined/table.svg';
import React from 'react';
import { HOOK_CODE_LINES, HOOK_MECHANICS } from '../../constants';
import { SceneShell, type ShowcaseSceneProps } from './SceneShell';

const hookIconMap = {
  table: TableIcon,
  tree: ColumnHeightIcon,
  fullscreen: FullscreenIcon,
  loading: LoadingIcon,
} as const;

/** 展示高度、全屏与加载态 Hook 对页面机械结构的驱动效果。 */
export const HooksScene = (props: ShowcaseSceneProps) => (
  <SceneShell {...props} sceneClassName="yss-showcase-scene--hooks" visualLabel="Hooks 页面尺寸与状态编排演示">
    <div className="yss-hooks-machine">
      <div className="yss-hooks-machine__toolbar">
        {HOOK_MECHANICS.map(mechanic => {
          const Icon = hookIconMap[mechanic.key];
          return (
            <span className="yss-hook-mechanic" key={mechanic.key}>
              <Icon aria-hidden="true" />
              <i>
                <strong>{mechanic.label}</strong>
                <small>{mechanic.detail}</small>
              </i>
            </span>
          );
        })}
      </div>

      <div className="yss-hooks-viewport">
        <div className="yss-hook-ruler yss-hook-ruler--x" aria-hidden="true">
          <span>0</span>
          <i />
          <span>1280</span>
        </div>
        <div className="yss-hook-ruler yss-hook-ruler--y" aria-hidden="true">
          <span>0</span>
          <i />
          <span>640</span>
        </div>

        <div className="yss-hook-window">
          <header>
            <span>Responsive Workspace</span>
            <i>
              READY <b />
            </i>
          </header>
          <div className="yss-hook-window__body">
            <aside>
              <strong>组织节点</strong>
              {['数据中心', '研发中心', '运营中心', '交付中心'].map((item, index) => (
                <span className={index === 1 ? 'is-active' : undefined} key={item}>
                  <i />
                  {item}
                </span>
              ))}
            </aside>
            <main>
              <div className="yss-hook-window__query">
                <span>关键字</span>
                <span>执行状态</span>
                <strong>查询</strong>
              </div>
              <div className="yss-hook-window__table">
                {['任务名称', '执行时间', '状态'].map(item => (
                  <b key={item}>{item}</b>
                ))}
                {[
                  { name: '元数据同步', done: true },
                  { name: '质量规则扫描', done: true },
                  { name: '指标口径校验', done: true },
                  { name: '交付报表导出', done: true },
                  { name: '权限快照比对', done: false },
                ].flatMap((task, index) => [
                  <span key={`${task.name}-name`}>{task.name}</span>,
                  <span key={`${task.name}-time`}>10:{24 + index * 7}</span>,
                  <span key={`${task.name}-status`} className={task.done ? 'is-success' : undefined}>
                    {task.done ? '已完成' : '排队中'}
                  </span>,
                ])}
              </div>
            </main>
          </div>
          <footer className="yss-hook-window__footer" aria-hidden="true">
            <span>
              tableHeight <b>488px</b>
            </span>
            <span>
              treeHeight <b>640px</b>
            </span>
            <span>
              fullscreen <b>off</b>
            </span>
            <span>
              loading <b>idle</b>
            </span>
          </footer>
          <div className="yss-hook-loading-state" aria-hidden="true">
            <LoadingIcon />
            <span>状态同步中</span>
          </div>
        </div>

        <div className="yss-hook-code">
          <header>
            <CodeIcon aria-hidden="true" />
            usePageMechanics.ts
          </header>
          <code>
            {HOOK_CODE_LINES.map((line, index) => (
              <span className="yss-hook-code-line" key={line}>
                <i>{String(index + 1).padStart(2, '0')}</i>
                {line}
              </span>
            ))}
          </code>
        </div>
      </div>
    </div>
  </SceneShell>
);
