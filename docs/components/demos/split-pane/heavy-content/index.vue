<script setup lang="ts">
import { ref } from 'vue';
import { YSplitPane, YTable, YTree } from '@yss-ui/components';
import {
  HEAVY_TABLE_COLUMNS,
  HEAVY_TABLE_DATA,
  HEAVY_TREE_DATA,
  TABLE_HEIGHT,
  TABLE_ROW_CONFIG,
  TREE_FIELD_NAMES,
  TREE_HEIGHT,
  VIRTUAL_X_CONFIG,
} from './constant';

defineOptions({ name: 'DemoSplitPaneHeavyContent' });

/** 折叠目标状态。 */
const collapsed = ref(false);

/** 左侧面板宽度。 */
const leftWidth = ref(320);

/** 当前选中的树节点。 */
const selectedKeys = ref<string[]>([]);
</script>

<template>
  <div class="heavy-split-pane-demo">
    <YSplitPane
      v-model:collapsed="collapsed"
      v-model:left-width="leftWidth"
      :min-width="240"
      :max-width="480"
      collapse-animation="transform"
      resize-mode="deferred"
      storage-key="demo-heavy-split-pane"
    >
      <template #left>
        <section class="heavy-split-pane-demo__tree-pane">
          <header class="heavy-split-pane-demo__header">
            <strong>千级产品树</strong>
            <span>1,020 个节点</span>
          </header>
          <YTree
            v-model:selected-keys="selectedKeys"
            :tree-data="HEAVY_TREE_DATA"
            :field-names="TREE_FIELD_NAMES"
            :height="TREE_HEIGHT"
            block-node
            default-expand-all
          />
        </section>
      </template>

      <template #right>
        <section class="heavy-split-pane-demo__table-pane">
          <header class="heavy-split-pane-demo__header">
            <strong>30 列估值表格</strong>
            <span>固定列 + 横向虚拟滚动</span>
          </header>
          <div class="heavy-split-pane-demo__table">
            <YTable
              :data="HEAVY_TABLE_DATA"
              :columns="HEAVY_TABLE_COLUMNS"
              :row-config="TABLE_ROW_CONFIG"
              :virtual-x-config="VIRTUAL_X_CONFIG"
              :height="TABLE_HEIGHT"
              border
              show-overflow
            />
          </div>
        </section>
      </template>
    </YSplitPane>
  </div>
</template>

<style scoped lang="less">
@import url('./style.less');
</style>
