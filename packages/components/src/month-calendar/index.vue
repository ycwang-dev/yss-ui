<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';
import dayjs from 'dayjs';
import MonthCalendarContextMenu from './components/MonthCalendarContextMenu.vue';
import MonthCalendarHeader from './components/MonthCalendarHeader.vue';
import MonthCalendarPanel from './components/MonthCalendarPanel.vue';
import { DEFAULT_MONTH_CALENDAR_CELL_HEIGHT } from './constant';
import { useCalendarKeyboard } from './hooks/useCalendarKeyboard';
import { useMonthCalendarContextMenu } from './hooks/useMonthCalendarContextMenu';
import { useMonthCalendarState } from './hooks/useMonthCalendarState';
import { useMonthCalendarPresentation } from './hooks/useMonthCalendarPresentation';
import type { YMonthCalendarPointerPayload, YMonthCalendarProps } from './types';
import { useLocale } from '../locale/useLocale';
defineOptions({ name: 'YMonthCalendar' });
const props = withDefaults(defineProps<YMonthCalendarProps>(), {
  loading: false,
  showHeader: true,
  appearance: 'glass',
  cellLayout: 'card',
  responsive: true,
  fillHeight: false,
  headerActions: () => ({}),
  showOutsideDays: true,
  navigateOnOutsideSelect: true,
  selectOnContextMenu: true,
  contextMenuEnabled: undefined,
  cellHeight: DEFAULT_MONTH_CALENDAR_CELL_HEIGHT,
  todayText: undefined,
  todayIndicator: 'date',
  loadingTip: undefined,
});
const emit = defineEmits<{
  'update:modelValue': [value: import('dayjs').Dayjs];
  'update:month': [value: import('dayjs').Dayjs];
  select: [payload: import('./types').YMonthCalendarSelectPayload];
  'cell-click': [payload: YMonthCalendarPointerPayload];
  'cell-dblclick': [payload: YMonthCalendarPointerPayload];
  'cell-contextmenu': [payload: YMonthCalendarPointerPayload];
  'panel-change': [payload: import('./types').YMonthCalendarPanelChangePayload];
}>();
const slots = useSlots();
const rootRef = ref<HTMLElement>();
const contextMenuEnabled = computed(() => props.contextMenuEnabled ?? Boolean(slots['context-menu']));
const { appearance, cellLayout, todayIndicator, cellHeightValue, mergedHeaderActions } =
  useMonthCalendarPresentation(props);
const state = useMonthCalendarState(props, emit);
const { activeContext, contextMenuPosition, closeContextMenu, handleContextMenu, handleContextMenuClose } =
  useMonthCalendarContextMenu({
    props,
    contextMenuEnabled,
    displayMonth: state.displayMonth,
    getCellContext: state.getCellContext,
    selectDate: state.selectDate,
    emitContextMenu: payload => emit('cell-contextmenu', payload),
  });
const { focusDate, handleKeydown } = useCalendarKeyboard({
  rootRef,
  getContext: state.getCellContext,
  selectDate: state.selectDate,
  changeMonth: state.changeMonth,
  closeContextMenu,
});
/** 处理日期单击。 */
const handleClick = (payload: YMonthCalendarPointerPayload): void => {
  closeContextMenu();
  state.selectDate(payload.date, 'mouse');
  emit('cell-click', { ...state.getCellContext(payload.date), event: payload.event });
};
/** 处理日期双击。 */
const handleDoubleClick = (payload: YMonthCalendarPointerPayload): void => {
  emit('cell-dblclick', { ...state.getCellContext(payload.date), event: payload.event });
};

const { t, localeName } = useLocale('monthCalendar');

const resolvedTodayText = computed(() => props.todayText ?? t('today'));
const resolvedLoadingTip = computed(() => props.loadingTip ?? t('loadingTip'));
const resolvedMonthLabel = computed(() => {
  if (localeName.value === 'en-US') {
    return state.displayMonth.value.locale('en').format('MMMM YYYY');
  }
  return state.displayMonth.value.format('YYYY年MM月');
});

