export type AnyObject = Record<string, any>;

export interface DescriptionsViewProps {
  schema: AnyObject;
  form?: AnyObject;
  /** 固定列数；当 responsive=true 时将被忽略 */
  columns?: number;
  bordered?: boolean;
  hideEmpty?: boolean;
  /** 空值占位符，默认为 '-' */
  emptyPlaceholder?: string;
  labelWidth?: number;
  // 按 x-component 名称映射自定义渲染
  valueRenderMap?: Record<string, (ctx: { value: any; item: any; values: AnyObject }) => any>;
  /** 是否根据容器宽度自适应列数（默认开启，行为与 FormGrid 一致） */
  responsive?: boolean;
  /** 响应式下的最大列数 */
  maxColumns?: number;
  /** 响应式下的最小列数 */
  minColumns?: number;
  /** 每列的最小宽度，决定 3→2→1 的断点 */
  minWidth?: number;

  /** 是否按 Header 组件分组（默认开启） */
  groupByHeader?: boolean;
  /** 识别为分组头的组件名或正则（默认 ['GroupHeader']），可用于自定义 Header */
  groupHeaderComponents?: (string | RegExp)[];

  /** 在查看态保留哪些容器（默认保留 FormCollapse） */
  preserveContainers?: (string | RegExp)[];
  /** hideEmpty 时是否隐藏空面板（默认 true） */
  hideEmptyPanels?: boolean;
  /** 是否显示 Tooltip（默认 true），设为 false 可完全禁用 */
  showTooltip?: boolean;
  /** 透传给 ATooltip 的 props（如 overlayInnerStyle、placement 等），会与内置默认值合并 */
  tooltipProps?: Record<string, any>;
}

export type ItemNode = {
  type: 'item';
  path: string;
  title: string;
  component?: string;
  enum?: any[];
  componentProps?: AnyObject;
  span: number;
  previewFormat?: (v: any, item: any, values: AnyObject) => any;
  xVisible?: boolean;
  xHidden?: boolean;
  xDisplay?: string;
};

export type HeaderNode = { type: 'header'; title?: string; description?: string };
export type CollapseNode = { type: 'collapse'; panels: { header?: string; content: Array<ItemNode | HeaderNode> }[] };
export type FlatNode = ItemNode | HeaderNode | CollapseNode;

export interface Group {
  key: number;
  title?: string;
  description?: string;
  items: ItemNode[];
}

export type SectionBase = { key: number };
export type Section =
  | ({ kind: 'groups'; groups: Group[] } & SectionBase)
  | ({ kind: 'collapse'; panels: { header?: string; groups: Group[] }[] } & SectionBase);

/**
 * 判断节点是否为分组头
 */
export const isHeaderNode = (
  node: AnyObject,
  groupHeaderComponents: (string | RegExp)[] = ['GroupHeader']
): boolean => {
  const comp = node?.['x-component'];
  if (!comp) return false;
  const list = groupHeaderComponents || [];
  const matched = list.some(p => (typeof p === 'string' ? comp === p : (p as RegExp).test(comp)));
  return !!(
    matched ||
    node?.['x-component-props']?.asGroupHeader === true ||
    node?.['x-detail']?.asGroupHeader === true
  );
};

export const shouldPreserve = (comp: string | undefined, preserveContainers: (string | RegExp)[]) => {
  if (!comp) return false;
  return (preserveContainers || []).some(p => (typeof p === 'string' ? comp === p : (p as RegExp).test(comp)));
};

/** detail 插槽命名：detail-<path>（将路径中的 . 替换为 -） */
export const toDetailSlotName = (path: string): string => `detail-${String(path).replace(/\./g, '-')}`;

export const enumLabel = (enums: any[] | undefined, v: any) => {
  if (!Array.isArray(enums)) return undefined;
  const hit = enums.find((e: any) => e?.value === v);
  return hit?.label ?? hit?.text;
};

const OPTION_LABEL_CACHE = new WeakMap<any[], Map<string, Map<any, string>>>();

const getFieldNamesMeta = (fieldNames?: { label?: string; value?: string; children?: string }) => {
  const labelField = fieldNames?.label || 'label';
  const valueField = fieldNames?.value || 'value';
  const childrenField = fieldNames?.children || 'children';
  const cacheKey = `${labelField}|${valueField}|${childrenField}`;
  return { labelField, valueField, childrenField, cacheKey };
};

