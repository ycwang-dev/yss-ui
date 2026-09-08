import type { VxeColumnProps, VxeTableDefines, VxeTableProps, VxeTablePropTypes } from 'vxe-table';
import type { YTableActionConfig } from '../table/type';

/** YEditTable 内置编辑器名称。 */
export type YEditComponentName =
  | 'form-item-input'
  | 'form-item-input-number'
  | 'form-item-select'
  | 'form-item-date'
  | 'form-item-date-range'
  | 'form-item-time'
  | 'form-item-tree-select'
  | 'form-item-cascader'
  | 'form-item-switch'
  | 'form-item-checkbox';

/** 动态编辑器解析上下文。 */
export interface YEditComponentContext {
  /** 当前行数据 */
  row: any;
  /** 当前列字段名 */
  field?: string;
  /** 当前列配置 */
  column: YEditTableColumn;
}

/** 按当前行解析编辑器类型。 */
export type YEditComponentResolver = (ctx: YEditComponentContext) => YEditComponentName;

export type YEditTableErrorTooltipMode = 'active' | 'hover' | 'always' | 'none';

/**
 * 编辑表格校验错误 Tooltip 配置。
 */
export interface YEditTableErrorTooltipConfig {
  /** 展示模式：active 只自动展开当前错误，hover 悬浮展示，always 全部展开，none 不展示气泡 */
  mode?: YEditTableErrorTooltipMode;
  /** Tooltip 位置 */
  placement?: string;
  /** Tooltip 最大宽度，数字会自动转换为 px */
  maxWidth?: number | string;
  /** 追加的浮层 className */
  overlayClassName?: string;
  /** 透传给 Tooltip 的浮层内部样式 */
  overlayInnerStyle?: Record<string, any>;
  /** 鼠标移入延迟，单位秒 */
  mouseEnterDelay?: number;
  /** 鼠标移出延迟，单位秒 */
  mouseLeaveDelay?: number;
  /** 是否自动调整浮层位置 */
  autoAdjustOverflow?: boolean | Record<string, any>;
  /** 浮层层级 */
  zIndex?: number;
  /** 自定义浮层挂载容器 */
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement;
}

export interface YEditTableColumn extends Omit<VxeTableDefines.ColumnOptions, 'children' | 'type'> {
  /** 字段名 */
  field?: string;
  /** 列标题 */
  title?: string;
  /** 分组表头对齐方式（仅分组节点生效） */
  headerAlign?: 'left' | 'center' | 'right';
  /** 列宽度 */
  width?: number | string;
  /** 最小宽度 */
  minWidth?: number | string;
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 列类型（扩展 action/expand） */
  type?: 'seq' | 'radio' | 'checkbox' | 'expand' | 'drag' | 'action' | VxeColumnProps['type'];
  /** 是否固定列 */
  fixed?: 'left' | 'right';
  /** 是否可排序 */
  sortable?: boolean;
  /** 是否可拖拽排序 */
  dragSort?: boolean;
  /** 是否可筛选 */
  filterable?: boolean;
  /** 筛选配置（与 vxe 对齐） */
  filters?: any[];
  /** 本地筛选方法 */
  filterMethod?: (params: any) => boolean;
  /** 是否多选 */
  filterMultiple?: boolean;
  /** 自定义筛选渲染（与 vxe / YTable 对齐） */
  filterRender?: Record<string, any>;

  /** 使用何种编辑器组件；函数形式可按当前行动态返回编辑器 */
  component?: YEditComponentName | YEditComponentResolver;
  /** 透传给编辑器的 props（如 fieldNames/multiple/allowCreate 等） */
  props?: Record<string, any>;
  /**
   * 单元格级动态 props：按行/按值返回透传给编辑器的 props
   * 用于为某一行/某一单元格定制交互（例如仅当前行下拉显示 loading）
   */
  cellProps?: (ctx: { row: any; field?: string; column?: YEditTableColumn }) => Record<string, any>;
  /** 是否字典翻译（查看态用 optionsMap 翻译） */
  isTransform?: boolean;
  /** 自定义展示 formatter（非编辑态 slot 时有效） */
  formatter?: (params: any) => string | number;

  /** 列级操作配置，仅当 type==='action' 时有效 */
  actionConfig?: YTableActionConfig;

  /** 自定义必填条件：返回 true 则该单元格必填 */
  customRequired?: (value: any, row: any) => boolean;
  /** 自定义规则：返回 { errMsg } 设置错误提示 */
  customRule?: (value: any, row: any, key: string, all: any[]) => { errMsg?: string };

  /** 按行注入 options 的字段名（默认由组件 props.rowOptionsFieldName 决定） */
  options?: any[];
  /** 动态过滤 options 的函数 */
  filterOptions?: (ctx: { field?: string; optionsMap: Record<string, any[]>; row: any }) => any[];

  /** 与 vxe 对齐：当用户手写 editRender 时，仍然透传 */
  editRender?: Record<string, any>;
  /** 支持短横线写法透传（运行时） */
  'edit-render'?: Record<string, any>;
  /** 分组表头：子列配置，仅叶子列渲染为 vxe-column */
  children?: YEditTableColumn[];
}

/**
 * Y-Edit-Table 组件 Props 定义
 */
export interface YEditTableSpecificProps {
  data?: any[];
  columns?: YEditTableColumn[];
  tableConfig?: Record<string, any>;
  optionsMap?: Record<string, any[]>;
  rowOptionsFieldName?: string;
  disabled?: boolean;
  loading?: boolean;
  maxHeight?: number | string;
  /** 操作列配置 */
  actionConfig?: YTableActionConfig;
  /** 拖拽 */
  rowDragable?: boolean;
  showDragHandle?: boolean;
  dragHandleWidth?: number | string;
  dragHandlePlacement?: 'left' | 'right';
  dragHandleFixed?: boolean | 'left' | 'right';
  rowDragConfig?: VxeTablePropTypes.RowDragConfig;
  /** 工具栏/展开 */
  toolbarConfig?: { custom?: boolean };
  expandConfig?: VxeTablePropTypes.ExpandConfig;
  /** 分页 */
  pageable?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total?: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    pageSizeOptions?: (number | string)[];
    remote?: boolean;
  };
  /** UI */
  addable?: boolean;
  addBtnText?: string;
  /** 校验错误 Tooltip 配置，传 false 可关闭气泡，仅保留错误态 */
  errorTooltipConfig?: false | YEditTableErrorTooltipConfig;
}

export type YEditTableProps = YEditTableSpecificProps & Omit<VxeTableProps, keyof YEditTableSpecificProps>;
