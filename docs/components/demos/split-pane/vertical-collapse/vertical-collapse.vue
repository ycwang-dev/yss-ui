<script setup lang="ts">
import { YSplitPane, YTable } from '@yss-ui/components';
import { useTopAdaptiveTable } from './hooks/useTopAdaptiveTable';

defineOptions({ name: 'SplitPaneVerticalCollapseDemo' });

const { topSize, collapsed, onResize, topTableAreaRef, topTableHeight, topColumns, topData } = useTopAdaptiveTable();
</script>

<template>
  <div class="vertical-layout">
    <YSplitPane
      v-model:collapsed="collapsed"
      v-model:top-height="topSize"
      :initial-height="300"
      direction="vertical"
      :min-height="120"
      :max-height="500"
      :min-width="350"
      :max-width="600"
      storage-key="demo-split-pane-vertical-collapse-v2"
      @resize="onResize"
    >
      <template #top>
        <div class="panel panel-top">
          <div class="panel__title">上侧区域（可折叠）</div>
          <div class="panel__desc">拖动分割线可调整高度，点击中间按钮可折叠/展开。</div>
          <div ref="topTableAreaRef" class="top-table-area">
            <YTable :height="topTableHeight" :data="topData" :columns="topColumns" border show-overflow size="small" />
          </div>
        </div>
      </template>

      <template #bottom>
        <div class="panel panel-bottom">
          <div class="panel__title">下侧区域（主内容）</div>
          <div class="status">
            <span>上侧高度：{{ topSize }}px</span>
            <span>{{ collapsed ? '当前状态：已折叠' : '当前状态：已展开' }}</span>
          </div>
        </div>
      </template>
    </YSplitPane>
  </div>
</template>

<style scoped lang="less">
@import url('./style.less');
</style>
