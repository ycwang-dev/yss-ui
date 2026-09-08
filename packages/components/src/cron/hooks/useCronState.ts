/**
 * useCronState - Cron 状态管理与表达式生成
 * @description 管理 6 个时间维度的状态，实时计算 Cron 表达式
 */

import { ref, computed } from 'vue';
import type { CronDimension, DimensionState, DayDimensionState, CronState } from '../types';
import { DIMENSION_CONFIGS, createDefaultDimensionState, createDefaultDayState, type DayMode } from '../constant';

/**
 * 创建初始 Cron 状态
 */
const createInitialState = (): CronState => {
  const configs = DIMENSION_CONFIGS;
  return {
    second: createDefaultDimensionState(configs.find(c => c.key === 'second')!),
    minute: createDefaultDimensionState(configs.find(c => c.key === 'minute')!),
    hour: createDefaultDimensionState(configs.find(c => c.key === 'hour')!),
    day: createDefaultDayState(),
    month: createDefaultDimensionState(configs.find(c => c.key === 'month')!),
    year: createDefaultDimensionState(configs.find(c => c.key === 'year')!),
  };
};

/**
 * 生成单个维度的 Cron 表达式片段
 */
const generateDimensionExpression = (state: DimensionState): string => {
  switch (state.mode) {
    case 'every':
      return '*';
    case 'interval':
      return `${state.intervalStart}/${state.intervalStep}`;
    case 'specific':
      if (state.specificValues.length === 0) return '*';
      return state.specificValues.sort((a, b) => a - b).join(',');
    case 'range':
      return `${state.rangeStart}-${state.rangeEnd}`;
    default:
      return '*';
  }
};

/**
 * 生成天维度的 Cron 表达式片段（day 和 week 部分）
 */
const generateDayExpression = (state: DayDimensionState, dayMode: DayMode): { day: string; week: string } => {
  switch (dayMode) {
    case 'every':
      return { day: '*', week: '?' };
    case 'weekInterval':
      return { day: '?', week: `${state.weekIntervalStart}/${state.weekIntervalStep}` };
    case 'dayInterval':
      return { day: `${state.intervalStart}/${state.intervalStep}`, week: '?' };
    case 'weekSpecific':
      if (state.weekSpecificValues.length === 0) return { day: '?', week: '*' };
      return { day: '?', week: state.weekSpecificValues.join(',') };
    case 'daySpecific':
      if (state.specificValues.length === 0) return { day: '*', week: '?' };
      return { day: state.specificValues.sort((a, b) => a - b).join(','), week: '?' };
    case 'lastDay':
      return { day: 'L', week: '?' };
    case 'lastWeekday':
      return { day: 'LW', week: '?' };
    case 'lastWeekOfMonth':
      return { day: '?', week: `${state.lastWeekOfMonth}L` };
    case 'beforeEnd':
      return { day: `L-${state.daysBeforeEnd}`, week: '?' };
    case 'nearestWeekday':
      return { day: `${state.nearestWeekday}W`, week: '?' };
    case 'nthWeekday':
      return { day: '?', week: `${state.nthWeekday.day}#${state.nthWeekday.nth}` };
    default:
      return { day: '*', week: '?' };
  }
};

/**
 * 解析 Cron 表达式到状态
 */
