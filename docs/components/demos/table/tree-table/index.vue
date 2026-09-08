<script setup lang="ts">
import { ref } from 'vue';
import { YButton, YTable } from '@yss-ui/components';
import {
  createTreeActionConfig,
  TREE_CONFIG,
  TREE_ROW_CONFIG,
  TREE_TABLE_COLUMNS,
  TREE_TABLE_DATA,
  type DirectoryTreeNode,
} from './constant';

defineOptions({ name: 'DemoTableTreeTable' });

const tableData = ref<DirectoryTreeNode[]>(cloneTreeData(TREE_TABLE_DATA));

/**
 * 克隆树形数据，避免 demo 操作直接修改静态常量。
 *
 * @param data 原始树形数据
 * @returns 克隆后的树形数据
 */
function cloneTreeData(data: DirectoryTreeNode[]): DirectoryTreeNode[] {
  return data.map(item => ({
    ...item,
    children: item.children ? cloneTreeData(item.children) : undefined,
  }));
}

/**
 * 删除指定节点及其子节点。
 *
 * @param data 当前树形数据
 * @param targetId 目标节点 id
 * @returns 删除后的树形数据
 */
function removeTreeNode(data: DirectoryTreeNode[], targetId: string): DirectoryTreeNode[] {
  return data
    .filter(item => item.id !== targetId)
    .map(item => ({
      ...item,
      children: item.children ? removeTreeNode(item.children, targetId) : undefined,
    }));
}

/**
 * 新增节点示例
 */
const handleCreate = () => {
  alert('新增节点');
};

/**
 * 编辑节点示例
 *
 * @param row 当前行数据
 */
const handleEdit = (row: DirectoryTreeNode) => {
  alert(`编辑节点：${row.nodeName}`);
};

/**
 * 删除节点示例
 *
 * @param row 当前行数据
 */
const handleDelete = (row: DirectoryTreeNode) => {
  tableData.value = removeTreeNode(tableData.value, row.id);
};

const actionConfig = createTreeActionConfig(handleEdit, handleDelete);
</script>

<template>
  <div class="demo-tree-table">
    <YTable
      id="demo-table-tree-table"
      :data="tableData"
      :columns="TREE_TABLE_COLUMNS"
      :row-config="TREE_ROW_CONFIG"
      :tree-config="TREE_CONFIG"
      :action-config="actionConfig"
      :pageable="false"
      :toolbar-config="{ custom: true }"
      height="360"
    >
      <template #toolbar-left>
        <YButton type="primary" @click="handleCreate">新增节点</YButton>
      </template>
    </YTable>
  </div>
</template>
<style scoped lang="less">
@import url('./style.less');
</style>
