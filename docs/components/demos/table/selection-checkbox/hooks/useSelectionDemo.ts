import { ref, type Ref } from 'vue';
import { message } from 'ant-design-vue';
import type { YTable, YTableSelectionChangePayload } from '@yss-ui/components';
import { INITIAL_TABLE_DATA, type SelectionUserItem } from '../constant';

/**
 * 多选与批量操作 Demo 业务逻辑 Composable
 *
 * @param tableRef 表格实例引用
 */
export function useSelectionDemo(tableRef: Ref<InstanceType<typeof YTable> | null>) {
  /** 表格数据源 */
  const tableData = ref<SelectionUserItem[]>([...INITIAL_TABLE_DATA]);

  /** 选中的行 Key 列表（受控绑定） */
  const selectedRowKeys = ref<(string | number)[]>([1, 3]);

  /** 选中的行数据列表（受控绑定） */
  const selectedRows = ref<SelectionUserItem[]>([]);

  /** 最近一次选择变动的日志信息 */
  const lastEventLog = ref<string>('初始选中 ID: [1, 3]');

  /**
   * 行选择变化事件处理
   *
   * @param payload 变化参数
   */
  const handleSelectionChange = (payload: YTableSelectionChangePayload<SelectionUserItem>) => {
    const keys = payload.selectedRowKeys.join(', ');
    const count = payload.selectedRows.length;
    lastEventLog.value = `[selection-change] 选中数量: ${count}，Key 列表: [${keys}]`;
  };

  /**
   * 批量删除已选中的数据
   */
  const handleBatchDelete = () => {
    if (selectedRowKeys.value.length === 0) {
      message.warning('请先勾选需要删除的行');
      return;
    }
    const deleteCount = selectedRowKeys.value.length;
    const toDeleteKeys = new Set(selectedRowKeys.value);
    tableData.value = tableData.value.filter(item => !toDeleteKeys.has(item.id));
    selectedRowKeys.value = [];
    message.success(`成功批量删除 ${deleteCount} 条数据`);
  };

  /**
   * 批量导出已选中的数据
   */
  const handleBatchExport = () => {
    if (selectedRowKeys.value.length === 0) {
      message.warning('请先勾选需要导出的行');
      return;
    }
    const names = selectedRows.value.map(row => row.name).join('、');
    message.success(`正在导出选中的 ${selectedRowKeys.value.length} 条记录: ${names}`);
  };

  /**
   * 外部 API：通过 setSelection 设置指定行选中
   *
   * @param keys 行主键列表
   */
  const handleSelectByApi = (keys: number[]) => {
    tableRef.value?.setSelection(keys);
    message.info(`通过 setSelection API 设置选中 ID: [${keys.join(', ')}]`);
  };

  /**
   * 外部 API：一键清空选中
   */
  const handleClearAll = () => {
    tableRef.value?.clearSelection();
    message.info('通过 clearSelection API 清空所有选中');
  };

  /**
   * 外部 API：读取当前选中的数据信息
   */
  const handleGetSelectionInfo = () => {
    const rows = tableRef.value?.getSelectedRows() || [];
    const keys = tableRef.value?.getSelectedRowKeys() || [];
    const names = rows.map((r: SelectionUserItem) => r.name).join(', ') || '无';
    message.info(`当前选中 Key: [${keys.join(', ')}]，姓名: ${names}`);
  };

  /**
   * 重置初始数据
   */
  const handleResetData = () => {
    tableData.value = [...INITIAL_TABLE_DATA];
    selectedRowKeys.value = [1, 3];
    message.success('已重置初始数据并默认勾选 ID: [1, 3]');
  };

  return {
    tableData,
    selectedRowKeys,
    selectedRows,
    lastEventLog,
    handleSelectionChange,
    handleBatchDelete,
    handleBatchExport,
    handleSelectByApi,
    handleClearAll,
    handleGetSelectionInfo,
    handleResetData,
  };
}
