/**
 * Monaco 相关公开导出模块。
 * 支持主入口与子路径 @yss-ui/components/monaco 按需消费。
 */
import { defineAsyncComponent } from 'vue';

/** YMonaco 异步组件：按需加载 monaco-editor 核心运行时与语言模块 */
export const YMonaco: (typeof import('./index.vue'))['default'] = defineAsyncComponent(() => import('./index.vue'));

/** YMonacoDiff 异步组件：按需加载 Diff 对比编辑器 */
export const YMonacoDiff: (typeof import('./DiffEditor.vue'))['default'] = defineAsyncComponent(
  () => import('./DiffEditor.vue')
);

export type * from './types';
