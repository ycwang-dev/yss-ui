import { defineAsyncComponent, defineComponent, h } from 'vue';
import type { Component } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn.js';

dayjs.locale('zh-cn');

// 文档构建专用入口：
// 1) 保持现有 import 写法不变
// 2) 避免将重依赖（Univer/Monaco/ECharts）提前打入共享 chunk

// 保留基础全局样式副作用，避免 Table/EditTable 等样式丢失
import 'vxe-table/lib/style.css';
import 'vxe-pc-ui/lib/style.css';
import 'ant-design-vue/dist/reset.css';
import './table/global.less';

/**
 * 文档站重组件加载占位，避免异步 chunk 下载期间出现空白区域。
 */
const DocsHeavyComponentLoading = defineComponent({
  name: 'DocsHeavyComponentLoading',
  setup() {
    return () =>
      h(
        'div',
        {
          style: {
            minHeight: '360px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: 'var(--text-color-secondary, #8c8c8c)',
            border: '1px solid var(--border-color, #d9d9d9)',
            borderRadius: '8px',
            background: 'var(--component-background, #fff)',
          },
        },
        [
          h('span', {
            style: {
              width: '28px',
              height: '28px',
              border: '3px solid var(--border-color, #d9d9d9)',
              borderTopColor: 'var(--primary-color, #1677ff)',
              borderRadius: '50%',
              animation: 'yss-docs-heavy-loading-spin 0.8s linear infinite',
            },
          }),
          h('span', { style: { fontSize: '14px', lineHeight: '22px' } }, '组件资源加载中...'),
          h('style', '@keyframes yss-docs-heavy-loading-spin { to { transform: rotate(360deg); } }'),
        ]
      );
  },
});

/**
 * 创建文档站异步组件，统一加载态、超时与轻量重试策略。
 *
 * @param loader 异步组件加载函数
 * @returns Vue 组件定义
 */
const createDocsAsyncComponent = (loader: () => Promise<any>): Component => {
  return defineAsyncComponent({
    loader,
    loadingComponent: DocsHeavyComponentLoading,
    delay: 120,
    timeout: 60000,
    suspensible: false,
    onError(_error, retry, fail, attempts) {
      if (attempts <= 2) {
        retry();
        return;
      }
      fail();
    },
  });
};

// 轻量静态导出
export { default as AuthorityDropdown } from './authority/AuthorityDropdown.vue';
export { default as YButton } from './button/index.vue';
export { default as YEditTable } from './edit-table/index.vue';
export { default as YFileImport } from './file-import/index.vue';
export { default as YFormily } from './formily/index.vue';
export { default as YssFormily } from './formily/index.vue'; // 历史兼容别名
export { default as YCard } from './card/index.vue';
export { default as YTable } from './table/index.vue';
export { default as YConditionBuilder } from './condition-builder/index.vue';
export { default as YTree } from './tree/index.vue';
export { default as YSplitPane } from './split-pane/index.vue';
export { default as YCron } from './cron/index.vue';
export { default as YMonthCalendar } from './month-calendar/index.vue';
export {
  YConfigProvider,
  useLocale,
  setGlobalLocale,
  getGlobalLocale,
  zhCN,
  formatTemplate,
  syncVxeLanguage,
} from './locale';

// 重组件异步导出（仅在实际渲染时下载）
export const YEcharts: Component = createDocsAsyncComponent(
  () => import(/* webpackChunkName: "yss-docs-echarts" */ './echarts/index.vue')
);
export const YMonaco: Component = createDocsAsyncComponent(
  () => import(/* webpackChunkName: "yss-docs-monaco" */ './monaco/index.vue')
);
export const YMonacoDiff: Component = createDocsAsyncComponent(
  () => import(/* webpackChunkName: "yss-docs-monaco-diff" */ './monaco/DiffEditor.vue')
);
export const YSheet: Component = createDocsAsyncComponent(
  () => import(/* webpackChunkName: "yss-docs-sheet" */ './sheet/index.vue')
);

// 文档 demo 常用运行时常量，避免从 @univerjs/presets 静态引入
export const LocaleType = {
  ZH_CN: 'zh-CN',
  EN_US: 'en-US',
} as const;

export type LocaleTypeString = (typeof LocaleType)[keyof typeof LocaleType];

// 类型导出（type-only，不会进入运行时包）
export type { IWorkbookData } from '@univerjs/presets';
export type { IUniverSheetsCorePresetConfig } from '@univerjs/presets/preset-sheets-core';
export type * from './button/types';
export type * from './edit-table/type';
export type * from './card/types';
export type * from './table/type';
export type * from './condition-builder/types';
export type * from './tree/types';
export type * from './split-pane/types';
export type * from './formily/types';
export type * from './cron/types';
export type { YSheetEmits, YSheetExpose, YSheetProps } from './sheet/constant';
export type * from './month-calendar/types';
export type * from './locale/types';
