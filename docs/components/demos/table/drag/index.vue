<script setup lang="ts">
import { YTable } from '@yss-ui/components';
import { ref } from 'vue';

defineOptions({ name: 'DemoTableDrag' });

const columns = [
  { type: 'seq' as const, title: '序号', width: 60, align: 'center' as const },
  { title: '姓名', field: 'name' },
  { title: '年龄', field: 'age' },
];

/** 生成 20 行测试数据，确保表格出现滚动条以演示拖拽自动滚动 */
const generateRows = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    _X_ROW_KEY: String(i + 1),
    name: `Name${i + 1}`,
    age: 18 + (i % 20),
  }));

const tableData = ref(generateRows(20));

const handleDragEnd = (rows: any[]) => {
  // eslint-disable-next-line no-console
  console.log(
    '拖拽后顺序：',
    rows.map(r => r.name)
  );
};
</script>

<template>
  <div style="padding: 12px">
    <YTable
      v-model:data="tableData"
      :columns="columns"
      :row-dragable="true"
      :row-config="{ drag: true }"
      :pageable="false"
      height="400"
      @row-dragend="handleDragEnd"
    />
  </div>
</template>

<style scoped></style>
