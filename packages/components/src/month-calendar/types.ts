import type { Dayjs } from 'dayjs';
import type { CSSProperties } from 'vue';

/** 月日历模式。 */
export type YMonthCalendarMode = 'month';

/** 月日历视觉预设。 */
export type YMonthCalendarAppearance = 'glass' | 'plain';

/** 月日历日期单元格布局。 */
export type YMonthCalendarCellLayout = 'card' | 'grid';

/** 月日历今天标记展示方式。 */
export type YMonthCalendarTodayIndicator = 'date' | 'badge' | 'both';

/** 月日历默认头部操作显隐配置。 */
export interface YMonthCalendarHeaderActions {
  /** 是否展示上一月按钮。 */
  previous?: boolean;
  /** 是否展示今天按钮。 */
  today?: boolean;
  /** 是否展示下一月按钮。 */
  next?: boolean;
}

/** 日期单元格可接收的类名结构。 */
export type YMonthCalendarCellClass = string | string[] | Record<string, boolean | undefined>;

/** 月日历日期单元格上下文。 */
export interface YMonthCalendarCellContext {
  /** 当前日期。 */
  date: Dayjs;
  /** YYYY-MM-DD 格式日期键。 */
  dateKey: string;
  /** 是否为今天。 */
  isToday: boolean;
  /** 是否为当前选中日期。 */
  isSelected: boolean;
  /** 是否属于当前展示月份。 */
  isCurrentMonth: boolean;
  /** 是否被禁用。 */
  isDisabled: boolean;
}

/** 月日历鼠标事件载荷。 */
export interface YMonthCalendarPointerPayload extends YMonthCalendarCellContext {
  /** 原始鼠标事件。 */
  event: MouseEvent;
}

/** 月日历选择事件载荷。 */
export interface YMonthCalendarSelectPayload extends YMonthCalendarCellContext {
  /** 触发选择的来源。 */
  source: 'mouse' | 'keyboard' | 'contextmenu' | 'header';
}

/** 月日历面板变化事件载荷。 */
export interface YMonthCalendarPanelChangePayload {
  /** 新展示月份。 */
  month: Dayjs;
  /** 固定为 month。 */
  mode: YMonthCalendarMode;
}

/** 月日历头部插槽上下文。 */
export interface YMonthCalendarHeaderContext {
  /** 当前展示月份。 */
  month: Dayjs;
  /** 上一月是否禁用。 */
  previousDisabled: boolean;
  /** 下一月是否禁用。 */
  nextDisabled: boolean;
  /** 今天操作是否禁用。 */
  todayDisabled: boolean;
  /** 切换到上一月。 */
  previous: () => void;
  /** 切换到下一月。 */
  next: () => void;
  /** 切换并选中今天。 */
  today: () => void;
}

/** 月日历星期插槽上下文。 */
export interface YMonthCalendarWeekdayContext {
  /** 从 0 开始的列索引。 */
  index: number;
  /** 星期短文案。 */
  label: string;
}

/** 月日历右键菜单插槽上下文。 */
export interface YMonthCalendarContextMenuContext extends YMonthCalendarCellContext {
  /** 关闭当前右键菜单。 */
  close: () => void;
}

/** 月日历 Props。 */
export interface YMonthCalendarProps {
  /** 受控选中日期。 */
  modelValue?: Dayjs;
  /** 非受控默认选中日期。 */
  defaultValue?: Dayjs;
  /** 受控展示月份。 */
  month?: Dayjs;
  /** 非受控默认展示月份。 */
  defaultMonth?: Dayjs;
  /** 加载状态。 */
  loading?: boolean;
  /** 可选择的日期范围。 */
  validRange?: [Dayjs, Dayjs];
  /** 自定义禁用日期。 */
  disabledDate?: (date: Dayjs) => boolean;
  /** 是否展示默认头部。 */
  showHeader?: boolean;
  /** 视觉预设。 */
  appearance?: YMonthCalendarAppearance;
  /** 日期单元格布局。 */
  cellLayout?: YMonthCalendarCellLayout;
  /** 是否根据组件容器宽度自动压缩布局。 */
  responsive?: boolean;
  /** 是否在父容器具有明确高度时撑满可用高度。 */
  fillHeight?: boolean;
  /** 默认头部操作显隐配置。 */
  headerActions?: YMonthCalendarHeaderActions;
  /** 是否展示跨月日期内容。 */
  showOutsideDays?: boolean;
  /** 选择跨月日期时是否切换月份。 */
  navigateOnOutsideSelect?: boolean;
  /** 右键时是否先选中日期。 */
  selectOnContextMenu?: boolean;
  /** 是否启用右键菜单插槽。 */
  contextMenuEnabled?: boolean;
  /** 日期单元格高度。 */
  cellHeight?: number | string;
  /** 今天标记文案。 */
  todayText?: string;
  /** 今天标记展示方式。 */
  todayIndicator?: YMonthCalendarTodayIndicator;
  /** 根据日期上下文扩展单元格类名。 */
  cellClassName?: (context: YMonthCalendarCellContext) => YMonthCalendarCellClass;
  /** 根据日期上下文扩展单元格样式。 */
  cellStyle?: (context: YMonthCalendarCellContext) => CSSProperties;
  /** 根节点样式。 */
  rootStyle?: CSSProperties;
  /** 加载提示。 */
  loadingTip?: string;
}

/** 月日历 Expose。 */
export interface YMonthCalendarExpose {
  /** 聚焦指定日期。 */
  focusDate: (date: Dayjs) => Promise<void>;
  /** 关闭右键菜单。 */
  closeContextMenu: () => void;
  /** 切换并选中今天。 */
  goToday: () => void;
}
