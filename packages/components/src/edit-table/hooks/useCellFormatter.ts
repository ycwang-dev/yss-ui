import { resolveEditComponentName } from '../constant';

/**
 * 管理编辑表格单元格查看态格式化与字典翻译能力。
 *
 * @param getOptions 候选项读取方法。
 * @param transformLabel 文本翻译方法。
 * @returns 格式化与翻译判断及执行方法。
 */
export function useCellFormatter(
  getOptions: (col: any, row: any) => any[],
  transformLabel: (col: any, row: any) => any
) {
  /**
   * 判断查看态是否需要根据字典或组件类型进行文本翻译。
   *
   * @param col 列配置。
   * @param row 行数据。
   * @returns 是否需要翻译。
   */
  const shouldTransform = (col: any, row: any) => {
    if (!col) return false;
    if (col?.isTransform) return true;
    const comp = resolveEditComponentName(col, row);
    if (
      comp === 'form-item-select' ||
      comp === 'form-item-tree-select' ||
      comp === 'form-item-cascader' ||
      comp === 'form-item-checkbox' ||
      comp === 'form-item-switch'
    )
      return true;
    const opts = getOptions(col, row);
    return Array.isArray(opts) && opts.length > 0;
  };

  /**
   * 判断列是否提供了自定义 formatter 函数。
   *
   * @param col 列配置。
   * @returns 是否有 formatter。
   */
  const hasFormatter = (col: any) => typeof col?.formatter === 'function';

  /**
   * 执行自定义 formatter，捕获异常并兜底返回原始值。
   *
   * @param col 列配置。
   * @param row 行数据。
   * @returns 格式化后的内容。
   */
  const callFormatter = (col: any, row: any) => {
    try {
      const value = row?.[col?.field as string];
      const transformed = shouldTransform(col, row) ? (transformLabel(col, row) as any) : value;
      return col?.formatter?.({ cellValue: value, row, column: col, transformed });
    } catch (e) {
      return row?.[col?.field as string];
    }
  };

  return {
    shouldTransform,
    hasFormatter,
    callFormatter,
  };
}
