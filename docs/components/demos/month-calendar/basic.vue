<script setup lang="ts">
import { ref } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn.js';
import { YMonthCalendar } from '@yss-ui/components';

dayjs.locale('zh-cn');

/** 选中日期。 */
const value = ref(dayjs('2026-07-01'));
/** 展示月份。 */
const month = ref(dayjs('2026-07-01'));
</script>

<template>
  <div class="month-calendar-demo-basic">
    <div class="month-calendar-demo-basic__value">当前选中日期：{{ value ? value.format('YYYY-MM-DD') : '-' }}</div>
    <YMonthCalendar v-model="value" v-model:month="month" />
  </div>
</template>

<style scoped lang="less">
.month-calendar-demo-basic {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.month-calendar-demo-basic__value {
  margin-bottom: 12px;
  color: var(--yss-month-calendar-primary, #3f5f9e);
  font-size: 14px;
  font-weight: 600;
}
</style>
