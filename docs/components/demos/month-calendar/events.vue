<script setup lang="ts">
import { ref } from 'vue';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue';
import { YMonthCalendar } from '@yss-ui/components';
import type { YMonthCalendarPointerPayload } from '@yss-ui/components';

/** 选中日期。 */
const value = ref(dayjs('2026-07-01'));
/** 展示月份。 */
const month = ref(dayjs('2026-07-01'));

/**
 * 单击单元格事件处理。
 * @param payload - 事件数据载荷
 */
const handleClick = (payload: YMonthCalendarPointerPayload): void => {
  message.info(`单击单元格：${payload.dateKey}`);
};

/**
 * 双击单元格事件处理。
 * @param payload - 事件数据载荷
 */
const handleDoubleClick = (payload: YMonthCalendarPointerPayload): void => {
  message.success(`双击打开：${payload.dateKey}`);
};
</script>

<template>
  <div class="month-calendar-demo-events">
    <div class="month-calendar-demo-events__guide">单击或双击任意日期单元格，可查看交互提示。</div>
    <YMonthCalendar
      v-model="value"
      v-model:month="month"
      @cell-click="handleClick"
      @cell-dblclick="handleDoubleClick"
    />
  </div>
</template>

<style scoped lang="less">
.month-calendar-demo-events {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.month-calendar-demo-events__guide {
  margin-bottom: 12px;
  color: inherit;
  font-size: 14px;
  opacity: 0.65;
}
</style>
