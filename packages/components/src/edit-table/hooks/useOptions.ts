import { resolveEditComponentName } from '../constant';

/**
 * 创建编辑表格候选项读取与查看态翻译能力。
 *
 * @param props YEditTable 属性。
 * @returns 候选项读取和文本翻译方法。
 */
export function useOptions(props: any) {
  // 缓存：按列(field)维护 value -> label 的映射，防止上游 options 切换后历史值退化为 code
  const labelCache: Record<string, Record<string, string>> = {};

  const cacheFromList = (field: string, list: any[], fm: { label: string; value: string; children?: string }) => {
    if (!field) return;
    const ensure = () => (labelCache[field] = labelCache[field] || {});
    const push = (arr: any[]) => {
      for (const n of arr || []) {
        const v = n?.[fm.value];
        const l = n?.[fm.label];
        if (v !== undefined && l !== undefined) {
          ensure();
          labelCache[field][`${v}`] = l as string;
        }
        const childrenKey = fm.children || 'children';
        if (Array.isArray(n?.[childrenKey])) push(n[childrenKey]);
      }
    };
    push(list || []);
  };

  const getOptions = (col: any, row: any) => {
    const field = col?.field;
    if (!field) return [];
    if (typeof col?.filterOptions === 'function')
      return col.filterOptions({ field, optionsMap: props.optionsMap, row });
    // 优先使用行级 options（避免全局 optionsMap 变化导致其他行展示成 code）
    // 支持两种形态：
    // 1) 行级数组：row[fn] = Option[]（对当前行的所有列生效）
    // 2) 行级映射：row[fn] = { [field]: Option[], default?: Option[] }（仅对指定列生效）
    const rowDict = row?.[props.rowOptionsFieldName];
    if (Array.isArray(rowDict)) return rowDict || [];
    if (rowDict && typeof rowDict === 'object') {
      const candidate = rowDict?.[field] ?? rowDict?.default;
      if (Array.isArray(candidate)) return candidate;
    }
    return col?.options || props.optionsMap?.[field] || [];
  };

  const transformLabel = (col: any, row: any) => {
    const value = row?.[col?.field];
    const comp = resolveEditComponentName(col, row);
    const fm = col?.props?.fieldNames || { label: 'label', value: 'value', children: 'children' };
    const list = getOptions(col, row) || [];
    const field = col?.field as string;
    cacheFromList(field, list, fm);
    const valueToLabel = (val: any) =>
      list.find((o: any) => `${o[fm.value]}` === `${val}`)?.[fm.label] ?? labelCache[field]?.[`${val}`] ?? val;

    // A) 下拉选择（扁平/多选）
    if (comp === 'form-item-select') {
      if (Array.isArray(value) && col?.props?.multiple) {
        return (value as any[]).map(v => valueToLabel(v)).join(',');
      }
      const hit = list.find((o: any) => `${o[fm.value]}` === `${value}`);
      return col?.props?.allowCreate
        ? (hit?.[fm.label] ?? valueToLabel(value) ?? '')
        : (hit?.[fm.label] ?? valueToLabel(value) ?? '');
    }

    // B) TreeSelect：value 可能是单值或数组（multiple）
    if (comp === 'form-item-tree-select') {
      const findInTree = (nodes: any[], val: any): any | undefined => {
        for (const n of nodes || []) {
          if (`${n[fm.value]}` === `${val}`) return n;
          const child = findInTree(n[fm.children] || [], val);
          if (child) return child;
        }
      };
      if (Array.isArray(value)) {
        return (value as any[]).map(v => findInTree(list, v)?.[fm.label] ?? valueToLabel(v)).join(',');
      }
      const node = findInTree(list, value);
      return node ? node[fm.label] : (labelCache[field]?.[`${value}`] ?? value ?? '');
    }

    // C) Cascader：value 是路径（[a,b,c]）或多选的路径数组（[[...],[...]]）
    if (comp === 'form-item-cascader') {
      const getPathLabels = (nodes: any[], path: any[]): string[] => {
        const labels: string[] = [];
        let current = nodes;
        for (const v of path || []) {
          const hit = (current || []).find((n: any) => `${n[fm.value]}` === `${v}`);
          if (!hit) break;
          labels.push(hit[fm.label]);
          current = hit[fm.children] || [];
        }
        return labels;
      };
      if (Array.isArray(value) && Array.isArray(value[0])) {
        // multiple
        return (value as any[]).map((path: any[]) => getPathLabels(list, path).join(' / ')).join(', ');
      }
      if (Array.isArray(value)) return getPathLabels(list, value).join(' / ');
      return value ?? '';
    }

    // D) Boolean（Checkbox/Switch）：显示 是/否，可被 props 覆盖
    if (comp === 'form-item-checkbox' || comp === 'form-item-switch') {
      const trueText = col?.props?.trueText ?? '是';
      const falseText = col?.props?.falseText ?? '否';
      return value ? trueText : falseText;
    }

    // 默认：尝试在列表中匹配一次，否则原值返回
    if (Array.isArray(value) && col?.props?.multiple) {
      return (value as any[]).map((v: any) => valueToLabel(v)).join(',');
    }
    const hit = list.find((o: any) => `${o[fm.value]}` === `${value}`);
    return hit?.[fm.label] ?? valueToLabel(value) ?? '';
  };

  return { getOptions, transformLabel };
}
