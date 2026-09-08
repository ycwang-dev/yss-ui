import { nextTick } from 'vue';

export function useTableEvents(emit: any, tableRef?: any) {
  const handleCurrentRowChange = (params: any) => {
    emit('current-row-change', params);
    emit('current-change', params);
  };

  const handleCellClick = (params: any) => emit('cell-click', params);
  const handleEditClosed = (params: any) => emit('edit-closed', params);
  const handleEditActivated = (params: any) => emit('edit-activated', params);
  const handleFilterChange = (params: any) => emit('filter-change', params);

  const handleRowDragend = (params?: any) => {
    const xTable = tableRef?.value;

    // 1. 拖拽松开时强制失焦，立即清除旧位置手柄在浏览器中残留的伪类状态
    try {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    } catch {
      // 忽略
    }

    if (xTable) {
      // 2. 清理 vxe-table 内部悬停与旧指针引用
      if (xTable.internalData) {
        xTable.internalData.prevDragRow = null;
        xTable.internalData.dragRow = null;
        xTable.internalData.hoverRow = null;
      }
      xTable.clearHoverRow?.();

      // 3. 在下一个 Tick 执行清理与新放置行的短暂渐隐高亮提示 (Drop Highlight)
      nextTick(() => {
        xTable.clearHoverRow?.();
        if (xTable.internalData) {
          xTable.internalData.hoverRow = null;
        }

        const draggedRow = params?.row;
        if (draggedRow && xTable.$el) {
          try {
            const rowid = xTable.getRowid?.(draggedRow);
            if (rowid !== undefined) {
              const trNode = xTable.$el.querySelector(`tr[rowid="${rowid}"]`);
              if (trNode) {
                trNode.classList.remove('row--drag-dropped');
                void trNode.offsetWidth; // 触发重绘确保动画可重复播
                trNode.classList.add('row--drag-dropped');
                setTimeout(() => {
                  trNode.classList.remove('row--drag-dropped');
                }, 850);
              }
            }
          } catch {
            // 忽略
          }
        }
      });

      xTable.recalculate?.();
    }

    const data = xTable?.getTableData?.().fullData || [];
    emit('update:data', data);
    emit('row-dragend', { ...params, data });
  };

  return {
    handleCurrentRowChange,
    handleCellClick,
    handleEditClosed,
    handleEditActivated,
    handleFilterChange,
    handleRowDragend,
  };
}
