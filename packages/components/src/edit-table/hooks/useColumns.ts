import { useLocale } from '../../locale/useLocale';
import { useActionConfig } from './useActionConfig';

export function useColumns(props: any) {
  const { t } = useLocale('table');
  const { resolveActionConfig } = useActionConfig(props);
  const getColumnProps = (column: any) => {
    const {
      field,
      title,
      width,
      minWidth,
      align,
      type,
      fixed,
      sortable,
      filterable,
      filters,
      filterMethod,
      filterMultiple,
      filterRender,
      formatter: columnFormatter,
      ...rest
    } = column || {};

    const col: any = {
      field,
      title,
      width,
      minWidth,
      align: align || 'left',
      fixed,
      sortable,
      filters: filterable ? filters : undefined,
      filterMethod,
      filterMultiple,
      filterRender,
      type: type === 'action' || type === 'expand' ? undefined : type,
      ...rest,
    };

    // 当为操作列时，同步 actionConfig 中的列级属性（title/align/fixed/width）
    // 通过 resolveActionConfig 获取经过多语言安全计算与纠偏的宽度
    if (type === 'action') {
      const ac = resolveActionConfig(column);
      if (title === undefined) col.title = ac?.title ?? t('actionTitle');
      if (align === undefined) col.align = ac?.align ?? 'center';
      if (fixed === undefined) col.fixed = ac?.fixed ?? 'right';
      col.width = ac?.width;
    }

    if (
      field &&
      type !== 'action' &&
      type !== 'expand' &&
      (column as any)?.component &&
      !('editRender' in (column as any)) &&
      !('edit-render' in (column as any))
    ) {
      col['edit-render'] = {};
    }

    if (column?.isTransform || Array.isArray(column?.options)) {
      col.formatter = (params: any) => {
        // 若上层已计算出 transformed（包含 filterOptions/树/级联/缓存兜底等），优先使用
        if (Object.prototype.hasOwnProperty.call(params || {}, 'transformed')) {
          return params?.transformed;
        }
        const { cellValue, row, column: c } = params || {};
        const fm = column?.props?.fieldNames || { label: 'label', value: 'value' };
        const field = c?.field;
        const fromRow = (row?.[props?.rowOptionsFieldName] || []) as any[];
        const fromCol = (column?.options || []) as any[];
        const fromMap = (props?.optionsMap?.[field] || []) as any[];
        const list = fromRow.length ? fromRow : fromCol.length ? fromCol : fromMap;

        if (Array.isArray(cellValue) && column?.props?.multiple) {
          return (cellValue as any[])
            .map(v => list.find((o: any) => `${o[fm.value]}` === `${v}`)?.[fm.label] ?? v)
            .join(',');
        }
        const hit = list.find((opt: any) => `${opt[fm.value]}` === `${cellValue}`);
        return hit ? hit[fm.label] : cellValue;
      };
    } else if (columnFormatter) {
      col.formatter = columnFormatter;
    }
    return col;
  };

  // 分组表头透传：默认全量透传 + 黑名单剔除（与 y-table 对齐）
  const getColgroupProps = (group: any) => {
    const {
      // 叶子列/扩展能力（不属于分组自身）
      children: _children,
      field: _field,
      type: _type,
      filters: _filters,
      filterMethod: _filterMethod,
      filterMultiple: _filterMultiple,
      filterRender: _filterRender,
      isTransform: _isTransform,
      props: _props,
      formatter: _formatter,
      actionConfig: _actionConfig,
      ...rest
    } = group || {};
    const result: Record<string, any> = { ...rest };
    if (result.headerAlign === undefined && result.align !== undefined) {
      result.headerAlign = result.align;
    }
    return result;
  };

  return { getColumnProps, getColgroupProps };
}
