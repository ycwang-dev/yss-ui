import type { PropType } from 'vue';
import type { VxeTablePropTypes } from 'vxe-table';
import type { ActionButtonConfig, YTableActionConfig } from '../table/type';
import type { YEditComponentName, YEditTableColumn, YEditTableErrorTooltipConfig } from './type';

/** 未配置编辑器时使用的默认输入框。 */
export const DEFAULT_EDIT_COMPONENT: YEditComponentName = 'form-item-input';

/**
 * 将驼峰/下划线转换为中划线（用于 DOM 模板下的插槽名兼容）。
 *
 * @param input 原始字段名。
 * @returns 转换后的 kebab-case 格式字符串。
 */
export const toKebabCase = (input: string): string => {
  return String(input)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
};

/**
 * 获取当前单元格实际使用的编辑器类型。
 *
 * @param column 当前列配置。
 * @param row 当前行数据。
 * @returns 当前单元格对应的内置编辑器名称。
 */
export const resolveEditComponentName = (column: YEditTableColumn, row: any): YEditComponentName => {
  const { component } = column;
  if (typeof component === 'function') {
    return component({ row, field: column.field, column }) ?? DEFAULT_EDIT_COMPONENT;
  }
  return component ?? DEFAULT_EDIT_COMPONENT;
};

/**
 * 解析列对应的表头插槽名（支持 fieldHeader / field-header / header）。
 *
 * @param col 列配置。
 * @param slots 插槽集合。
 * @returns 匹配到的插槽名或 undefined。
 */
export const getHeaderSlotName = (col: any, slots: Record<string, any>): string | undefined => {
  if (!col?.field) return slots.header ? 'header' : undefined;
  if (slots[`${col.field}Header`]) return `${col.field}Header`;
  const kebab = `${toKebabCase(col.field)}-header`;
  if (slots[kebab]) return kebab;
  return slots.header ? 'header' : undefined;
};

/**
 * 解析列对应的自定义单元格插槽名（支持 field / kebab-case field）。
 *
 * @param col 列配置。
 * @param slots 插槽集合。
 * @returns 匹配到的插槽名或 undefined。
 */
export const getCellSlotName = (col: any, slots: Record<string, any>): string | undefined => {
  if (!col?.field) return undefined;
  const kebab = toKebabCase(col.field);
  if (slots[kebab]) return kebab;
  if (slots[col.field]) return col.field;
  return undefined;
};

/**
 * 解析列对应的筛选面板插槽名（支持 fieldFilter / field-filter / kebab-filter / filter）。
 *
 * @param col 列配置。
 * @param slots 插槽集合。
 * @returns 匹配到的插槽名或 undefined。
 */
export const getFilterSlotName = (col: any, slots: Record<string, any>): string | undefined => {
  if (!col?.field) return slots.filter ? 'filter' : undefined;
  if (slots[`${col.field}Filter`]) return `${col.field}Filter`;
  if (slots[`${col.field}-filter`]) return `${col.field}-filter`;
  const kebab = `${toKebabCase(col.field)}-filter`;
  if (slots[kebab]) return kebab;
  return slots.filter ? 'filter' : undefined;
};

/**
 * 解析展开行对应的插槽名（支持 expand-row / expandRow）。
 *
 * @param col 列配置。
 * @param slots 插槽集合。
 * @returns 匹配到的插槽名或 undefined。
 */
export const getExpandSlotName = (col: any, slots: Record<string, any>): string | undefined => {
  if (col?.type !== 'expand') return undefined;
  if (slots['expand-row']) return 'expand-row';
  if (slots.expandRow) return 'expandRow';
  return undefined;
};

/**
 * YEditTable 组件 Props 静态定义。
 */
export const editTableProps = {
  data: { type: Array as PropType<any[]>, default: (): any[] => [] },
  columns: { type: Array as PropType<YEditTableColumn[]>, default: (): YEditTableColumn[] => [] },
  tableConfig: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  optionsMap: { type: Object as PropType<Record<string, any[]>>, default: () => ({}) },
  rowOptionsFieldName: { type: String as PropType<string>, default: 'options' },
  disabled: { type: Boolean as PropType<boolean>, default: false },
  loading: { type: Boolean as PropType<boolean>, default: false },
  maxHeight: { type: [Number, String] as PropType<number | string>, default: undefined },
  /** 操作列（不再默认追加，仅当外部提供列 type: 'action' 或提供 actionConfig.buttons 时手动使用） */
  actionConfig: {
    type: Object as PropType<YTableActionConfig>,
    default: (): YTableActionConfig => ({ buttons: [] as ActionButtonConfig[] }),
  },
  /** 拖拽 */
  rowDragable: { type: Boolean as PropType<boolean>, default: false },
  showDragHandle: { type: Boolean as PropType<boolean>, default: true },
  dragHandleWidth: { type: [Number, String] as PropType<number | string>, default: 46 },
  /** 拖拽把手列位置与固定 */
  dragHandlePlacement: { type: String as PropType<'left' | 'right'>, default: 'left' },
  dragHandleFixed: { type: [Boolean, String] as PropType<boolean | 'left' | 'right'>, default: false },
  rowDragConfig: { type: Object as PropType<VxeTablePropTypes.RowDragConfig> },
  /** 工具栏/展开 */
  toolbarConfig: { type: Object as PropType<{ custom?: boolean }>, default: () => ({ custom: false }) },
  expandConfig: { type: Object as PropType<VxeTablePropTypes.ExpandConfig>, default: () => ({}) },
  /** 横向虚拟滚动配置 (vxe-table v4.10.6+) */
  virtualXConfig: { type: Object as PropType<VxeTablePropTypes.VirtualXConfig> },
  /** 纵向虚拟滚动配置 (vxe-table v4.10.6+) */
  virtualYConfig: { type: Object as PropType<VxeTablePropTypes.VirtualYConfig> },
  /** @deprecated 请使用 virtualXConfig 替代 */
  scrollX: { type: Object as PropType<VxeTablePropTypes.ScrollX> },
  /** @deprecated 请使用 virtualYConfig 替代 */
  scrollY: { type: Object as PropType<VxeTablePropTypes.ScrollY> },
  /** 分页 */
  pageable: { type: Boolean as PropType<boolean>, default: false },
  pagination: {
    type: Object as PropType<{
      current: number;
      pageSize: number;
      total?: number;
      showSizeChanger?: boolean;
      showQuickJumper?: boolean;
      pageSizeOptions?: (number | string)[];
      remote?: boolean;
    }>,
    default: () => ({
      current: 1,
      pageSize: 20,
      total: 0,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      remote: false,
    }),
  },
  /** UI */
  addable: { type: Boolean as PropType<boolean>, default: false },
  addBtnText: { type: String as PropType<string>, default: '' },
  /** 新增行位置：'top' 插入到顶部，'bottom' 追加到底部 */
  addPosition: { type: String as PropType<'top' | 'bottom'>, default: 'bottom' },
  /** 添加行后是否自动滚动到新行 */
  autoScrollOnAdd: { type: Boolean as PropType<boolean>, default: true },
  /** 校验错误 Tooltip 配置 */
  errorTooltipConfig: {
    type: [Boolean, Object] as PropType<false | YEditTableErrorTooltipConfig>,
    default: () => ({}),
  },
} as const;
