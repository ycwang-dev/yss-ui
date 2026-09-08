<script setup lang="ts">
import { CalendarOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import YButton from '../../button/index.vue';
import type { YMonthCalendarHeaderActions } from '../types';
import { useLocale } from '../../locale/useLocale';

defineOptions({ name: 'YMonthCalendarHeader' });

defineProps<{
  monthLabel: string;
  loading: boolean;
  previousDisabled: boolean;
  nextDisabled: boolean;
  todayDisabled: boolean;
  actions: Required<YMonthCalendarHeaderActions>;
  isTodaySelected?: boolean;
  todayText?: string;
}>();
const emit = defineEmits<{ previous: []; next: []; today: [] }>();

const { t } = useLocale('monthCalendar');
</script>

<template>
  <div class="y-month-calendar__header-left">
    <slot name="left">
      <strong>{{ monthLabel }}</strong>
    </slot>
  </div>
  <div class="y-month-calendar__header-right">
    <slot name="right-before" />
    <div v-if="actions.previous || actions.today || actions.next" class="y-month-calendar__header-actions">
      <YButton
        v-if="actions.previous"
        class="y-month-calendar__header-action y-month-calendar__header-action--previous"
        size="small"
        :aria-label="t('previousMonth')"
        :title="t('previousMonth')"
        :disabled="previousDisabled || loading"
        @click="emit('previous')"
      >
        <template #icon><LeftOutlined /></template>
      </YButton>
      <YButton
        v-if="actions.today"
        :class="[
          'y-month-calendar__header-action',
          'y-month-calendar__header-action--today',
          { 'y-month-calendar__header-action--selected': isTodaySelected },
        ]"
        size="small"
        :aria-label="t('backToToday')"
        :title="t('backToToday')"
        :disabled="todayDisabled || loading"
        @click="emit('today')"
      >
        <template #icon><CalendarOutlined /></template>
        <span class="y-month-calendar__header-today-text">{{ todayText || t('today') }}</span>
      </YButton>
      <YButton
        v-if="actions.next"
        class="y-month-calendar__header-action y-month-calendar__header-action--next"
        size="small"
        :aria-label="t('nextMonth')"
        :title="t('nextMonth')"
        :disabled="nextDisabled || loading"
        @click="emit('next')"
      >
        <template #icon><RightOutlined /></template>
      </YButton>
    </div>
    <slot name="right-after" />
  </div>
</template>
