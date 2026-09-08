import { watch, nextTick, type Ref } from 'vue';
import type { YTableProps } from '../type';

/**
 * YTable 多选与受控状态管理 Hook
 *
 * @param props 组件 Props
 * @param emit 组件 Emit 函数
 * @param tableRef 底层 vxe-table 组件实例引用
 */
export function useTableSelection(props: YTableProps, emit: any, tableRef: Ref<any>) {
  /** 内部主动触发标记，避免内部 emit 触发 watch 导致死循环或多余回流 */
  let isInternalChanging = false;

  /** 获取当前表格唯一键字段名 */
  const getKeyField = (): string => {
    return (props.rowConfig as any)?.keyField || 'id';
  };

  /**
   * 从表格中提取当前选中的行数据列表
   *
   * @param rawParams 原始事件参数（若提供则优先使用事件中的最新选中记录）
   * @returns 选中行列表
   */
  const getSelectedRecords = (rawParams?: any): any[] => {
    const source = rawParams as { records?: any[]; checkedRecords?: any[]; selection?: any[] } | undefined;
    const fromParams = source?.records ?? source?.checkedRecords ?? source?.selection;
    if (Array.isArray(fromParams)) {
      return fromParams;
    }
    const xTable = tableRef.value;
    if (xTable && typeof xTable.getCheckboxRecords === 'function') {
      return xTable.getCheckboxRecords() || [];
    }
    return [];
  };

  /**
   * 触发多选状态同步与事件派发
   *
   * @param rawParams 原始事件参数
   * @param eventType 事件类型 ('checkbox-change' | 'checkbox-all')
   */
  const syncSelection = (rawParams?: any, eventType?: 'checkbox-change' | 'checkbox-all') => {
    isInternalChanging = true;
    try {
      const records = getSelectedRecords(rawParams);
      const keyField = getKeyField();
      const keys = records.map(row => (row ? row[keyField] : undefined)).filter(k => k !== undefined && k !== null);

      emit('update:selectedRows', records);
      emit('update:selectedRowKeys', keys);
      emit('selection-change', {
        selectedRows: records,
        selectedRowKeys: keys,
        records,
        row: rawParams?.row,
        checked: rawParams?.checked,
        event: rawParams?.event || rawParams,
      });

      if (eventType) {
        emit(eventType, rawParams);
      }
    } finally {
      nextTick(() => {
        isInternalChanging = false;
      });
    }
  };

  /**
   * 处理单行勾选变动事件
   *
   * @param params 原始事件对象
   */
  const handleCheckboxChange = (params: any) => {
    syncSelection(params, 'checkbox-change');
  };

  /**
   * 处理全选/全不选变动事件
   *
   * @param params 原始事件对象
   */
  const handleCheckboxAll = (params: any) => {
    syncSelection(params, 'checkbox-all');
  };

  /**
   * 比较两个 Key 数组内容是否一致
   */
  const areKeysEqual = (a?: (string | number)[], b?: (string | number)[]): boolean => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    const setA = new Set(a);
    return b.every(k => setA.has(k));
  };

  /**
   * 监听外部 selectedRowKeys 受控变动
   */
  watch(
    () => props.selectedRowKeys,
    newKeys => {
      if (isInternalChanging || newKeys === undefined) return;
      const xTable = tableRef.value;
      if (!xTable) return;

      const keyField = getKeyField();
      const currentRecords = getSelectedRecords();
      const currentKeys = currentRecords.map(r => r[keyField]);

      if (areKeysEqual(newKeys, currentKeys)) return;

      if (!newKeys || newKeys.length === 0) {
        xTable.clearCheckboxRow?.();
        return;
      }

      // 获取表格全量数据
      const fullData = xTable.getTableData?.().fullData || (props.data as any[]) || [];
      const targetRows = fullData.filter((row: any) => newKeys.includes(row[keyField]));

      if (typeof xTable.setCheckboxRow === 'function') {
        xTable.clearCheckboxRow?.();
        if (targetRows.length > 0) {
          xTable.setCheckboxRow(targetRows, true);
        }
      }
    },
    { deep: true }
  );

  /**
   * 监听外部 selectedRows 受控变动
   */
  watch(
    () => props.selectedRows,
    newRows => {
      if (isInternalChanging || newRows === undefined) return;
      const xTable = tableRef.value;
      if (!xTable) return;

      const keyField = getKeyField();
      const newKeys = (newRows || []).map((r: any) => r?.[keyField]).filter((k: any) => k !== undefined);
      const currentRecords = getSelectedRecords();
      const currentKeys = currentRecords.map(r => r[keyField]);

      if (areKeysEqual(newKeys, currentKeys)) return;

      if (!newRows || newRows.length === 0) {
        xTable.clearCheckboxRow?.();
        return;
      }

      const fullData = xTable.getTableData?.().fullData || (props.data as any[]) || [];
      const targetRows = fullData.filter((row: any) => newKeys.includes(row[keyField]));

      if (typeof xTable.setCheckboxRow === 'function') {
        xTable.clearCheckboxRow?.();
        if (targetRows.length > 0) {
          xTable.setCheckboxRow(targetRows, true);
        }
      }
    },
    { deep: true }
  );

  /**
   * 外部调用：清空所有选中行
   */
  const clearSelection = () => {
    const xTable = tableRef.value;
    xTable?.clearCheckboxRow?.();
    syncSelection({ records: [] });
  };

  /**
   * 外部调用：获取当前选中行数据
   */
  const getSelectedRows = (): any[] => {
    return getSelectedRecords();
  };

  /**
   * 外部调用：获取当前选中行 Key 列表
   */
  const getSelectedRowKeys = (): (string | number)[] => {
    const keyField = getKeyField();
    return getSelectedRecords()
      .map(r => r[keyField])
      .filter(k => k !== undefined && k !== null);
  };

  /**
   * 外部调用：设置选中行（支持行数组或 Key 数组）
   */
  const setSelection = (rowsOrKeys: any[]) => {
    const xTable = tableRef.value;
    if (!xTable || !Array.isArray(rowsOrKeys)) return;

    const keyField = getKeyField();
    const fullData = xTable.getTableData?.().fullData || (props.data as any[]) || [];

    const targetRows = rowsOrKeys
      .map((item: any) => {
        if (item && typeof item === 'object') return item;
        return fullData.find((r: any) => r[keyField] === item);
      })
      .filter(Boolean);

    xTable.clearCheckboxRow?.();
    if (targetRows.length > 0) {
      xTable.setCheckboxRow(targetRows, true);
    }
    syncSelection();
  };

  return {
    handleCheckboxChange,
    handleCheckboxAll,
    clearSelection,
    getSelectedRows,
    getSelectedRowKeys,
    setSelection,
    syncSelection,
  };
}
