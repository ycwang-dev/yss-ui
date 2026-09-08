<script setup lang="ts">
import { YTable, type YTableColumn } from '@yss-ui/components';
import { ref } from 'vue';

defineOptions({ name: 'DemoTableConfigReference' });

const columns: YTableColumn[] = [
  { type: 'checkbox', width: 56, align: 'center' },
  { type: 'seq', title: '序号', width: 64, align: 'center' },
  { field: 'name', title: '任务名称', minWidth: 180 },
  { field: 'status', title: '状态', width: 120 },
  { field: 'owner', title: '负责人', width: 120 },
];

const data = ref([
  { id: 1, name: '任务同步', status: '可勾选', owner: '张三' },
  { id: 2, name: '批量导出', status: '禁用', owner: '李四' },
  { id: 3, name: '状态回写', status: '可勾选', owner: '王五' },
  { id: 4, name: '失败补偿', status: '禁用', owner: '赵六' },
]);

const checkIdValid = (id: number, allowEven: boolean) => {
  return allowEven ? true : id % 2 === 1;
};

const stableCheckboxConfig = {
  highlight: true,
  checkMethod: ({ row }: any) => checkIdValid(row.id, false),
};
</script>

<template>
  <div class="config-reference-demo">
    <div class="config-reference-block">
      <div class="config-reference-title">内联对象写法</div>
      <div class="config-reference-desc">业务层每次渲染都会创建新对象，但组件内部会做稳定化处理。</div>
      <YTable
        :data="data"
        :columns="columns"
        :row-config="{ keyField: 'id', useKey: true }"
        :checkbox-config="{ highlight: true, checkMethod: ({ row }: any) => checkIdValid(row.id, false) }"
      />
    </div>

    <div class="config-reference-block">
      <div class="config-reference-title">稳定引用写法</div>
      <div class="config-reference-desc">如果业务层本身愿意维护稳定引用，也同样支持。</div>
      <YTable
        :data="data"
        :columns="columns"
        :row-config="{ keyField: 'id', useKey: true }"
        :checkbox-config="stableCheckboxConfig"
      />
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