const parseCronExpression = (expression: string, state: CronState, dayModeRef: { value: DayMode }): boolean => {
  if (!expression) return false;

  const parts = expression.trim().split(/\s+/);
  if (parts.length < 6 || parts.length > 7) return false;

  try {
    // 解析秒
    parseSimplePart(parts[0], state.second);
    // 解析分
    parseSimplePart(parts[1], state.minute);
    // 解析时
    parseSimplePart(parts[2], state.hour);
    // 解析天（复杂）
    parseDayPart(parts[3], parts[5], state.day, dayModeRef);
    // 解析月
    parseSimplePart(parts[4], state.month);
    // 解析年（可选）
    if (parts.length === 7) {
      parseSimplePart(parts[6], state.year);
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * 解析简单维度表达式（秒/分/时/月/年）
 */
const parseSimplePart = (part: string, state: DimensionState): void => {
  if (part === '*') {
    state.mode = 'every';
  } else if (part.includes('/')) {
    state.mode = 'interval';
    const [start, step] = part.split('/');
    state.intervalStart = parseInt(start, 10) || 0;
    state.intervalStep = parseInt(step, 10) || 1;
  } else if (part.includes('-')) {
    state.mode = 'range';
    const [start, end] = part.split('-');
    state.rangeStart = parseInt(start, 10) || 0;
    state.rangeEnd = parseInt(end, 10) || 0;
  } else if (part.includes(',') || /^\d+$/.test(part)) {
    state.mode = 'specific';
    state.specificValues = part.split(',').map(v => parseInt(v, 10));
  }
};

/**
 * 解析天维度表达式
 */
const parseDayPart = (
  dayPart: string,
  weekPart: string,
  state: DayDimensionState,
  dayModeRef: { value: DayMode }
): void => {
  // 星期优先判断
  if (weekPart !== '?' && weekPart !== '*') {
    if (weekPart.includes('/')) {
      dayModeRef.value = 'weekInterval';
      const [start, step] = weekPart.split('/');
      state.weekIntervalStart = parseInt(start, 10) || 1;
      state.weekIntervalStep = parseInt(step, 10) || 1;
    } else if (weekPart.includes('#')) {
      dayModeRef.value = 'nthWeekday';
      const [day, nth] = weekPart.split('#');
      state.nthWeekday = { day: parseInt(day, 10) || 1, nth: parseInt(nth, 10) || 1 };
    } else if (weekPart.endsWith('L')) {
      dayModeRef.value = 'lastWeekOfMonth';
      state.lastWeekOfMonth = parseInt(weekPart.replace('L', ''), 10) || 1;
    } else {
      dayModeRef.value = 'weekSpecific';
      state.weekSpecificValues = weekPart.split(',');
    }
    return;
  }

  // 天判断
  if (dayPart === '*') {
    dayModeRef.value = 'every';
  } else if (dayPart === 'L') {
    dayModeRef.value = 'lastDay';
  } else if (dayPart === 'LW') {
    dayModeRef.value = 'lastWeekday';
  } else if (dayPart.startsWith('L-')) {
    dayModeRef.value = 'beforeEnd';
    state.daysBeforeEnd = parseInt(dayPart.replace('L-', ''), 10) || 1;
  } else if (dayPart.endsWith('W')) {
    dayModeRef.value = 'nearestWeekday';
    state.nearestWeekday = parseInt(dayPart.replace('W', ''), 10) || 1;
  } else if (dayPart.includes('/')) {
    dayModeRef.value = 'dayInterval';
    const [start, step] = dayPart.split('/');
    state.intervalStart = parseInt(start, 10) || 1;
    state.intervalStep = parseInt(step, 10) || 1;
  } else if (dayPart.includes(',') || /^\d+$/.test(dayPart)) {
    dayModeRef.value = 'daySpecific';
    state.specificValues = dayPart.split(',').map(v => parseInt(v, 10));
  }
};

/**
 * useCronState Hook
 * @param initialValue 初始 Cron 表达式
 */
export const useCronState = (initialValue?: string) => {
  /** 当前选中的时间维度 */
  const activeDimension = ref<CronDimension>('second');

  /** Cron 状态 */
  const cronState = ref<CronState>(createInitialState());

  /** 天维度的配置模式 */
  const dayMode = ref<DayMode>('every');

  /** 是否禁用年份 */
  const showYear = ref(true);

  /** 是否禁用秒 */
  const showSecond = ref(true);

  /** 生成的 Cron 表达式 */
  const cronExpression = computed(() => {
    const { second, minute, hour, day, month, year } = cronState.value;

    const secondPart = showSecond.value ? generateDimensionExpression(second) : '';
    const minutePart = generateDimensionExpression(minute);
    const hourPart = generateDimensionExpression(hour);
    const { day: dayPart, week: weekPart } = generateDayExpression(day, dayMode.value);
    const monthPart = generateDimensionExpression(month);
    const yearPart = showYear.value ? generateDimensionExpression(year) : '';

    const parts = [minutePart, hourPart, dayPart, monthPart, weekPart];
    if (showSecond.value) parts.unshift(secondPart);
    if (showYear.value) parts.push(yearPart);

    return parts.join(' ');
  });

  /**
   * 解析表达式并更新状态
   */
  const parseExpression = (expression: string): boolean => {
    return parseCronExpression(expression, cronState.value, { value: dayMode.value });
  };

  /**
   * 重置为默认状态
   */
  const reset = (): void => {
    cronState.value = createInitialState();
    dayMode.value = 'every';
    activeDimension.value = 'second';
  };

  // 初始化时解析表达式
  if (initialValue) {
    parseExpression(initialValue);
  }

  return {
    activeDimension,
    cronState,
    dayMode,
    showYear,
    showSecond,
    cronExpression,
    parseExpression,
    reset,
  };
};

export type UseCronStateReturn = ReturnType<typeof useCronState>;
