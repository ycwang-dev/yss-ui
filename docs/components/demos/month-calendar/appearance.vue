<script setup lang="ts">
import { ref } from 'vue';
import dayjs from 'dayjs';
import { YMonthCalendar } from '@yss-ui/components';

/** 选中日期。 */
const value = ref(dayjs('2026-07-01'));
/** 展示月份。 */
const month = ref(dayjs('2026-07-01'));
</script>

<template>
  <div class="month-calendar-demo-appearance">
    <div class="month-calendar-demo-appearance__guide">
      使用了 <code>plain</code> 预设（扁平、低装饰容器），且单元格高度设为 74px（默认为 88px）。
    </div>
    <YMonthCalendar v-model="value" v-model:month="month" appearance="plain" :cell-height="74" />
  </div>
</template>

<style scoped lang="less">
.month-calendar-demo-appearance {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.month-calendar-demo-appearance__guide {
  margin-bottom: 12px;
  color: #68758a;
  font-size: 14px;
}
</style>
