import { computed, nextTick } from 'vue';

export function useRowDrag(props: any, tableRef: any, emit: any) {
  const dragHandleFixedComputed = computed(() => {
    const f = props.dragHandleFixed as any;
    if (f === true) return props.dragHandlePlacement;
    if (f === 'left' || f === 'right') return f;
    return undefined;
  });

  const handleRowDragend = (params?: any) => {
    const xTable = tableRef.value;

    try {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    } catch {
      // 忽略
    }

    if (xTable) {
      if (xTable.internalData) {
        xTable.internalData.prevDragRow = null;
        xTable.internalData.dragRow = null;
        xTable.internalData.hoverRow = null;
      }
      xTable.clearHoverRow?.();

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
                void trNode.offsetWidth;
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

  return { dragHandleFixedComputed, handleRowDragend };
}
