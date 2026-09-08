import type { YEditComponentContext, YEditComponentName, YEditTableColumn } from '@yss-ui/components';

/** 参数编辑器业务类型。 */
export type ParameterEditorType = 'select' | 'number' | 'text';

/** 下拉候选项。 */
export interface ParameterOption {
  label: string;
  value: string;
}

/** 动态编辑器示例行数据。 */
export interface ParameterRow {
  _X_ROW_KEY: string;
  parameterName: string;
  parameterAlias: number | string;
  configurable: boolean;
  editorType: ParameterEditorType;
  options?: Record<string, ParameterOption[]>;
}

/** 单元格更新事件参数。 */
export interface ParameterUpdatePayload {
  row: ParameterRow;
  key: string;
  value: unknown;
}

/** 业务编辑器类型与 YEditTable 内置编辑器的映射。 */
const EDIT_COMPONENT_MAP: Record<ParameterEditorType, YEditComponentName> = {
  select: 'form-item-select',
  number: 'form-item-input-number',
  text: 'form-item-input',
};

/** 根据当前行返回实际使用的编辑器。 */
const resolveParameterEditor = ({ row }: YEditComponentContext): YEditComponentName => {
  return EDIT_COMPONENT_MAP[(row as ParameterRow).editorType];
};

/** 创建示例初始数据，避免多次挂载共享可变对象。 */
export const createParameterRows = (): ParameterRow[] => [
  {
    _X_ROW_KEY: 'sample-return',
    parameterName: '样本收益率',
    parameterAlias: 'daily',
    configurable: true,
    editorType: 'select',
    options: {
      parameterAlias: [
        { label: '日收益率', value: 'daily' },
        { label: '周收益率', value: 'weekly' },
        { label: '月收益率', value: 'monthly' },
      ],
    },
  },
  {
    _X_ROW_KEY: 'sample-count',
    parameterName: '样本个数',
    parameterAlias: 250,
    configurable: true,
    editorType: 'number',
  },
  {
    _X_ROW_KEY: 'confidence',
    parameterName: '置信度',
    parameterAlias: '95%',
    configurable: true,
    editorType: 'text',
  },
  {
    _X_ROW_KEY: 'simulation-count',
    parameterName: '模拟次数',
    parameterAlias: 1000,
    configurable: true,
    editorType: 'number',
  },
];

/** 动态编辑器业务列配置。 */
export const parameterColumns: YEditTableColumn[] = [
  {
    field: 'parameterName',
    title: '指标（参数）名称',
    minWidth: 220,
  },
  {
    field: 'parameterAlias',
    title: '参数值名（表达式名）',
    minWidth: 280,
    component: resolveParameterEditor,
    isTransform: true,
    cellProps: ({ row }) => {
      const { editorType } = row as ParameterRow;
      if (editorType === 'select') return { placeholder: '请选择参数值' };
      if (editorType === 'number') return { min: 0, precision: 0, placeholder: '请输入数字' };
      return { maxLength: 50, placeholder: '请输入文本' };
    },
    customRequired: (_value, row) => Boolean((row as ParameterRow).configurable),
  },
  {
    field: 'configurable',
    title: '参数是否可配置',
    width: 160,
    align: 'center',
    formatter: ({ cellValue }) => (cellValue ? '是' : '否'),
  },
];

/** 单元格点击编辑配置。 */
export const dynamicEditorTableConfig = {
  editConfig: {
    trigger: 'click',
    mode: 'cell',
    autoClear: true,
  },
};
