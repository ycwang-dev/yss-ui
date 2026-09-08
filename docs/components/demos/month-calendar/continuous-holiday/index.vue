<script setup lang="ts">
import { ref } from 'vue';
import dayjs, { locale as setDayjsLocale } from 'dayjs';
import 'dayjs/locale/zh-cn.js';
import { YMonthCalendar } from '@yss-ui/components';
import { getHolidaySegments, HOLIDAY_LANE_COUNT, WEEK_LABELS } from './constant';

setDayjsLocale('zh-cn');

/** 当前选中日期。 */
const value = ref(dayjs('2026-10-01'));
/** 当前展示月份。 */
const month = ref(dayjs('2026-10-01'));
</script>

<template>
  <div class="continuous-holiday-demo">
    <div class="continuous-holiday-demo__guide">
      连续网格会消除日期卡片之间的缝隙；区间条在周日结束，并在下一周周一重新显示名称。
    </div>
    <YMonthCalendar v-model="value" v-model:month="month" cell-layout="grid" :cell-height="132">
      <template #date-cell="{ date, isCurrentMonth, isToday }">
        <div :class="['continuous-holiday-demo__date', { 'is-outside': !isCurrentMonth, 'is-today': isToday }]">
          <strong>{{ date.format('DD') }}</strong>
          <span>{{ WEEK_LABELS[date.day()] }}</span>
        </div>
        <div
          class="continuous-holiday-demo__events"
          :style="{ gridTemplateRows: `repeat(${HOLIDAY_LANE_COUNT}, 20px)` }"
        >
          <div
            v-for="segment in getHolidaySegments(date)"
            :key="segment.holiday.id"
            :class="['continuous-holiday-demo__event', `is-${segment.holiday.tone}`, `is-${segment.position}`]"
            :style="{ gridRow: segment.row }"
            :title="segment.holiday.label"
          >
            <span v-if="segment.showLabel">
              <b aria-hidden="true">★</b>
              {{ segment.holiday.label }}
            </span>
          </div>
        </div>
      </template>
    </YMonthCalendar>
  </div>
</template>

<style scoped lang="less">
@import url('./style.less');
</style>
