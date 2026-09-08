/**
 * YCron 组件常量定义
 * @description 包含时间维度配置、选项生成、中文文案等
 */

import type { CronDimension, CronMode, DimensionState, DayDimensionState } from './types';

/**
 * 时间维度配置
 */
export interface DimensionConfig {
  /** 维度标识 */
  key: CronDimension;
  /** 显示名称 */
  label: string;
  /** 最小值 */
  min: number;
  /** 最大值 */
  max: number;
  /** 默认间隔起始值 */
  defaultIntervalStart: number;
  /** 默认间隔步长 */
  defaultIntervalStep: number;
}

/**
 * 时间维度配置列表
 */
export const DIMENSION_CONFIGS: DimensionConfig[] = [
  { key: 'second', label: '秒', min: 0, max: 59, defaultIntervalStart: 0, defaultIntervalStep: 5 },
  { key: 'minute', label: '分', min: 0, max: 59, defaultIntervalStart: 0, defaultIntervalStep: 5 },
  { key: 'hour', label: '时', min: 0, max: 23, defaultIntervalStart: 0, defaultIntervalStep: 1 },
  { key: 'day', label: '天', min: 1, max: 31, defaultIntervalStart: 1, defaultIntervalStep: 1 },
  { key: 'month', label: '月', min: 1, max: 12, defaultIntervalStart: 1, defaultIntervalStep: 1 },
  { key: 'year', label: '年', min: 2024, max: 2099, defaultIntervalStart: 2024, defaultIntervalStep: 1 },
];

/**
 * 配置模式文案
 */
export const MODE_LABELS: Record<CronMode, string> = {
  every: '每',
  interval: '间隔',
  specific: '指定',
  range: '范围',
};

/**
 * 星期几选项
 */
export const WEEK_OPTIONS = [
  { label: '星期日', value: 'SUN', num: 1 },
  { label: '星期一', value: 'MON', num: 2 },
  { label: '星期二', value: 'TUE', num: 3 },
  { label: '星期三', value: 'WED', num: 4 },
  { label: '星期四', value: 'THU', num: 5 },
  { label: '星期五', value: 'FRI', num: 6 },
  { label: '星期六', value: 'SAT', num: 7 },
];

/**
 * 生成数字选项列表
 * @param min 最小值
 * @param max 最大值
 * @param labelSuffix 标签后缀（可选）
 */
export const generateOptions = (min: number, max: number, labelSuffix = ''): { label: string; value: number }[] => {
  const options: { label: string; value: number }[] = [];
  for (let i = min; i <= max; i++) {
    options.push({ label: `${i}${labelSuffix}`, value: i });
  }
  return options;
};

/**
 * 创建默认的维度状态
 */
export const createDefaultDimensionState = (config: DimensionConfig): DimensionState => ({
  mode: 'every',
  intervalStart: config.defaultIntervalStart,
  intervalStep: config.defaultIntervalStep,
  specificValues: [],
  rangeStart: config.min,
  rangeEnd: config.max,
});

/**
 * 创建默认的天维度状态（含周配置）
 */
export const createDefaultDayState = (): DayDimensionState => ({
  mode: 'every',
  intervalStart: 1,
  intervalStep: 1,
  specificValues: [],
  rangeStart: 1,
  rangeEnd: 31,
  weekIntervalStart: 1,
  weekIntervalStep: 1,
  weekSpecificValues: [],
  lastDay: false,
  lastWeekday: false,
  lastWeekOfMonth: 1,
  daysBeforeEnd: 1,
  nearestWeekday: 1,
  nthWeekday: { nth: 1, day: 1 },
});

/**
 * 天维度的配置模式（比其他维度更复杂）
 */
export type DayMode =
  | 'every' // 每天
  | 'weekInterval' // 每隔 N 周
  | 'dayInterval' // 每隔 N 天
  | 'weekSpecific' // 指定星期几
  | 'daySpecific' // 指定日期
  | 'lastDay' // 本月最后一天
  | 'lastWeekday' // 本月最后一个工作日
  | 'lastWeekOfMonth' // 本月最后一个星期 X
  | 'beforeEnd' // 月底前 N 天
  | 'nearestWeekday' // 最近工作日
  | 'nthWeekday'; // 第 N 个星期 X

/**
 * 天维度配置模式文案
 */
export const DAY_MODE_LABELS: Record<DayMode, string> = {
  every: '每一天',
  weekInterval: '每隔',
  dayInterval: '每隔',
  weekSpecific: '指定星期',
  daySpecific: '指定日期',
  lastDay: '本月最后一天',
  lastWeekday: '本月最后一个工作日',
  lastWeekOfMonth: '本月最后一个',
  beforeEnd: '月底前',
  nearestWeekday: '最近的工作日',
  nthWeekday: '本月第',
};

/**
 * 秒/分/时/月/年 的通用配置模式文案模板
 */
export const COMMON_MODE_TEMPLATES = {
  every: (label: string) => `每一${label}`,
  interval: (label: string) => ['每隔', `${label} 从`, `${label}开始`],
  specific: (label: string) => `指定${label}（可多选）`,
  range: (label: string) => ['从', '到', label],
};
