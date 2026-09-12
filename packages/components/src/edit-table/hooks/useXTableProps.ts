import { computed } from 'vue';
import type { VxeTablePropTypes } from 'vxe-table';

export function useXTableProps(props: any, showTooltipContent: (cfg: any) => string | null) {
  const xTableProps = computed(() => {
    const cfg = props.tableConfig || {};
    const {
      rowConfig: rc,
      cellConfig: cc,
      columnConfig: coc,
      editConfig: ec,
      rowDragConfig: tableRowDragConfig,
      tooltipConfig: tableTooltipConfig,
      scrollY: tableScrollY,
      scrollX: tableScrollX,
      virtualXConfig: tableVirtualXConfig,
      virtualYConfig: tableVirtualYConfig,
      ...rest
    } = cfg as any;

    const rcRaw = { ...(rc || {}) };
    const ccRaw = { ...(cc || {}) };
    if ('height' in rcRaw) {
      if (!('height' in ccRaw)) {
        ccRaw.height = rcRaw.height;
      }
      delete rcRaw.height;
    }

    const cellConfig: VxeTablePropTypes.CellConfig = { ...ccRaw };
    const rowConfig: VxeTablePropTypes.RowConfig = {
      keyField: '_X_ROW_KEY',
      useKey: true,
      ...rcRaw,
      ...(props.rowDragable ? { drag: true } : {}),
    };
    const columnConfig: VxeTablePropTypes.ColumnConfig = { resizable: true, useKey: true, ...(coc || {}) };
    const editConfig: VxeTablePropTypes.EditConfig = {
      enabled: !props.disabled,
      trigger: 'click',
      mode: 'row',
      autoClear: true,
      ...(ec || {}),
    } as any;
    const rowDragConfig = props.rowDragable
      ? ({
          enabled: true,
          showIcon: true,
          ...(tableRowDragConfig as any),
          ...(props.rowDragConfig as any),
        } as VxeTablePropTypes.RowDragConfig)
      : ((props.rowDragConfig || tableRowDragConfig) as VxeTablePropTypes.RowDragConfig | undefined);
    const tooltipConfig: VxeTablePropTypes.TooltipConfig = {
      enterable: true,
      contentMethod: showTooltipContent,
      ...(tableTooltipConfig || {}),
    };

    const resolvedVirtualXConfig = props.virtualXConfig ??
      tableVirtualXConfig ??
      props.scrollX ??
      tableScrollX ?? { enabled: true, gt: 50 };

    const resolvedVirtualYConfig = props.virtualYConfig ??
      tableVirtualYConfig ??
      props.scrollY ??
      tableScrollY ?? { enabled: true, gt: 100 };

    return {
      ...rest,
      border: true,
      size: (rest as any)?.size ?? 'mini',
      showOverflow: (rest as any)?.showOverflow === true ? 'tooltip' : ((rest as any)?.showOverflow ?? 'tooltip'),
      showHeaderOverflow:
        (rest as any)?.showHeaderOverflow === true ? 'tooltip' : ((rest as any)?.showHeaderOverflow ?? 'tooltip'),
      maxHeight: props.maxHeight,
      loading: props.loading,
      rowConfig,
      cellConfig,
      columnConfig,
      editConfig,
      animat: (rest as any)?.animat ?? false,
      virtualXConfig: resolvedVirtualXConfig,
      virtualYConfig: resolvedVirtualYConfig,
      tooltipConfig,
      rowDragConfig,
    } as any;
  });

  return { xTableProps };
}
