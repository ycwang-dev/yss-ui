<template>
  <div ref="containerRef" :style="rootStyle" class="yss-echarts__container" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import './hooks/echartsRegister';
import { useEcharts } from './hooks/useEcharts';
import type { YEchartsExpose, YEchartsProps } from './type';

/**
 * YEcharts 图表组件（ECharts 6）
 * - 响应式自适应：ResizeObserver 监听容器
 * - 支持主题/渲染器切换：变更后重建实例
 * - 暴露实例方法：getInstance/resize/setOption/dispose
 */

/**
 * 组件 Props
 */
const props = withDefaults(defineProps<YEchartsProps>(), {
  options: () => ({}),
  width: '100%',
  height: 360,
  theme: 'light',
  renderer: 'canvas',
  autoresize: true,
  darkMode: false,
  initOptions: () => ({}),
  setOptionOpts: () => ({}),
});

const containerRef = ref<HTMLDivElement | null>(null);

const { rootStyle, getInstance, resize, setOption, dispose } = useEcharts(containerRef, props);

/**
 * 暴露实例方法
 * @returns getInstance - 获取 ECharts 实例
 * @returns resize - 触发重绘
 * @returns setOption - 设置配置项
 * @returns dispose - 销毁实例
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
defineExpose({ getInstance, resize, setOption, dispose } as YEchartsExpose);
</script>

<script lang="ts">
export default { name: 'YEcharts' };
</script>

<style scoped>
.yss-echarts__container {
  width: 100%;
}
</style>
