import { describe, expect, it, vi } from 'vitest';
import { resolveEditComponentName } from '../constant';
import { useEditors } from '../hooks/useEditors';
import { useOptions } from '../hooks/useOptions';
import type { YEditTableColumn } from '../type';

interface TestRow {
  editorType: 'select' | 'number' | 'switch';
  value: boolean | number | string;
  options?: Array<{ label: string; value: string }>;
}

/** 创建按行切换编辑器的测试列。 */
const createDynamicColumn = (): YEditTableColumn => ({
  field: 'value',
  component: ({ row }) => {
    const { editorType } = row as TestRow;
    if (editorType === 'select') return 'form-item-select';
    if (editorType === 'number') return 'form-item-input-number';
    return 'form-item-switch';
  },
  cellProps: ({ row }) => ((row as TestRow).editorType === 'number' ? { min: 0 } : {}),
  filterOptions: ({ row }) => (row as TestRow).options ?? [],
  props: { trueText: '启用', falseText: '停用' },
});

describe('YEditTable 动态编辑器', () => {
  it('按当前行解析不同的内置编辑器', () => {
    const column = createDynamicColumn();

    expect(resolveEditComponentName(column, { editorType: 'select' })).toBe('form-item-select');
    expect(resolveEditComponentName(column, { editorType: 'number' })).toBe('form-item-input-number');
    expect(resolveEditComponentName(column, { editorType: 'switch' })).toBe('form-item-switch');
  });

  it('按解析后的编辑器组装 props 和更新事件', async () => {
    const column = createDynamicColumn();
    const updateCell = vi.fn();
    const scheduleValidateRow = vi.fn().mockResolvedValue(undefined);
    const getOptions = (_column: YEditTableColumn, row: TestRow) => row.options ?? [];
    const { editorProps, editorEvents } = useEditors(getOptions, updateCell, scheduleValidateRow);
    const selectRow: TestRow = {
      editorType: 'select',
      value: 'daily',
      options: [{ label: '日收益率', value: 'daily' }],
    };
    const numberRow: TestRow = { editorType: 'number', value: 250 };
    const switchRow: TestRow = { editorType: 'switch', value: true };

    expect(editorProps(column, selectRow).options).toEqual([{ label: '日收益率', value: 'daily' }]);
    expect(editorProps(column, numberRow)).toMatchObject({ min: 0 });
    expect(editorProps(column, switchRow)).toMatchObject({ checked: true });

    const switchEvents = editorEvents(column, switchRow);
    switchEvents['update:checked'](false);
    await Promise.resolve();

    expect(updateCell).toHaveBeenCalledWith(switchRow, 'value', false);
    expect(scheduleValidateRow).toHaveBeenCalledWith(switchRow, 'value');
  });

  it('查看态按动态编辑器进行字典和布尔值翻译', () => {
    const column = createDynamicColumn();
    const { transformLabel } = useOptions({ rowOptionsFieldName: 'options', optionsMap: {} });
    const selectRow: TestRow = {
      editorType: 'select',
      value: 'daily',
      options: [{ label: '日收益率', value: 'daily' }],
    };
    const switchRow: TestRow = { editorType: 'switch', value: true };

    expect(transformLabel(column, selectRow)).toBe('日收益率');
    expect(transformLabel(column, switchRow)).toBe('启用');
  });
});
