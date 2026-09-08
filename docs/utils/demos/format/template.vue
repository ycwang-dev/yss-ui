<template>
  <div class="demo-container" style="padding: 12px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap">
    <a-date-picker v-model:value="dateVal" value-format="x" show-time style="width: 260px" />
    <a-select v-model:value="fmt" style="width: 240px">
      <a-select-option value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss</a-select-option>
      <a-select-option value="YYYY/MM/DD">YYYY/MM/DD</a-select-option>
      <a-select-option value="YYYY年MM月DD日 HH:mm">YYYY年MM月DD日 HH:mm</a-select-option>
    </a-select>
    <div style="min-width: 220px">
      <span class="demo-hint-text">输出：</span>
      <span>
        <code>{{ result }}</code>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '@yss-ui/utils';
import { DatePicker, Select } from 'ant-design-vue';
import { computed, ref } from 'vue';
import dayjs from 'dayjs';

const ADatePicker = DatePicker;
const ASelect = Select;
const ASelectOption = Select.Option;

const dateVal = ref<string>(String(dayjs().valueOf()));
const fmt = ref<string>('YYYY-MM-DD HH:mm:ss');
const result = computed(() => formatDate(Number(dateVal.value), fmt.value));
</script>

<style scoped></style>
