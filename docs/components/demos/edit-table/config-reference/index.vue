<script setup lang="ts">
import { YEditTable, type YEditTableColumn } from '@yss-ui/components';
import { ref } from 'vue';

defineOptions({ name: 'DemoEditTableConfigReference' });

const columns: YEditTableColumn[] = [
  { type: 'checkbox', width: 56, align: 'center' },
  { type: 'seq', title: '序号', width: 64, align: 'center' },
  { title: '任务名称', field: 'name', component: 'form-item-input', minWidth: 180 },
  {
    title: '优先级',
    field: 'level',
    component: 'form-item-select',
    options: [
      { label: '高', value: 'high' },
      { label: '中', value: 'medium' },
      { label: '低', value: 'low' },
    ],
    width: 120,
  },
];

const createData = () => [
  { id: 1, name: '回款核对', level: 'high' },
  { id: 2, name: '估值复核', level: 'medium' },
  { id: 3, name: '日报生成', level: 'low' },
  { id: 4, name: '异常修复', level: 'high' },
];

const inlineData = ref(createData());
const stableData = ref(createData());

const checkIdValid = (id: number) => id !== 2 && id !== 4;

const stableTableConfig = {
  checkboxConfig: {
    highlight: true,
    checkMethod: ({ row }: any) => checkIdValid(row.id),
  },
  editConfig: {
    trigger: 'click',
    mode: 'row',
  },
};
</script>

<template>
  <div class="config-reference-demo">
    <div class="config-reference-block">
      <div class="config-reference-title">内联 table-config 写法</div>
      <div class="config-reference-desc">`table-config` 中包含嵌套函数配置时，组件内部也会做稳定化透传。</div>
      <YEditTable
        v-model:data="inlineData"
        :columns="columns"
        :table-config="{
          checkboxConfig: {
            highlight: true,
            checkMethod: ({ row }: any) => checkIdValid(row.id),
          },
          editConfig: {
            trigger: 'click',
            mode: 'row',
          },
        }"
      />
    </div>

    <div class="config-reference-block">
      <div class="config-reference-title">稳定引用 table-config 写法</div>
      <div class="config-reference-desc">业务层自行维护稳定引用也保持兼容。</div>
      <YEditTable v-model:data="stableData" :columns="columns" :table-config="stableTableConfig" />
    </div>
  </div>
</template>

<style scoped>
.config-reference-demo {
  display: grid;
  gap: 16px;
}

.config-reference-block {
  padding: 16px;
  border: 1px solid #e8ebf0;
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(250 252 255 / 100%) 0%, rgb(255 255 255 / 100%) 100%);
}

.config-reference-title {
  font-size: 16px;
  font-weight: 600;
  color: #11192a;
}

.config-reference-desc {
  margin: 6px 0 12px;
  font-size: 13px;
  color: #6b7280;
}
</style>