const getOptionLabelMap = (
  options: any[] | undefined,
  fieldNames?: { label?: string; value?: string; children?: string }
): Map<any, string> | undefined => {
  if (!Array.isArray(options)) return undefined;

  const { labelField, valueField, childrenField, cacheKey } = getFieldNamesMeta(fieldNames);
  let fieldCache = OPTION_LABEL_CACHE.get(options);

  if (!fieldCache) {
    fieldCache = new Map();
    OPTION_LABEL_CACHE.set(options, fieldCache);
  }

  if (!fieldCache.has(cacheKey)) {
    const labelMap = new Map<any, string>();
    const walk = (nodes: any[]) => {
      nodes.forEach(node => {
        if (!node || typeof node !== 'object') return;
        const value = node[valueField];
        const label = node[labelField] ?? node.text ?? value;
        if (value !== undefined) {
          labelMap.set(value, String(label));
        }
        const children = node[childrenField];
        if (Array.isArray(children) && children.length) {
          walk(children);
        }
      });
    };
    walk(options);
    fieldCache.set(cacheKey, labelMap);
  }

  return fieldCache.get(cacheKey);
};

export const optionLabel = (
  options: any[] | undefined,
  value: any,
  fieldNames?: { label?: string; value?: string; children?: string }
) => {
  const labelMap = getOptionLabelMap(options, fieldNames);
  if (!labelMap) return undefined;
  return labelMap.get(value);
};

/**
 * 在树形数据中查找指定值的标签
 * @param treeData 树形数据数组
 * @param value 要查找的值（可以是单个值或数组路径）
 * @param fieldNames 字段名映射 { label, value, children }
 * @returns 找到的标签或 undefined
 */
export const findTreeLabel = (
  treeData: any[] | undefined,
  value: any,
  fieldNames?: { label?: string; value?: string; children?: string }
): string | undefined => {
  if (!Array.isArray(treeData) || value === undefined || value === null) return undefined;

  const { labelField, valueField, childrenField } = getFieldNamesMeta(fieldNames);

  // 如果 value 是数组（Cascader 的情况），需要逐级查找
  if (Array.isArray(value)) {
    const labels: string[] = [];
    let currentLevel = treeData;

    for (const v of value) {
      const node = currentLevel?.find((item: any) => item?.[valueField] === v);
      if (!node) return undefined;
      labels.push(node[labelField] ?? String(v));
      currentLevel = node[childrenField];
    }

    return labels.join(' / ');
  }

  // 单个值的情况（TreeSelect），递归查找
  const search = (nodes: any[]): string | undefined => {
    for (const node of nodes) {
      if (node?.[valueField] === value) {
        return node[labelField] ?? String(value);
      }
      if (Array.isArray(node?.[childrenField])) {
        const found = search(node[childrenField]);
        if (found !== undefined) return found;
      }
    }
    return undefined;
  };

  return search(treeData);
};

/** 将字段值转换为展示文案；调用方传入当前语言以保持响应式。 */
export const defaultRender = (
  item: ItemNode,
  v: any,
  placeholder: string = '-',
  labels = { yes: '是', no: '否', arraySeparator: '、' }
) => {
  const argumentsSeparator = labels.arraySeparator;
  if (v === undefined || v === null || v === '') return placeholder;
  const comp = String(item.component || '');
  const optionList = item.componentProps?.options || item.enum;
  const optionFieldNames = item.componentProps?.fieldNames;

  // TreeSelect 和 Cascader 支持
  if (comp === 'TreeSelect' || comp === 'Cascader') {
    const treeData = item.componentProps?.treeData || item.componentProps?.options;
    const label = findTreeLabel(treeData, v, optionFieldNames);
    if (label !== undefined) return label;
  }

  if (Array.isArray(v)) {
    const labels = v.map(value => optionLabel(optionList, value, optionFieldNames) ?? value);
    return labels.length ? labels.join(argumentsSeparator) : placeholder;
  }

  const byOptions = optionLabel(optionList, v, optionFieldNames);
  if (byOptions !== undefined) return byOptions;

  const byEnum = enumLabel(item.enum, v);
  if (byEnum !== undefined) return byEnum;

  if (comp.includes('DatePicker')) {
    const d = new Date(v);
    return isNaN(d.getTime())
      ? String(v)
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  if (comp.includes('Switch')) return v ? labels.yes : labels.no;
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};
