<template>
  <div class="demo-container" style="padding: 12px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap">
    <a-date-picker v-model:value="dateVal" value-format="x" show-time style="width: 240px" />
    <div style="display: flex; gap: 8px">
      <y-button type="primary" @click="toToday">今天</y-button>
      <y-button @click="toYesterday">昨天</y-button>
      <y-button @click="toThisYear">今年某日</y-button>
      <y-button @click="toLastYear">去年某日</y-button>
    </div>
    <div style="min-width: 220px">
      <span class="demo-hint-text">输出：</span>
      <code>{{ result }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { YButton } from '@yss-ui/components';
import { formatDateRelative } from '@yss-ui/utils';
import { DatePicker } from 'ant-design-vue';
import { computed, ref } from 'vue';
import dayjs from 'dayjs';

const ADatePicker = DatePicker;

const dateVal = ref<string>(String(dayjs().valueOf()));

const toToday = (): void => {
  dateVal.value = String(dayjs().valueOf());
};
const toYesterday = (): void => {
  dateVal.value = String(dayjs().subtract(1, 'day').valueOf());
};
const toThisYear = (): void => {
  dateVal.value = String(dayjs().month(6).date(15).hour(9).minute(30).second(0).millisecond(0).valueOf());
};
const toLastYear = (): void => {
  dateVal.value = String(
    dayjs().subtract(1, 'year').month(11).date(20).hour(18).minute(5).second(0).millisecond(0).valueOf()
  );
};

const result = computed(() => formatDateRelative(Number(dateVal.value)));
</script>

<style scoped></style>
