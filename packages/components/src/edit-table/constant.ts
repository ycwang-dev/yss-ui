import type { YEditComponentName, YEditTableColumn } from './type';

/** 未配置编辑器时使用的默认输入框。 */
export const DEFAULT_EDIT_COMPONENT: YEditComponentName = 'form-item-input';

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
