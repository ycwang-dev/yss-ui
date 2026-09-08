<script setup lang="ts">
import { computed } from 'vue';
import type { YMonthCalendarTodayIndicator } from '../types';

defineOptions({ name: 'YMonthCalendarDateLabel' });

const props = defineProps<{
  dateLabel: string;
  isToday: boolean;
  todayText: string;
  todayIndicator: YMonthCalendarTodayIndicator;
}>();

/** 是否在日期数字上展示今天圆形标记。 */
const showDateIndicator = computed(
  () => props.isToday && (props.todayIndicator === 'date' || props.todayIndicator === 'both')
);

/** 是否展示原有今天文字徽标。 */
const showTodayBadge = computed(
  () =>
    props.isToday && Boolean(props.todayText) && (props.todayIndicator === 'badge' || props.todayIndicator === 'both')
);
</script>

<template>
  <div class="y-month-calendar__date-line">
    <span
      :class="['y-month-calendar__date', { 'y-month-calendar__date--today': showDateIndicator }]"
      :title="showDateIndicator && todayText ? todayText : undefined"
    >
      {{ dateLabel }}
    </span>
    <span v-if="showTodayBadge" class="y-month-calendar__today-badge" :title="todayText">
      {{ todayText }}
    </span>
  </div>
</template>
