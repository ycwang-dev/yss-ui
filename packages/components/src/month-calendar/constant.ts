/** 默认日期单元格高度。 */
export const DEFAULT_MONTH_CALENDAR_CELL_HEIGHT = 88;

/** 日期单元格允许的最小高度。 */
export const MIN_MONTH_CALENDAR_CELL_HEIGHT = 64;

/** 默认头部操作显隐配置。 */
export const DEFAULT_MONTH_CALENDAR_HEADER_ACTIONS = {
  previous: true,
  today: true,
  next: true,
} as const;

/** 当前是否为 Vite 开发环境。 */
export const IS_MONTH_CALENDAR_DEVELOPMENT =
  (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true;

/** 星期短文案，周一为一周起点。 */
export const MONTH_CALENDAR_WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'] as const;

/** 日期键格式。 */
export const MONTH_CALENDAR_DATE_KEY_FORMAT = 'YYYY-MM-DD';
