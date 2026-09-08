import { computed, getCurrentInstance, ref, watch, type ComputedRef } from 'vue';
import dayjs, { extend, type Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn.js';
import 'dayjs/locale/zh-tw.js';
import { useLocale } from '../../locale/useLocale';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import localeData from 'dayjs/plugin/localeData.js';
import quarterOfYear from 'dayjs/plugin/quarterOfYear.js';
import weekOfYear from 'dayjs/plugin/weekOfYear.js';
import weekYear from 'dayjs/plugin/weekYear.js';
import weekday from 'dayjs/plugin/weekday.js';
import { IS_MONTH_CALENDAR_DEVELOPMENT, MONTH_CALENDAR_DATE_KEY_FORMAT } from '../constant';
import type {
  YMonthCalendarCellContext,
  YMonthCalendarPanelChangePayload,
  YMonthCalendarProps,
  YMonthCalendarSelectPayload,
} from '../types';

/**
 * 保证组件内部创建的 Dayjs 实例具备 Ant Design Calendar 所需能力。
 *
 * 组件库构建时可能内联独立的 Dayjs 副本，不能依赖宿主应用或
 * Ant Design Vue 对另一份 Dayjs 实例执行插件初始化。
 */
extend(customParseFormat);
extend(advancedFormat);
extend(weekday);
extend(localeData);
extend(weekOfYear);
extend(weekYear);
extend(quarterOfYear);

/** 月日历状态事件。 */
interface MonthCalendarStateEmits {
  (event: 'update:modelValue', value: Dayjs): void;
  (event: 'update:month', value: Dayjs): void;
  (event: 'select', payload: YMonthCalendarSelectPayload): void;
  (event: 'panel-change', payload: YMonthCalendarPanelChangePayload): void;
}

/** 月日历状态 Hook 返回值。 */
interface MonthCalendarState {
  selectedValue: ComputedRef<Dayjs | undefined>;
  displayMonth: ComputedRef<Dayjs>;
  calendarPanelValue: ComputedRef<Dayjs>;
  previousDisabled: ComputedRef<boolean>;
  nextDisabled: ComputedRef<boolean>;
  todayDisabled: ComputedRef<boolean>;
  getCellContext: (date: Dayjs) => YMonthCalendarCellContext;
  selectDate: (date: Dayjs, source: YMonthCalendarSelectPayload['source']) => void;
  changeMonth: (month: Dayjs) => void;
  changeMonthBy: (offset: number) => void;
  goToday: () => void;
}

/**
 * 判断日期是否落在合法范围内。
 *
 * @param date 当前日期
 * @param validRange 合法范围
 * @returns 是否超出范围
 */
export const isDateOutsideValidRange = (date: Dayjs, validRange?: [Dayjs, Dayjs]): boolean => {
  if (!validRange) {
    return false;
  }
  return date.isBefore(validRange[0], 'day') || date.isAfter(validRange[1], 'day');
};

/**
 * 使用当前受控月份所属的 Dayjs 实例派生今天。
 *
 * 组件库构建后可能拥有独立的 Dayjs 运行时；基于宿主传入的参考日期派生，
 * 可确保回传给业务层及 Ant Design Calendar 的实例来自同一运行时。
 *
 * @param reference 当前展示月份
 * @returns 与参考日期同源的今天日期
 */
const createCompatibleToday = (reference: Dayjs): Dayjs => {
  const now = dayjs();
  return reference.year(now.year()).month(now.month()).date(now.date()).startOf('day');
};

/**
 * 创建月日历受控状态。
 *
 * @param props 组件属性
 * @param emit 组件事件
 * @returns 月日历状态与操作
 */
export const useMonthCalendarState = (
  props: YMonthCalendarProps,
  emit: MonthCalendarStateEmits
): MonthCalendarState => {
  const instance = getCurrentInstance();
  const internalSelected = ref<Dayjs | undefined>(props.defaultValue ?? props.modelValue);
  const initialMonth = props.defaultMonth ?? props.month ?? props.modelValue ?? props.defaultValue ?? dayjs();
  const internalMonth = ref(initialMonth.startOf('month'));
  const normalizedValidRange = computed<[Dayjs, Dayjs] | undefined>(() => {
    if (!props.validRange) {
      return undefined;
    }
    const [start, end] = props.validRange;
    return start.isAfter(end, 'day') ? [end, start] : [start, end];
  });

  const isValueControlled = computed(
    () =>
      Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, 'modelValue') ||
      Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, 'model-value')
  );
  const isMonthControlled = computed(() => Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, 'month'));

  const selectedValue = computed(() => (isValueControlled.value ? props.modelValue : internalSelected.value));
  const displayMonth = computed(
    () => (isMonthControlled.value ? props.month : internalMonth.value)?.startOf('month') ?? dayjs().startOf('month')
  );
  const { localeName } = useLocale();
  const dayjsLocale = computed(() => {
    if (localeName.value === 'en-US') return 'en';
    if (localeName.value === 'zh-TW') return 'zh-tw';
    return 'zh-cn';
  });
  const calendarPanelValue = computed(() =>
    dayjs(displayMonth.value.toDate()).locale(dayjsLocale.value).startOf('month')
  );

  watch(
    () => props.defaultValue,
    value => {
      if (!isValueControlled.value && value) {
        internalSelected.value = value;
      }
    }
  );

  watch(
    () => props.defaultMonth,
    value => {
      if (!isMonthControlled.value && value) {
        internalMonth.value = value.startOf('month');
      }
    }
  );

  watch(
    () => props.validRange,
    value => {
      if (value && value[0].isAfter(value[1], 'day') && IS_MONTH_CALENDAR_DEVELOPMENT) {
        // eslint-disable-next-line no-console
        console.warn('[YMonthCalendar] validRange 起始日期晚于结束日期，组件已自动交换边界。');
      }
    },
    { immediate: true }
  );

  const isDisabled = (date: Dayjs): boolean =>
    props.loading === true ||
    isDateOutsideValidRange(date, normalizedValidRange.value) ||
    props.disabledDate?.(date) === true ||
    (!props.showOutsideDays && !date.isSame(displayMonth.value, 'month'));

  const getCellContext = (date: Dayjs): YMonthCalendarCellContext => ({
    date,
    dateKey: date.format(MONTH_CALENDAR_DATE_KEY_FORMAT),
    isToday: date.isSame(dayjs(), 'day'),
    isSelected: selectedValue.value?.isSame(date, 'day') ?? false,
    isCurrentMonth: date.isSame(displayMonth.value, 'month'),
    isDisabled: isDisabled(date),
  });

  const changeMonth = (month: Dayjs): void => {
    const nextMonth = month.startOf('month');
    if (!isMonthControlled.value) {
      internalMonth.value = nextMonth;
    }
    emit('update:month', nextMonth);
    emit('panel-change', { month: nextMonth, mode: 'month' });
  };

  const selectDate = (date: Dayjs, source: YMonthCalendarSelectPayload['source']): void => {
    const context = getCellContext(date);
    if (context.isDisabled) {
      return;
    }
    const valueChanged = !selectedValue.value?.isSame(date, 'day');
    if (valueChanged) {
      if (!isValueControlled.value) {
        internalSelected.value = date;
      }
      emit('update:modelValue', date);
    }
    if (!context.isCurrentMonth && props.navigateOnOutsideSelect) {
      changeMonth(date);
    }
    emit('select', { ...getCellContext(date), source });
  };

  const changeMonthBy = (offset: number): void => {
    const target = displayMonth.value.add(offset, 'month');
    if (offset < 0 && previousDisabled.value) {
      return;
    }
    if (offset > 0 && nextDisabled.value) {
      return;
    }
    changeMonth(target);
  };

  const goToday = (): void => {
    const today = createCompatibleToday(displayMonth.value);
    if (isDisabled(today)) {
      return;
    }
    const valueChanged = !selectedValue.value?.isSame(today, 'day');
    if (valueChanged) {
      if (!isValueControlled.value) {
        internalSelected.value = today;
      }
      emit('update:modelValue', today);
    }
    const monthChanged = !today.isSame(displayMonth.value, 'month');
    if (monthChanged) {
      changeMonth(today);
    }
    emit('select', { ...getCellContext(today), isSelected: true, isCurrentMonth: true, source: 'header' });
  };

  const previousDisabled = computed(
    () =>
      !!normalizedValidRange.value &&
      !displayMonth.value.startOf('month').isAfter(normalizedValidRange.value[0], 'month')
  );
  const nextDisabled = computed(
    () =>
      !!normalizedValidRange.value &&
      !displayMonth.value.endOf('month').isBefore(normalizedValidRange.value[1], 'month')
  );
  const todayDisabled = computed(() => isDisabled(dayjs()));

  return {
    selectedValue,
    displayMonth,
    calendarPanelValue,
    previousDisabled,
    nextDisabled,
    todayDisabled,
    getCellContext,
    selectDate,
    changeMonth,
    changeMonthBy,
    goToday,
  };
};
