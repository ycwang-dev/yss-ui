/**
 * YCron 组件类型定义
 * @description Cron 表达式编辑器组件的 TypeScript 类型
 */

/**
 * 时间维度枚举
 */
export type CronDimension = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';

/**
 * 配置模式枚举
 * @description 每个时间维度可选的配置模式
 */
export type CronMode = 'every' | 'interval' | 'specific' | 'range';

/**
 * 单个时间维度的状态
 */
export interface DimensionState {
  /** 当前选中的配置模式 */
  mode: CronMode;
  /** 间隔模式：起始值 */
  intervalStart: number;
  /** 间隔模式：间隔值 */
  intervalStep: number;
  /** 指定模式：选中的具体值列表 */
  specificValues: number[];
  /** 范围模式：起始值 */
  rangeStart: number;
  /** 范围模式：结束值 */
  rangeEnd: number;
}

/**
 * 天维度的扩展状态（包含周相关配置）
 */
export interface DayDimensionState extends DimensionState {
  /** 周间隔模式：起始星期 */
  weekIntervalStart: number;
  /** 周间隔模式：间隔周数 */
  weekIntervalStep: number;
  /** 指定星期几（多选） */
  weekSpecificValues: string[];
  /** 本月最后一天 */
  lastDay: boolean;
  /** 本月最后一个工作日 */
  lastWeekday: boolean;
  /** 本月最后一个指定星期几 */
  lastWeekOfMonth: number;
  /** 月底前 N 天 */
  daysBeforeEnd: number;
  /** 最近工作日（距离某天） */
  nearestWeekday: number;
  /** 本月第 N 个星期 X */
  nthWeekday: { nth: number; day: number };
}

/**
 * 完整的 Cron 状态
 */
export interface CronState {
  second: DimensionState;
  minute: DimensionState;
  hour: DimensionState;
  day: DayDimensionState;
  month: DimensionState;
  year: DimensionState;
}

/**
 * YCron 组件 Props
 */
export interface YCronProps {
  /**
   * 绑定值（Cron 表达式）
   * @example "0 0 12 * * ?"
   */
  modelValue?: string;

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;

  /**
   * 是否显示秒
   * @default true
   */
  showSecond?: boolean;

  /**
   * 是否显示年
   * @default true
   */
  showYear?: boolean;
}

/**
 * YCron 组件 Emits
 */
export interface YCronEmits {
  /**
   * 值变化时触发
   * @param value 新的 Cron 表达式
   */
  (e: 'update:modelValue', value: string): void;

  /**
   * 值变化时触发（兼容 v-model:value）
   * @param value 新的 Cron 表达式
   */
  (e: 'change', value: string): void;
}
