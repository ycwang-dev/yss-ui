/**
 * @yss-ui/components/monaco 独立入口
 * 适用于直接使用 Monaco 编辑器并定制高阶功能的业务模块
 */
export { default as YMonaco } from './index.vue';
export { default as YMonacoDiff } from './DiffEditor.vue';
export * from './types';
export { ensureMonacoCss } from './utils/loadMonacoCss';
