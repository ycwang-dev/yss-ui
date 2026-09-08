import { computed } from 'vue';
import type { VxeTablePropTypes } from 'vxe-table';
import { useLocale } from '../../locale/useLocale';
import type { YTableActionConfig, YTableColumn, YTablePagination } from '../type';
import { calcActionColumnWidth, resolveAdaptiveDisplayLimit } from '../utils/calcActionWidth';

/** YTable 内部 Tooltip 浮层 class，用于隔离 vxe-table 溢出提示定位修复。 */
const Y_TABLE_TOOLTIP_CLASS = 'y-table-vxe-tooltip';

/**
 * 合并业务侧 popupClassName 与内部 Tooltip class。
 * @param popupClassName - 业务侧传入的 vxe tooltip popupClassName
 * @returns 合并后的 popupClassName
 */
const mergeTooltipPopupClassName = (popupClassName: any) => {
  if (typeof popupClassName === 'function') {
    return (params: any) => [popupClassName(params), Y_TABLE_TOOLTIP_CLASS].filter(Boolean).join(' ');
  }
  return [popupClassName, Y_TABLE_TOOLTIP_CLASS].filter(Boolean).join(' ');
};

/**
 * 为 vxe-table Tooltip 配置追加 YTable 内部浮层 class。
 * @param config - vxe-table tooltip 配置
 * @returns 合并内部 class 后的 tooltip 配置
 */
const mergeYTableTooltipConfig = <T extends Record<string, any> | undefined>(
  config: T
): T & { popupClassName: any } => {
  const tooltipConfig = { ...(config || {}) } as T & { popupClassName: any };
  tooltipConfig.popupClassName = mergeTooltipPopupClassName(tooltipConfig.popupClassName);
  return tooltipConfig;
};

export function useToolbarConfig(toolbarConfig?: { custom?: boolean }) {
  const toolbarConfigComputed = computed(() => {
    const cfg = toolbarConfig || { custom: false };
    return cfg.custom ? { custom: true } : undefined;
  });
  return { toolbarConfigComputed };
}

export function useTableProps(props: any) {
  const tableProps = computed(() => {
    const {
      id,
      data,
      columns,
      loading,
      customConfig,
      spanMethod,
      expandConfig,
      checkboxConfig,
      radioConfig,
      showActionColumn,
      actionConfig,
      autoFlexColumn,
      rowDragable,
      showDragHandle,
      dragHandleWidth,
      rowDragConfig,
      pageable,
      toolbarConfig,
      toolbarSize,
      toolbarTools,
      optionsMap,
      pagination,
      headerHeight,
      scrollX,
      scrollY,
      virtualXConfig,
      virtualYConfig,
      tooltipConfig,
      headerTooltipConfig,
      footerTooltipConfig,
      ...restProps
    } = props;
    void id;
    void data;
    void columns;
    void loading;
    void customConfig;
    void spanMethod;
    void expandConfig;
    void checkboxConfig;
    void radioConfig;
    void showActionColumn;
    void actionConfig;
    void autoFlexColumn;
    void showDragHandle;
    void dragHandleWidth;
    void pageable;
    void toolbarConfig;
    void toolbarSize;
    void toolbarTools;
    void optionsMap;
    void pagination;
    return {
      ...restProps,
      rowConfig: {
        keyField: '_X_ROW_KEY',
        useKey: true,
        isCurrent: true, // 默认启用当前行高亮
        isHover: true, // 默认启用行悬浮效果
        ...(() => {
          const rc = { ...props.rowConfig };
          delete (rc as any).height;
          return rc;
        })(),
      } as VxeTablePropTypes.RowConfig,
      cellConfig: {
        height: (props as any).cellConfig?.height ?? props.rowConfig?.height ?? 36,
        ...(props as any).cellConfig,
      } as VxeTablePropTypes.CellConfig,
      columnConfig: {
        resizable: true,
        useKey: true,
        ...props.columnConfig,
      } as VxeTablePropTypes.ColumnConfig,
      tooltipConfig: mergeYTableTooltipConfig(tooltipConfig),
      headerTooltipConfig: mergeYTableTooltipConfig(headerTooltipConfig),
      footerTooltipConfig: mergeYTableTooltipConfig(footerTooltipConfig),
      showOverflow: props.showOverflow === true ? 'tooltip' : props.showOverflow,
      showHeaderOverflow: props.showHeaderOverflow === true ? 'tooltip' : props.showHeaderOverflow,
      ...(typeof headerHeight === 'number'
        ? {
            headerCellStyle: {
              height: `${headerHeight}px`,
              lineHeight: `${headerHeight}px`,
            },
          }
        : {}),
      // 智能虚拟滚动配置 - 超过阈值自动启用
      // 优先级：用户传入 > 废弃 API 兼容 > 默认智能配置
      virtualXConfig: virtualXConfig || scrollX || { enabled: true, gt: 50 },
      virtualYConfig: virtualYConfig || scrollY || { enabled: true, gt: 200 },
      rowDragConfig: rowDragable
        ? ({ enabled: true, showIcon: true, ...(rowDragConfig as any) } as VxeTablePropTypes.RowDragConfig)
        : (rowDragConfig as VxeTablePropTypes.RowDragConfig | undefined),
      // 列拖拽：固定列不允许拖拽（无论表头还是自定义列面板）
      columnDragConfig: {
        animation: false, // 关闭拖拽动画以避免分组列拖拽卡顿
        ...(props as any).columnDragConfig,
        disabledMethod: (params: any) => {
          const col = params?.column as { fixed?: any } | undefined;
          return !!col?.fixed;
        },
        dragEndMethod: (params: any) => {
          const { oldColumn, newColumn, dragColumn } = params || {};
          const hasFixed = [oldColumn, newColumn, dragColumn].some((c: any) => c && (c.fixed || c.renderFixed));
          return !hasFixed;
        },
      } as VxeTablePropTypes.ColumnDragConfig,
    };
  });
  return { tableProps };
}

