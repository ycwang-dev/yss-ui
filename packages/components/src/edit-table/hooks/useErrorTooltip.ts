import { computed } from 'vue';
import type { YEditTableErrorTooltipConfig, YEditTableErrorTooltipMode } from '../type';

export const DEFAULT_ERROR_TOOLTIP_CLASS = 'y-edit-table-error-tooltip';
export const DEFAULT_ERROR_TOOLTIP_MAX_WIDTH = 260;
export const ERROR_TOOLTIP_MODES: YEditTableErrorTooltipMode[] = ['active', 'hover', 'always', 'none'];

/**
 * 规范化校验错误 Tooltip 展示模式。
 *
 * @param mode 用户传入的展示模式。
 * @returns 合法的 Tooltip 展示模式。
 */
export const normalizeErrorTooltipMode = (mode?: YEditTableErrorTooltipMode): YEditTableErrorTooltipMode => {
  return mode && ERROR_TOOLTIP_MODES.includes(mode) ? mode : 'active';
};

/**
 * 将数字宽度转换为合法 CSS 尺寸。
 *
 * @param value 宽度数值或 CSS 字符串。
 * @returns 带单位的 CSS 尺寸。
 */
export const normalizeCssSize = (value?: number | string): string => {
  if (typeof value === 'number') {
    return `${value}px`;
  }
  return value || `${DEFAULT_ERROR_TOOLTIP_MAX_WIDTH}px`;
};

function getPopupEl(_triggerNode?: HTMLElement) {
  return (typeof document === 'undefined' ? undefined : document.body) as any;
}

/**
 * 管理编辑表格错误提示 Tooltip 的配置与参数派生。
 *
 * @param props YEditTable 属性。
 * @param getCellError 获取单元格错误文本方法。
 * @param shouldShowError 是否应该显示单元格错误。
 * @param isActiveErrorCell 是否为当前处于激活编辑态的错误单元格。
 * @returns Tooltip 配置与属性构造方法。
 */
export function useErrorTooltip(
  props: { errorTooltipConfig?: false | YEditTableErrorTooltipConfig },
  getCellError: (col: any, row: any) => string | undefined,
  shouldShowError: (col: any, row: any) => boolean,
  isActiveErrorCell: (row: any, field: string) => boolean
) {
  const normalizedErrorTooltipConfig = computed<YEditTableErrorTooltipConfig>(() => {
    if (props.errorTooltipConfig === false) {
      return {
        mode: 'none',
        placement: 'topLeft',
        maxWidth: DEFAULT_ERROR_TOOLTIP_MAX_WIDTH,
        autoAdjustOverflow: true,
      };
    }

    const rawConfig: YEditTableErrorTooltipConfig =
      typeof props.errorTooltipConfig === 'object' && props.errorTooltipConfig
        ? (props.errorTooltipConfig as YEditTableErrorTooltipConfig)
        : {};

    return {
      ...rawConfig,
      mode: normalizeErrorTooltipMode(rawConfig.mode),
      placement: rawConfig.placement ?? 'topLeft',
      maxWidth: rawConfig.maxWidth ?? DEFAULT_ERROR_TOOLTIP_MAX_WIDTH,
      autoAdjustOverflow: rawConfig.autoAdjustOverflow ?? true,
    };
  });

  /**
   * 生成校验错误 Tooltip 参数，避免多个错误气泡同时遮挡。
   *
   * @param col 列配置。
   * @param row 行数据。
   * @returns 传递给 Antd Tooltip 的 Props。
   */
  const getErrorTooltipProps = (col: any, row: any) => {
    const config = normalizedErrorTooltipConfig.value;
    const mode = normalizeErrorTooltipMode(config.mode);
    const hasError = shouldShowError(col, row);
    const field = col?.field as string | undefined;
    const title = mode === 'none' || !hasError ? undefined : getCellError(col, row);
    const overlayClassName = [DEFAULT_ERROR_TOOLTIP_CLASS, config.overlayClassName].filter(Boolean).join(' ');
    const tooltipProps: Record<string, any> = {
      title,
      placement: config.placement,
      getPopupContainer: config.getPopupContainer ?? getPopupEl,
      overlayClassName,
      overlayInnerStyle: {
        maxWidth: normalizeCssSize(config.maxWidth),
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        ...(config.overlayInnerStyle || {}),
      },
      autoAdjustOverflow: config.autoAdjustOverflow,
    };

    if (config.mouseEnterDelay !== undefined) {
      tooltipProps.mouseEnterDelay = config.mouseEnterDelay;
    }
    if (config.mouseLeaveDelay !== undefined) {
      tooltipProps.mouseLeaveDelay = config.mouseLeaveDelay;
    }
    if (config.zIndex !== undefined) {
      tooltipProps.zIndex = config.zIndex;
    }

    if (mode === 'none') {
      tooltipProps.open = false;
    } else if (mode === 'always') {
      tooltipProps.open = hasError;
    } else if (mode === 'active' && field && hasError && isActiveErrorCell(row, field)) {
      tooltipProps.open = true;
    }

    return tooltipProps;
  };

  return {
    normalizedErrorTooltipConfig,
    getErrorTooltipProps,
  };
}
