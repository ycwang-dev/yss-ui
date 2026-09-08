import { computed, ref } from 'vue';
import { createParameterRows, parameterColumns, type ParameterUpdatePayload } from '../constant';

/** 管理同列按行切换编辑器示例的数据和交互。 */
export const useDynamicEditor = () => {
  const rows = ref(createParameterRows());
  const lastUpdate = ref('尚未修改');
  const formattedRows = computed(() => JSON.stringify(rows.value, null, 2));

  /** 记录组件内部派发的单元格更新事件。 */
  const handleUpdateRow = ({ row, key, value }: ParameterUpdatePayload) => {
    lastUpdate.value = `${row.parameterName}.${key} = ${String(value ?? '')}`;
  };

  return {
    rows,
    columns: parameterColumns,
    formattedRows,
    lastUpdate,
    handleUpdateRow,
  };
};