export function usePagination(initial: YTablePagination, pageable: () => boolean, emit: any) {
  // 标记参数已使用，避免 linter 警告
  void pageable;
  const inner = computed({
    get: () => initial,
    set: v => emit('update:pagination', v),
  });
  const computedTotal = computed(() => (inner.value.remote ? inner.value.total || 0 : 0));
  return { innerPagination: inner, computedTotal };
}

export function useActionConfig(props: { actionConfig?: YTableActionConfig; columns?: YTableColumn[] }) {
  const { t, localeName } = useLocale('table');
  const resolveActionConfig = (column?: YTableColumn): YTableActionConfig => {
    const colCfg = (column as any)?.actionConfig as YTableActionConfig | undefined;
    const isEn = localeName.value === 'en-US';
    const mergedButtons = colCfg?.buttons ?? props.actionConfig?.buttons ?? [];
    const mergedTitle = colCfg?.title ?? props.actionConfig?.title ?? t('actionTitle');
    const mergedMoreRenderType = colCfg?.moreRenderType ?? props.actionConfig?.moreRenderType ?? 'moreButton';
    const mergedMoreText = colCfg?.moreText ?? props.actionConfig?.moreText;
    const userDisplayLimit = colCfg?.displayLimit ?? props.actionConfig?.displayLimit;
    const userWidth = colCfg?.width ?? props.actionConfig?.width;

    const displayLimit = resolveAdaptiveDisplayLimit({
      buttons: mergedButtons,
      userDisplayLimit,
      isEn,
    });

    const width = calcActionColumnWidth({
      buttons: mergedButtons,
      displayLimit,
      userWidth,
      isEn,
      title: mergedTitle,
      moreRenderType: mergedMoreRenderType,
      moreText: mergedMoreText,
    });

    const base: YTableActionConfig = {
      title: mergedTitle,
      width,
      align: 'center',
      fixed: 'right',
      displayLimit,
      moreRenderType: mergedMoreRenderType,
      buttons: mergedButtons,
      moreText: mergedMoreText,
    };
    return { ...base, ...(props.actionConfig || {}), ...(colCfg || {}), width, displayLimit };
  };
  return { resolveActionConfig };
}
