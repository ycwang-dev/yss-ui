<script setup lang="ts">
import { YSplitPane, YTree, YTable, YEcharts } from '@yss-ui/components';
import { useNestedVerticalQuickActions } from './hooks/useNestedVerticalQuickActions';

defineOptions({ name: 'SplitPaneNestedVerticalQuickActionsDemo' });

const {
  outerLeftWidth,
  outerCollapsed,
  innerTopSize,
  innerCollapsed,
  selectedKeys,
  treeData,
  topTableAreaRef,
  topTableHeight,
  topColumns,
  topData,
  bottomChartAreaRef,
  bottomChartHeight,
  lineOption,
  onInnerResize,
} = useNestedVerticalQuickActions();
</script>

<template>
  <div class="nested-split-layout">
    <YSplitPane
      v-model:left-width="outerLeftWidth"
      v-model:collapsed="outerCollapsed"
      :min-width="220"
      :max-width="380"
      collapse-animation="transform"
      resize-mode="deferred"
      storage-key="demo-split-pane-nested-outer-v1"
    >
      <template #left>
        <div class="left-tree-pane">
          <div class="left-tree-pane__title">资源树</div>
          <div class="left-tree-pane__body">
            <YTree v-model:selected-keys="selectedKeys" :tree-data="treeData" block-node default-expand-all />
          </div>
        </div>
      </template>

      <template #right>
        <div class="right-nested-pane">
          <YSplitPane
            v-model:collapsed="innerCollapsed"
            v-model:top-height="innerTopSize"
            direction="vertical"
            :show-vertical-quick-actions="true"
            :initial-height="300"
            :min-height="0"
            :max-height="560"
            :draggable="false"
            storage-key="demo-split-pane-nested-inner-v1"
            @resize="onInnerResize"
          >
            <template #top>
              <div class="panel panel-top">
                <div class="panel__title">上侧区域：高度自适应表格</div>
                <div class="panel__desc">内层 vertical SplitPane 开启快捷按钮组（showVerticalQuickActions=true）。</div>
                <div ref="topTableAreaRef" class="top-table-area">
                  <YTable
                    :height="topTableHeight"
                    :data="topData"
                    :columns="topColumns"
                    border
                    show-overflow
                    size="small"
                  />
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
    </YSplitPane>
  </div>
</template>

<style scoped lang="less">
@import url('./style.less');
</style>
