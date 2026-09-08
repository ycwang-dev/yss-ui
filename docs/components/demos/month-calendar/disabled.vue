<script setup lang="ts">
import { ref } from 'vue';
import dayjs from 'dayjs';
import { YMonthCalendar } from '@yss-ui/components';

/** 选中日期。 */
const value = ref(dayjs('2026-06-30'));
/** 展示月份。 */
const month = ref(dayjs('2026-06-01'));
/** 可选范围定义：2026-06-05 至 2026-07-20 之间。 */
const validRange: [dayjs.Dayjs, dayjs.Dayjs] = [dayjs('2026-06-05'), dayjs('2026-07-20')];

/**
 * 自定义禁用日期。本例中将禁用 2026-06-18。
 * @param date - 当前判断的日期对象
 * @returns 是否禁用
 */
const disabledDate = (date: dayjs.Dayjs): boolean => date.isSame(dayjs('2026-06-18'), 'day');
</script>

<template>
  <div class="month-calendar-demo-disabled">
    <div class="month-calendar-demo-disabled__guide">
      可选范围：2026-06-05 至 2026-07-20 之间，且 2026-06-18 被自定义禁用。
    </div>
    <YMonthCalendar v-model="value" v-model:month="month" :valid-range="validRange" :disabled-date="disabledDate" />
  </div>
</template>

<style scoped lang="less">
.month-calendar-demo-disabled {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.month-calendar-demo-disabled__guide {
  margin-bottom: 12px;
  color: inherit;
  font-size: 14px;
  opacity: 0.65;
}
</style>
