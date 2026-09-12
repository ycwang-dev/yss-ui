/**
 * ECharts 相关公开导出模块。
 * 支持主入口与子路径 @yss-ui/components/echarts 按需消费。
 */
import { defineAsyncComponent } from 'vue';

/** YEcharts 异步组件：按需加载 echarts 图表核心运行时 */
export const YEcharts: (typeof import('./index.vue'))['default'] = defineAsyncComponent(() => import('./index.vue'));

export type * from './types';
