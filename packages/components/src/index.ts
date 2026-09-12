// 全局样式：vxe-table v4 样式
import 'vxe-table/lib/style.css';
// vxe-pc-ui 样式（包含 Tooltip 等 PC UI 组件的样式）
import 'vxe-pc-ui/lib/style.css';
// Ant Design Vue 基础样式（保证 Dropdown、Pagination 等正常样式）
// antd 样式（库内只保留 reset，避免打包体积与外部样式冲突；完整样式在文档全局引入）
import 'ant-design-vue/dist/reset.css';
import './table/global.less';

// 统一导出名：YButton/YFormily/YTable
export { default as AuthorityDropdown } from './authority/AuthorityDropdown.vue';
export { default as YButton } from './button/index.vue';
export { default as YEcharts } from './echarts/index.vue';
export { default as YEditTable } from './edit-table/index.vue';
export { default as YFileImport } from './file-import/index.vue';
export { default as YFormily } from './formily/index.vue';
export { default as YssFormily } from './formily/index.vue'; // 历史兼容别名
export { default as YMonacoDiff } from './monaco/DiffEditor.vue';
export { default as YMonaco } from './monaco/index.vue';
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
// YSheet 异步导出：未使用电子表格时不强制加载 @univerjs
export { YSheet, LocaleType } from './sheet/main-exports';
export type {
  IUniverSheetsCorePresetConfig,
  IWorkbookData,
  LocaleTypeString,
  YSheetEmits,
  YSheetExpose,
  YSheetExtraLocales,
  YSheetExtraPlugin,
  YSheetProps,
} from './sheet/main-exports';

// 类型导出
export type * from './button/types';
export type * from './authority/types';
export type * from './edit-table/types';
export type * from './card/types';
export type * from './table/types';
export type * from './condition-builder/types';
export type * from './tree/types';
export type * from './split-pane/types';
export type * from './formily/types';
export type * from './cron/types';
export type * from './month-calendar/types';
export type * from './file-import/types';
export type * from './echarts/types';
export type * from './monaco/types';
export type * from './locale/types';

/** 全量安装独立成模块，使根入口具名导入可以裁剪安装依赖。 */
export { install, default } from './install';
