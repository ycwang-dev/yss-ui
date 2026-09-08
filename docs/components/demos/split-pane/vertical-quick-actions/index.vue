<script setup lang="ts">
import { YSplitPane, YTable, YEcharts } from '@yss-ui/components';
import { useVerticalQuickActionsDemo } from './hooks/useVerticalQuickActionsDemo';

defineOptions({ name: 'SplitPaneVerticalQuickActionsDemo' });

const {
  topSize,
  collapsed,
  onResize,
  topTableAreaRef,
  topTableHeight,
  topColumns,
  topData,
  bottomChartAreaRef,
  bottomChartHeight,
  lineOption,
} = useVerticalQuickActionsDemo();
</script>

<template>
  <div class="vertical-quick-actions-layout">
    <YSplitPane
      v-model:collapsed="collapsed"
      v-model:top-height="topSize"
      :initial-height="320"
      direction="vertical"
      :show-vertical-quick-actions="true"
      :draggable="false"
      :min-height="0"
      :max-height="560"
      storage-key="demo-split-pane-vertical-quick-actions-v1"
      @resize="onResize"
    >
      <template #top>
        <div class="panel panel-top">
          <div class="panel__title">上侧区域：高度自适应表格</div>
          <div class="panel__desc">开启快捷按钮后，可一键隐藏上/下区域或恢复初始高度。</div>
          <div ref="topTableAreaRef" class="top-table-area">
            <YTable :height="topTableHeight" :data="topData" :columns="topColumns" border show-overflow size="small" />
          </div>
        </div>
      </template>

      <template #bottom>
        <div class="panel panel-bottom">
          <div class="panel__title">下侧区域：高度自适应折线图</div>
          <div class="panel__desc">图表容器高度跟随下侧区域变化自动伸缩。</div>
          <div ref="bottomChartAreaRef" class="bottom-chart-area">
            <div class="chart-shell" :style="{ height: `${bottomChartHeight}px` }">
              <YEcharts :options="lineOption" height="100%" />
            </div>
          </div>
        </div>
      </template>
    </YSplitPane>
  </div>
</template>

<style scoped lang="less">
@import url('./style.less');
</style>
