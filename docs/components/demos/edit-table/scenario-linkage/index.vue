<script setup lang="ts">
import { ref } from 'vue';
import { YEditTable, YButton } from '@yss-ui/components';
import type { YTableActionConfig } from '@yss-ui/components';
import { Card as ACard } from 'ant-design-vue';
import { columns, algoTypeOptions, timeWindowOptions, assetClassOptions } from './constant';

defineOptions({ name: 'ScenarioHypothesisDemo' });

/**
 * 字典数据源映射
 * 供表格在下拉编辑态及查看态时做自动 label-value 映射与翻译
 */
const optionsMap = {
  assetClass: assetClassOptions,
  algoType: algoTypeOptions,
  timeWindow: timeWindowOptions,
};

/**
 * 模拟情景假设表格的初始化数据源
 */
const tableData = ref<any[]>([
  {
    id: '1',
    assetClass: 'equity',
    settingCategory: '股票市场指数下跌幅度 (%)',
    settingType: '上证指数',
    algoType: '1', // 默认 '1' (手工录入) -> 对应行的前推数和时间窗口会自动处于不可编辑状态
    algoSelect: '上证指数',
    lightFactor: '1',
    mediumFactor: '1.2',
    severeFactor: '1.5',
    forwardPush: undefined,
    timeWindow: undefined,
  },
  {
    id: '2',
    assetClass: 'equity',
    settingCategory: '股票市场指数下跌幅度 (%)',
    settingType: '创业板指',
    algoType: '1', // 默认 '1' (手工录入)
    algoSelect: '创业板指',
    lightFactor: '1',
    mediumFactor: '1.2',
    severeFactor: '1.5',
    forwardPush: undefined,
    timeWindow: undefined,
  },
  {
    id: '3',
    assetClass: 'equity',
    settingCategory: '股票市场指数下跌幅度 (%)',
    settingType: '科创50',
    algoType: '2', // 默认 '2' (指标) -> 对应行处于可编辑状态
    algoSelect: '科创50',
    lightFactor: '1',
    mediumFactor: '1.2',
    severeFactor: '1.5',
    forwardPush: 36,
    timeWindow: 'M',
  },
]);

/**
 * 监听单元格变更，执行数据层联动
 * @param payload 变更的载荷，包含当前行对象、变更键、变更后的值
 */
const handleUpdateRow = ({ row, key, value }: { row: any; key: string; value: any }) => {
  /**
   * 【核心联动设计 3】数据级清空控制
   * 当用户修改算法构成类型 (algoType) 为“手工录入(1)”时，自动将前推数和时间窗口的数据设为空
   */
  if (key === 'algoType' && value === '1') {
    row.forwardPush = undefined;
    row.timeWindow = undefined;
  }
};

/**
 * 添加一行空数据，默认设为可编辑的“指标(2)”类型
 */
const handleAddRow = () => {
  tableData.value.push({
    id: Date.now().toString(),
    assetClass: undefined,
    settingCategory: '',
    settingType: '',
    algoType: '2',
    algoSelect: '',
    lightFactor: '',
    mediumFactor: '',
    severeFactor: '',
    forwardPush: undefined,
    timeWindow: undefined,
  });
};

/**
 * 表格操作列配置
 */
const actionConfig: YTableActionConfig = {
  buttons: [
    {
      label: '删除',
      value: 'delete',
      type: 'link',
      isConfirm: true,
      confirmProps: { title: '确定要删除这一行吗？' },
      click: ({ rowIndex }) => {
        tableData.value.splice(rowIndex, 1);
      },
    },
  ],
};
</script>

<template>
  <div class="demo-scenario-container">
    <ACard title="情景假设设置" :bordered="false" class="premium-card">
      <template #extra>
        <YButton type="primary" @click="handleAddRow">添加行</YButton>
      </template>

      <!-- YEditTable 核心组件 -->
      <YEditTable
        v-model:data="tableData"
        :columns="columns"
        :options-map="optionsMap"
        :action-config="actionConfig"
        :table-config="{ editConfig: { trigger: 'click', mode: 'row' } }"
        @update-row="handleUpdateRow"
      >
        <!-- 
          【自定义序号列渲染】
          由于 YEditTable 的列自定义渲染机制会覆盖 vxe-table 的原生 type="seq" 逻辑，
          此处通过声明 `#seq` 字段插槽，在非编辑态下返回基于零基索引 `rowIndex` 的动态递增序号，从而解决序号列展示为空白的问题。
        -->
        <template #seq="{ rowIndex }">
          {{ rowIndex + 1 }}
        </template>
      </YEditTable>
    </ACard>
  </div>
</template>

<style scoped lang="less">
@import url('./style.less');
</style>