defineExpose({ focusDate, closeContextMenu, goToday: state.goToday });
</script>
<template>
  <section
    ref="rootRef"
    :class="[
      'y-month-calendar',
      `y-month-calendar--${appearance}`,
      `y-month-calendar--cell-${cellLayout}`,
      `y-month-calendar--${responsive ? 'responsive' : 'fixed'}`,
      { 'y-month-calendar--fill-height': fillHeight },
    ]"
    :data-appearance="appearance"
    :data-cell-layout="cellLayout"
    :data-responsive="responsive"
    :data-fill-height="fillHeight"
    :style="[{ '--yss-month-calendar-configured-cell-height': cellHeightValue }, rootStyle]"
  >
    <div v-if="showHeader" class="y-month-calendar__header">
      <slot
        name="header"
        :month="state.displayMonth.value"
        :previous-disabled="state.previousDisabled.value"
        :next-disabled="state.nextDisabled.value"
        :today-disabled="state.todayDisabled.value"
        :previous="() => state.changeMonthBy(-1)"
        :next="() => state.changeMonthBy(1)"
        :today="state.goToday"
      >
        <MonthCalendarHeader
          :month-label="resolvedMonthLabel"
          :loading="loading"
          :previous-disabled="state.previousDisabled.value"
          :next-disabled="state.nextDisabled.value"
          :today-disabled="state.todayDisabled.value"
          :actions="mergedHeaderActions"
          :is-today-selected="state.selectedValue.value?.isSame(dayjs(), 'day') ?? false"
          :today-text="resolvedTodayText"
          @previous="state.changeMonthBy(-1)"
          @next="state.changeMonthBy(1)"
          @today="state.goToday"
        >
          <template v-if="$slots['header-left']" #left>
            <slot name="header-left" :month="state.displayMonth.value" />
          </template>
          <template v-if="$slots['header-right-before']" #right-before>
            <slot name="header-right-before" :month="state.displayMonth.value" />
          </template>
          <template v-if="$slots['header-right-after']" #right-after>
            <slot name="header-right-after" :month="state.displayMonth.value" />
          </template>
        </MonthCalendarHeader>
      </slot>
    </div>
    <MonthCalendarPanel
      :calendar-value="state.calendarPanelValue.value"
      :display-month="state.displayMonth.value"
      :selected-value="state.selectedValue.value"
      :loading="loading"
      :loading-tip="resolvedLoadingTip"
      :show-outside-days="showOutsideDays"
      :context-menu-enabled="contextMenuEnabled"
      :today-text="resolvedTodayText"
      :today-indicator="todayIndicator"
      :get-cell-context="state.getCellContext"
      :cell-class-name="cellClassName"
      :cell-style="cellStyle"
      @click="handleClick"
      @dblclick="handleDoubleClick"
      @contextmenu="handleContextMenu"
      @keydown="handleKeydown"
    >
      <template v-if="$slots.weekday" #weekday="context"><slot name="weekday" v-bind="context" /></template>
      <template v-if="$slots['date-cell']" #date-cell="context"><slot name="date-cell" v-bind="context" /></template>
      <template v-if="$slots['date-cell-extra']" #date-cell-extra="context">
        <slot name="date-cell-extra" v-bind="context" />
      </template>
      <template v-if="$slots.loading" #loading><slot name="loading" /></template>
    </MonthCalendarPanel>
    <MonthCalendarContextMenu
      v-if="contextMenuEnabled && activeContext"
      :x="contextMenuPosition.x"
      :y="contextMenuPosition.y"
      :appearance="appearance"
      @close="handleContextMenuClose"
    >
      <slot name="context-menu" v-bind="{ ...activeContext, close: closeContextMenu }" />
    </MonthCalendarContextMenu>
  </section>
</template>
<style scoped lang="less">
@import url('./style.less');
</style>
