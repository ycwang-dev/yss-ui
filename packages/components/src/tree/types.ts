import type { CSSProperties, VNodeChild } from 'vue';

export type YTreeKey = string | number;

export interface YTreeFieldNames {
  title?: string;
  key?: string;
  children?: string;
}

export interface YTreeActionItem {
  key: string;
  label: string;
  icon?: VNodeChild;
  disabled?: boolean;
  danger?: boolean;
}

export interface YTreeProps {
  treeData?: any[];
  /**
   * 虚拟滚动容器高度，仅支持 number，与 ant-design-vue Tree 保持一致
   */
  height?: number;
  /**
   * 虚拟滚动单个节点预估高度
   */
  itemHeight?: number;
  /**
   * 是否启用虚拟滚动
   * @description 默认保持 undefined，交给 ant-design-vue Tree 使用全局配置；禁止默认成 false。
   */
  virtual?: boolean;
  fieldNames?: YTreeFieldNames;
  filterable?: boolean;
  searchValue?: string;
  searchProps?: Record<string, any>;
  ellipsisTooltip?: boolean;
  tooltipDelay?: number;
  showActions?: boolean;
  getNodeActions?: (node: any) => YTreeActionItem[];
  /**
   * 下拉菜单触发方式；默认 click。可在业务中自由切换为 hover/click/contextmenu 或其组合
   */
  actionTrigger?: 'hover' | 'click' | 'contextmenu' | Array<'hover' | 'click' | 'contextmenu'>;
  /**
   * 点击"更多"按钮时是否自动选中当前节点
   * - true（默认）：点击更多按钮会自动选中该节点
   * - false：点击更多按钮不会改变当前选中状态
   */
  selectOnActionClick?: boolean;
  /**
   * 是否显示加载中状态
   * - true：显示 Spin 加载动画
   * - false（默认）：不显示加载状态
   */
  loading?: boolean;
  /**
   * 加载中的提示文案
   * @default '加载中...'
   */
  loadingTip?: string;
  selectedKeys?: YTreeKey[];
  expandedKeys?: YTreeKey[];
  checkedKeys?: YTreeKey[] | { checked: YTreeKey[]; halfChecked: YTreeKey[] };
  loadedKeys?: YTreeKey[];
  defaultSelectedKeys?: YTreeKey[];
  defaultExpandedKeys?: YTreeKey[];
  defaultCheckedKeys?: YTreeKey[];
  selectable?: boolean;
  blockNode?: boolean;
  rootClassName?: string;
  rootStyle?: CSSProperties;
  direction?: 'ltr' | 'rtl';
}
