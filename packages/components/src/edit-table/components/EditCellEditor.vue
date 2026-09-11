<script setup lang="ts">
import { Tooltip } from 'ant-design-vue';

defineOptions({ name: 'EditCellEditor' });

defineProps<{
  /** 当前列定义 */
  col: any;
  /** 行数据 */
  row: any;
  /** 解析出的编辑器组件类型 */
  editorComponent: any;
  /** 传给编辑器的 props */
  editorProps: Record<string, any>;
  /** 传给编辑器的事件监听 */
  editorEvents: Record<string, any>;
  /** 错误提示 Tooltip 的 props */
  tooltipProps: Record<string, any>;
  /** 当前单元格是否校验报错 */
  isError: boolean;
}>();
</script>

<template>
  <div class="y-edit-table-editor" :class="{ 'is-error': isError }">
    <Tooltip v-bind="tooltipProps">
      <component :is="editorComponent" v-bind="editorProps" :value="row[col.field]" v-on="editorEvents" />
    </Tooltip>
  </div>
</template>
