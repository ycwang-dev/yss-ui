<script setup lang="ts">
import type { YEditTableColumn, YTableActionConfig } from '@yss-ui/components';
import { YEditTable } from '@yss-ui/components';
import { ref } from 'vue';

defineOptions({ name: 'DemoEditTableDrag' });

const tableRef = ref<any>();

/**
 * 生成足够多的测试数据以触发滚动条
 * @param count - 数据条数
 */
const generateData = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    name: `用户${i + 1}`,
    age: 18 + (i % 30),
    sex: i % 2 === 0 ? '1' : '0',
  }));

const data = ref<any[]>(generateData(30));

const columns: YEditTableColumn[] = [
  { title: '姓名', field: 'name', component: 'form-item-input' },
  { title: '年龄', field: 'age', component: 'form-item-input-number', props: { min: 0 } },
  {
    title: '性别',
    field: 'sex',
    component: 'form-item-select',
    isTransform: true,
    props: { fieldNames: { label: 'dictName', value: 'dictValue' } },
  },
  { type: 'action', title: '操作', width: 160 },
];

const tableConfig = { editConfig: { trigger: 'click', mode: 'row' } };

const optionsMap = {
  sex: [
    { dictName: '男', dictValue: '1' },
    { dictName: '女', dictValue: '0' },
  ],
};

/** 添加到底部（默认） */
const addBottom = () => {
  const item: any = {};
  columns.forEach(c => c.field && (item[c.field] = ''));
  data.value.push(item);
};

/** 添加到顶部 */
const dataTop = ref<any[]>(generateData(30));
const addTop = () => {
  const item: any = {};
  columns.forEach(c => c.field && (item[c.field] = ''));
  dataTop.value.unshift(item);
};

const actionConfig: YTableActionConfig = {
  buttons: [
    {
      key: 'remove',
      text: '删除',
      type: 'link',
      isConfirm: true,
      confirmProps: { title: '是否删除此行？', needLoading: true },
      clickFn: (scope: any, _btn: any, { close, hideLoading }: any) => onDelete(data, { scope, close, hideLoading }),
    },
  ],
};

const actionConfigTop: YTableActionConfig = {
  buttons: [
    {
      key: 'remove',
      text: '删除',
      type: 'link',
      isConfirm: true,
      confirmProps: { title: '是否删除此行？', needLoading: true },
      clickFn: (scope: any, _btn: any, { close, hideLoading }: any) => onDelete(dataTop, { scope, close, hideLoading }),
    },
  ],
};

const onDelete = (listRef: { value: any[] }, payload: any) => {
  const { scope, close, hideLoading } = payload || {};
  const { rowIndex } = scope || {};
  setTimeout(() => {
    listRef.value.splice(rowIndex, 1);
    hideLoading?.();
    close?.();
  }, 300);
};
</script>

<template>
  <div style="padding: 12px">
    <h4>添加到底部（默认），自动滚动到新行</h4>
    <YEditTable
      ref="tableRef"
      v-model:data="data"
      addable
      row-dragable
      max-height="400"
      :columns="columns"
      :table-config="tableConfig"
      :options-map="optionsMap"
      :action-config="actionConfig"
      @add="addBottom"
    />

    <h4 style="margin-top: 24px">添加到顶部，自动滚动到新行</h4>
    <YEditTable
      v-model:data="dataTop"
      addable
      row-dragable
      max-height="400"
      add-position="top"
      :columns="columns"
      :table-config="tableConfig"
      :options-map="optionsMap"
      :action-config="actionConfigTop"
      @add="addTop"
    />
  </div>
</template>

<style scoped></style>
