<script setup lang="ts">
import { ref } from 'vue';
import { useTableHeight } from '@yss-ui/hooks';
import { YTable, YButton } from '@yss-ui/components';

const tableAreaRef = ref<HTMLDivElement>();

// 自动减去分页和工具栏高度
const { tableHeight } = useTableHeight(tableAreaRef, {
  withPagination: true,
  withToolbar: true,
});

const columns = [
  { field: 'name', title: 'Name' },
  { field: 'age', title: 'Age' },
  { field: 'address', title: 'Address' },
];

const data = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  name: `Name ${i}`,
  age: 20 + i,
  address: `Address ${i}`,
}));
</script>

<template>
  <div class="demo-container">
    <div class="header">
      <h3>Flex 布局示例</h3>
      <div class="actions">
        <YButton type="primary">查询</YButton>
        <YButton>重置</YButton>
      </div>
    </div>

    <!-- 
      关键点：
      1. flex: 1 自动填充剩余空间
      2. overflow: hidden 防止内容撑开容器
      3. ref 传给 hook 监听高度
    -->
    <div ref="tableAreaRef" class="table-area">
      <YTable
        :height="tableHeight"
        :data="data"
        :columns="columns"
        :pageable="true"
        :toolbar-config="{ custom: true }"
      />
    </div>

    <div class="footer">底部固定区域 (e.g. 汇总信息)</div>
  </div>
</template>

<style scoped>
.demo-container {
  height: 500px; /* 固定高度容器 */
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
}

.header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-area {
  flex: 1;
  overflow: hidden;
  padding: 0 16px;
}

.footer {
  padding: 16px;
  border-top: 1px solid #eee;
  text-align: center;
  background: #f9f9f9;
}
</style>
