<script setup lang="ts">
import { YEditTable } from '@yss-ui/components';
import { dynamicEditorTableConfig } from './constant';
import { useDynamicEditor } from './hooks/useDynamicEditor';

defineOptions({ name: 'DemoEditTableDynamicEditor' });

const { rows, columns, formattedRows, lastUpdate, handleUpdateRow } = useDynamicEditor();
</script>

<template>
  <div class="dynamic-editor-demo">
    <div class="dynamic-editor-demo__tip">
      点击“参数值名”单元格进入编辑：样本收益率使用 Select，数字参数使用 InputNumber，置信度使用 Input。
    </div>

    <YEditTable
      v-model:data="rows"
      :columns="columns"
      :table-config="dynamicEditorTableConfig"
      @update-row="handleUpdateRow"
    />

    <div class="dynamic-editor-demo__status">最近更新：{{ lastUpdate }}</div>
    <pre class="dynamic-editor-demo__data">{{ formattedRows }}</pre>
  </div>
</template>

<style scoped lang="less">
@import url('./style.less');
</style>
