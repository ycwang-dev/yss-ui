import { computed, watch, type ComputedRef } from 'vue';
import {
  DEFAULT_MONTH_CALENDAR_CELL_HEIGHT,
  DEFAULT_MONTH_CALENDAR_HEADER_ACTIONS,
  IS_MONTH_CALENDAR_DEVELOPMENT,
  MIN_MONTH_CALENDAR_CELL_HEIGHT,
} from '../constant';
import type {
  YMonthCalendarAppearance,
  YMonthCalendarCellLayout,
  YMonthCalendarHeaderActions,
  YMonthCalendarProps,
  YMonthCalendarTodayIndicator,
} from '../types';

/** 月日历视觉配置状态。 */
interface MonthCalendarPresentation {
  appearance: ComputedRef<YMonthCalendarAppearance>;
  cellLayout: ComputedRef<YMonthCalendarCellLayout>;
  todayIndicator: ComputedRef<YMonthCalendarTodayIndicator>;
  cellHeightValue: ComputedRef<string>;
  mergedHeaderActions: ComputedRef<Required<YMonthCalendarHeaderActions>>;
}

/**
 * 规范化月日历视觉配置。
 *
 * @param props 月日历属性
 * @returns 可直接用于模板的视觉状态
 */
export const useMonthCalendarPresentation = (props: YMonthCalendarProps): MonthCalendarPresentation => {
  const appearance = computed<YMonthCalendarAppearance>(() => (props.appearance === 'plain' ? 'plain' : 'glass'));
  const cellLayout = computed<YMonthCalendarCellLayout>(() => (props.cellLayout === 'grid' ? 'grid' : 'card'));
  const todayIndicator = computed<YMonthCalendarTodayIndicator>(() =>
    props.todayIndicator === 'badge' || props.todayIndicator === 'both' ? props.todayIndicator : 'date'
  );
  const mergedHeaderActions = computed<Required<YMonthCalendarHeaderActions>>(() => ({
    ...DEFAULT_MONTH_CALENDAR_HEADER_ACTIONS,
    ...props.headerActions,
  }));
  const normalizedCellHeight = computed(() =>
    typeof props.cellHeight === 'number' &&
    (!Number.isFinite(props.cellHeight) || props.cellHeight < MIN_MONTH_CALENDAR_CELL_HEIGHT)
      ? DEFAULT_MONTH_CALENDAR_CELL_HEIGHT
      : (props.cellHeight ?? DEFAULT_MONTH_CALENDAR_CELL_HEIGHT)
  );
  const cellHeightValue = computed(() =>
    typeof normalizedCellHeight.value === 'number' ? `${normalizedCellHeight.value}px` : normalizedCellHeight.value
  );

  watch(
    () => props.cellHeight,
    value => {
      if (
        typeof value === 'number' &&
        (!Number.isFinite(value) || value < MIN_MONTH_CALENDAR_CELL_HEIGHT) &&
        IS_MONTH_CALENDAR_DEVELOPMENT
      ) {
        console.warn(
          `[YMonthCalendar] cellHeight 不能小于 ${MIN_MONTH_CALENDAR_CELL_HEIGHT}，已回退为 ${DEFAULT_MONTH_CALENDAR_CELL_HEIGHT}。`
        );
      }
    },
    { immediate: true }
  );

  return {
    appearance,
    cellLayout,
    todayIndicator,
    cellHeightValue,
    mergedHeaderActions,
  };
};
