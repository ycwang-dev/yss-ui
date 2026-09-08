<script setup lang="ts">
import { ref } from 'vue';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue';
import { YMonthCalendar } from '@yss-ui/components';

/** 选中日期。 */
const value = ref(dayjs('2026-07-01'));
/** 展示月份。 */
const month = ref(dayjs('2026-07-01'));

/**
 * 执行右键菜单指令并弹出提示信息。
 * @param action - 指令文案
 * @param dateKey - 日期字符串 (YYYY-MM-DD)
 * @param close - 关闭菜单的回调函数
 */
const handleMenuAction = (action: string, dateKey: string, close: () => void): void => {
  message.info(`${action}：${dateKey}`);
  close();
};
</script>

<template>
  <div class="month-calendar-demo-context-menu">
    <div class="month-calendar-demo-context-menu__guide">右键单击任意日期单元格以唤起上下文菜单。</div>
    <YMonthCalendar v-model="value" v-model:month="month">
      <template #context-menu="{ dateKey, close }">
        <div class="demo-calendar-menu">
          <small>{{ dateKey }}</small>
          <button type="button" @click="handleMenuAction('查看详情', dateKey, close)">查看当日详情</button>
          <button type="button" @click="handleMenuAction('维护日期', dateKey, close)">维护交易日</button>
        </div>
      </template>
    </YMonthCalendar>
  </div>
</template>

<style scoped lang="less">
.month-calendar-demo-context-menu {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.month-calendar-demo-context-menu__guide {
  margin-bottom: 12px;
  color: #68758a;
  font-size: 14px;
}

.demo-calendar-menu {
  display: grid;
  gap: 4px;
}

.demo-calendar-menu small {
  padding: 5px 8px 7px;
  color: #8792a5;
  border-bottom: 1px solid rgb(130 146 175 / 14%);
}

.demo-calendar-menu button {
  padding: 7px 9px;
  color: #35445d;
  text-align: left;
  border: 0;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}

.demo-calendar-menu button:hover {
  color: #3568dc;
  background: rgb(69 113 229 / 9%);
}
</style>
