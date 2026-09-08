<script setup lang="ts">
import { computed } from 'vue';
import { Calendar as ACalendar, Spin as ASpin } from 'ant-design-vue';
import zhCN from 'ant-design-vue/es/calendar/locale/zh_CN';
import zhTW from 'ant-design-vue/es/calendar/locale/zh_TW';
import enUS from 'ant-design-vue/es/calendar/locale/en_US';
import type { Dayjs } from 'dayjs';
import { MONTH_CALENDAR_WEEKDAYS } from '../constant';
import MonthCalendarCell from './MonthCalendarCell.vue';
import MonthCalendarDateLabel from './MonthCalendarDateLabel.vue';
import type {
  YMonthCalendarCellContext,
  YMonthCalendarPointerPayload,
  YMonthCalendarProps,
  YMonthCalendarTodayIndicator,
} from '../types';
import { useLocale } from '../../locale/useLocale';

defineOptions({ name: 'YMonthCalendarPanel' });

const props = defineProps<{
  calendarValue: Dayjs;
  displayMonth: Dayjs;
  selectedValue?: Dayjs;
  loading: boolean;
  loadingTip: string;
  showOutsideDays: boolean;
  contextMenuEnabled: boolean;
  todayText: string;
  todayIndicator: YMonthCalendarTodayIndicator;
  getCellContext: (date: Dayjs) => YMonthCalendarCellContext;
  cellClassName?: YMonthCalendarProps['cellClassName'];
  cellStyle?: YMonthCalendarProps['cellStyle'];
}>();

const { currentLocale, localeName } = useLocale('monthCalendar');

const calendarLocale = computed(() => ({ 'zh-CN': zhCN, 'zh-TW': zhTW, 'en-US': enUS })[localeName.value]);

const resolvedWeekdays = computed(() => {
  const weekdays = currentLocale.value?.monthCalendar?.weekdays;
  if (Array.isArray(weekdays) && weekdays.length === 7) return weekdays;
  return MONTH_CALENDAR_WEEKDAYS;
});

const emit = defineEmits<{
  click: [payload: YMonthCalendarPointerPayload];
  dblclick: [payload: YMonthCalendarPointerPayload];
  contextmenu: [payload: YMonthCalendarPointerPayload];
  keydown: [event: KeyboardEvent, context: YMonthCalendarCellContext];
}>();

/** 判断当前日期是否进入 Tab 键焦点序列。 */
const isFocusable = (date: Dayjs): boolean => {
  const context = props.getCellContext(date);
  return context.isSelected || (!props.selectedValue && date.isSame(props.displayMonth.startOf('month'), 'day'));
};
</script>

<template>
  <div class="y-month-calendar__body-scroll">
    <div class="y-month-calendar__body">
      <div class="y-month-calendar__weekdays">
        <div v-for="(label, index) in resolvedWeekdays" :key="index">
          <slot name="weekday" :index="index" :label="label">{{ label }}</slot>
        </div>
      </div>
      <ASpin :spinning="loading" :tip="loadingTip" wrapper-class-name="y-month-calendar__spin">
        <slot v-if="loading" name="loading" />
        <ACalendar
          :key="displayMonth.format('YYYY-MM')"
          :value="calendarValue"
          :fullscreen="true"
          :locale="calendarLocale"
        >
          <template #headerRender />
          <template #dateFullCellRender="{ current }">
            <MonthCalendarCell
              :context="getCellContext(current)"
              :context-menu-enabled="contextMenuEnabled"
              :show-content="showOutsideDays || getCellContext(current).isCurrentMonth"
              :focusable="isFocusable(current)"
              :loading="loading"
              :custom-class="cellClassName?.(getCellContext(current))"
              :custom-style="cellStyle?.(getCellContext(current))"
              @click="emit('click', $event)"
              @dblclick="emit('dblclick', $event)"
              @contextmenu="emit('contextmenu', $event)"
              @keydown="emit('keydown', $event, getCellContext(current))"
            >
              <slot name="date-cell" v-bind="getCellContext(current)">
                <MonthCalendarDateLabel
                  :date-label="current.format('DD')"
                  :is-today="getCellContext(current).isToday"
                  :today-text="todayText"
                  :today-indicator="todayIndicator"
                />
              </slot>
              <slot name="date-cell-extra" v-bind="getCellContext(current)" />
            </MonthCalendarCell>
          </template>
        </ACalendar>
      </ASpin>
    </div>
  </div>
</template>
