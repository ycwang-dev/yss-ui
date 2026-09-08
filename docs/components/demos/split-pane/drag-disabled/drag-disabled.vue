<script setup lang="ts">
import { ref } from 'vue';
import { YSplitPane } from '@yss-ui/components';

defineOptions({ name: 'SplitPaneDragDisabledDemo' });

const leftWidth = ref<number>(240);
const collapsed = ref<boolean>(false);
</script>

<template>
  <div class="drag-disabled-layout">
    <YSplitPane
      v-model:left-width="leftWidth"
      v-model:collapsed="collapsed"
      :draggable="false"
      :min-width="180"
      :max-width="360"
      collapsible
    >
      <template #left>
        <div class="pane pane-left">
          <div class="pane__title">左侧固定宽度区域</div>
          <div class="pane__desc">分割线拖动已禁用，但折叠/展开按钮仍可用。</div>
        </div>
      </template>
      <template #right>
        <div class="pane pane-right">
          <div class="status">
            <span>左侧宽度：{{ leftWidth }}px</span>
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
