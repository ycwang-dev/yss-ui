import type { YEditTableColumn } from '@yss-ui/components';

/**
 * 资产大类下拉数据源
 */
export const assetClassOptions = [
  { label: '权益类资产', value: 'equity' },
  { label: '债券类资产', value: 'bond' },
];

/**
 * 算法构成类型下拉选项数据源
 */
export const algoTypeOptions = [
  { label: '手工录入', value: '1' },
  { label: '指标', value: '2' },
  { label: '收益率曲线', value: '3' },
];

/**
 * 时间窗口下拉选项数据源
 */
export const timeWindowOptions = [
  { label: '日', value: 'D' },
  { label: '月', value: 'M' },
  { label: '年', value: 'Y' },
];

/**
 * 编辑表格列配置定义
 */
export const columns: YEditTableColumn[] = [
  {
    title: '序号',
    field: 'seq',
    type: 'seq',
    width: 60,
    align: 'center',
  },
  {
    title: '资产大类',
    field: 'assetClass',
    component: 'form-item-select',
    width: 140,
    props: { placeholder: '请选择' },
  },
  {
    title: '情景设置大类',
    field: 'settingCategory',
    component: 'form-item-input',
    minWidth: 160,
    props: { placeholder: '请输入' },
  },
  {
    title: '情景假设类别',
    field: 'settingType',
    component: 'form-item-input',
    minWidth: 140,
    props: { placeholder: '请输入' },
  },
  {
    title: '算法构成类型',
    field: 'algoType',
    component: 'form-item-select',
    width: 150,
    props: { placeholder: '请选择' },
  },
  {
    title: '算法选择/录入',
    field: 'algoSelect',
    component: 'form-item-input',
    minWidth: 160,
    props: { placeholder: '请输入' },
  },
  {
    title: '轻度倍数/分位数',
    field: 'lightFactor',
    component: 'form-item-input',
    width: 130,
    props: { placeholder: '请输入' },
  },
  {
    title: '中度倍数/分位数',
    field: 'mediumFactor',
    component: 'form-item-input',
    width: 130,
    props: { placeholder: '请输入' },
  },
  {
    title: '重度倍数/分位数',
    field: 'severeFactor',
    component: 'form-item-input',
    width: 130,
    props: { placeholder: '请输入' },
  },
  {
    title: '前推数',
    field: 'forwardPush',
    component: 'form-item-input-number',
    width: 110,
    props: { min: 0 },
    /**
     * 【核心联动设计 1】属性级禁用控制
     * 依据当前行数据 row.algoType 动态判断是否禁用前推数输入
     */
    cellProps: ({ row }) => {
      const isDisabled = row?.algoType === '1'; // '1' 代表 手工录入
      return {
        disabled: isDisabled,
        placeholder: isDisabled ? '不可编辑' : '请输入',
      };
    },
  },
  {
    title: '时间窗口',
    field: 'timeWindow',
    component: 'form-item-select',
    width: 110,
    /**
     * 【核心联动设计 2】属性级禁用控制
     * 当算法构成类型为手工录入时，禁用时间窗口的选择
     */
    cellProps: ({ row }) => {
      const isDisabled = row?.algoType === '1';
      return {
        disabled: isDisabled,
        placeholder: isDisabled ? '不可编辑' : '请选择',
      };
    },
  },
  {
    type: 'action',
    title: '操作',
    width: 100,
    align: 'center',
    fixed: 'right',
  },
];
