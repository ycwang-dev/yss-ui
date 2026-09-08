<script setup lang="ts">
import { YButton, YEditTable, type YEditTableColumn, type YTableActionConfig } from '@yss-ui/components';
import { ref } from 'vue';

defineOptions({ name: 'DemoEditTableColumnFilter' });

const tableRef = ref<any>();

const data = ref<any[]>([
  { _rowKey: '1', name: '解析规则A', type: '1', remark: 'abc' },
  { _rowKey: '2', name: '解析规则B', type: '0', remark: 'def' },
  { _rowKey: '3', name: '目标列C', type: '1', remark: 'ghi' },
  { _rowKey: '4', name: '目标列D', type: '0', remark: 'jkl' },
]);

const optionsMap = {
  type: [
    { label: '内置', value: '1' },
    { label: '自定义', value: '0' },
  ],
};

/** 文本包含筛选（忽略大小写） */
const includeFilter = ({ option, cellValue }: any) => {
  const keyword = String(option?.data ?? '')
    .trim()
    .toLowerCase();
  if (!keyword) return true;
  return String(cellValue ?? '')
    .toLowerCase()
    .includes(keyword);
};

const columns: YEditTableColumn[] = [
  {
    title: '名称(自定义筛选面板)',
    field: 'name',
    component: 'form-item-input',
    filterable: true,
    filters: [{ data: '' }],
    filterMethod: includeFilter,
  },
  {
    title: '类型',
    field: 'type',
    component: 'form-item-select',
    isTransform: true,
    filterable: true,
    filterMultiple: true,
    filters: [
      { label: '内置', value: '1' },
      { label: '自定义', value: '0' },
    ],
    filterMethod: ({ values, cellValue }: any) => {
      if (!values || values.length === 0) return true;
      return values.includes(String(cellValue));
    },
  },
  {
    title: '备注(内置 VxeInput 筛选)',
    field: 'remark',
    component: 'form-item-input',
    filterable: true,
    filters: [{ data: '' }],
    filterMethod: includeFilter,
    filterRender: { name: 'VxeInput', props: { clearable: true, placeholder: '请输入关键词' } },
  },
  { type: 'action', title: '操作', width: 120 },
];

const tableConfig = {
  editConfig: { trigger: 'click', mode: 'row', autoClear: false },
  rowConfig: { keyField: '_rowKey' },
};

const add = () => {
  data.value.push({ _rowKey: `${Date.now()}`, name: '', type: '', remark: '' });
};

/** 清空所有列筛选（切换数据/新增行时常用） */
const clearAllFilter = () => {
  tableRef.value?.getTableInstance?.()?.clearFilter?.();
};

/** 自定义筛选面板内同步选项状态（vxe 筛选面板要求） */
const changeFilterEvent = (option: any) => {
  tableRef.value?.getTableInstance?.()?.updateFilterOptionStatus?.(option, !!option.data);
};

/** 筛选变化回调：远程筛选场景下可在此请求后端 */
const onFilterChange = (params: any) => {
  console.log('filter-change', params);
};

const actionConfig: YTableActionConfig = {
  buttons: [
    {
      key: 'remove',
      text: '删除',
      type: 'link',
      isConfirm: true,
      confirmProps: { title: '是否删除此行？', needLoading: true },
      clickFn: (scope: any, _btn: any, { close, hideLoading }: any) => {
        setTimeout(() => {
          data.value.splice(scope.rowIndex, 1);
          hideLoading?.();
          close?.();
        }, 300);
      },
    },
  ],
};
</script>

<template>
  <div style="padding: 12px">
    <div style="text-align: right; margin-bottom: 8px">
      <YButton style="margin-right: 8px" @click="clearAllFilter">清空筛选</YButton>
      <YButton @click="add">添 行</YButton>
    </div>
    <YEditTable
      ref="tableRef"
      v-model:data="data"
      addable
      :columns="columns"
      :table-config="tableConfig"
      :options-map="optionsMap"
      :action-config="actionConfig"
      @add="add"
      @filter-change="onFilterChange"
    >
      <!-- 自定义筛选面板：与 YTable 对齐，使用 #<field>-filter -->
      <template #name-filter="{ column }">
        <div style="padding: 8px 12px; width: 200px">
          <input
            v-for="(option, index) in column.filters"
            :key="index"
            v-model="option.data"
            placeholder="输入名称关键字"
            style="width: 100%; height: 28px; padding: 4px 8px; border: 1px solid #d9d9d9; border-radius: 4px"
            @input="changeFilterEvent(option)"
          />
        </div>
      </template>
    </YEditTable>
  </div>
</template>

<style scoped></style>
