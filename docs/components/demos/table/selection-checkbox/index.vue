<script setup lang="ts">
import { ref } from 'vue';
import { YButton, YTable } from '@yss-ui/components';
import { SELECTION_COLUMNS } from './constant';
import { useSelectionDemo } from './hooks/useSelectionDemo';

defineOptions({ name: 'DemoTableSelectionCheckbox' });

const yTableRef = ref<InstanceType<typeof YTable> | null>(null);

const {
  tableData,
  selectedRowKeys,
  selectedRows,
  lastEventLog,
  handleSelectionChange,
  handleBatchDelete,
  handleBatchExport,
  handleSelectByApi,
  handleClearAll,
  handleGetSelectionInfo,
  handleResetData,
} = useSelectionDemo(yTableRef);
</script>

<template>
  <div class="demo-selection-container">
    <!-- 外部 API 控制区 -->
    <div class="demo-external-actions">
      <span class="actions-label">实例 API 操作：</span>
      <YButton size="small" @click="handleSelectByApi([2, 4])">选中第 2、4 行 (setSelection)</YButton>
      <YButton size="small" @click="handleSelectByApi([1, 2, 3, 4, 5, 6])">全选所有数据 (setSelection)</YButton>
      <YButton size="small" @click="handleClearAll">清空选中 (clearSelection)</YButton>
      <YButton size="small" type="primary" @click="handleGetSelectionInfo">读取当前选中信息</YButton>
      <YButton size="small" @click="handleResetData">重置数据</YButton>
    </div>

    <!-- 表格核心展示 -->
    <YTable
      ref="yTableRef"
      v-model:selected-row-keys="selectedRowKeys"
      v-model:selected-rows="selectedRows"
      :data="tableData"
      :columns="SELECTION_COLUMNS"
      :border="true"
      :row-config="{ keyField: 'id', useKey: true }"
      :checkbox-config="{ highlight: true }"
      @selection-change="handleSelectionChange"
    >
      <!-- 自定义状态列插槽 -->
      <template #status="{ row }">
        <span :class="['status-tag', row.status === 1 ? 'status-active' : 'status-inactive']">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </span>
      </template>

      <!-- 工具栏左侧：显示选中数量 -->
      <template #toolbar-left>
        <div class="selection-toolbar-left">
          <span class="selection-count-badge">
            已选中 {{ selectedRowKeys.length }} 项 / 共 {{ tableData.length }} 条
          </span>
        </div>
      </template>

      <!-- 工具栏右侧：批量操作按钮（自动与选中态联动禁用） -->
      <template #toolbar-right>
        <div class="selection-toolbar-right">
          <YButton :disabled="selectedRowKeys.length === 0" @click="handleBatchExport">
            批量导出 ({{ selectedRowKeys.length }})
          </YButton>
          <YButton danger :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">
            批量删除 ({{ selectedRowKeys.length }})
          </YButton>
        </div>
      </template>
    </YTable>

    <!-- 实时事件日志反馈 -->
    <div class="demo-event-card">
      <span class="log-title">实时响应：</span>
      <span>{{ lastEventLog }}</span>
    </div>
  </div>
</template>

<style scoped lang="less">
@import url('./style.less');
</style>
