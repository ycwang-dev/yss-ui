<script setup lang="ts">
import { ref } from 'vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { YMonthCalendar, YButton } from '@yss-ui/components';
import { message } from 'ant-design-vue';

/** 选中日期。 */
const value = ref(dayjs('2026-07-01'));
/** 展示月份。 */
const month = ref(dayjs('2026-07-01'));
/** 加载状态。 */
const loading = ref(false);

/** 刷新日历数据。 */
const handleRefresh = (): void => {
  loading.value = true;
  const hide = message.loading('正在刷新日历数据...', 0);
  setTimeout(() => {
    loading.value = false;
    hide();
    message.success('日历数据已刷新');
  }, 1000);
};
</script>

<template>
  <div class="month-calendar-demo-slots">
    <YMonthCalendar v-model="value" v-model:month="month" :loading="loading">
      <!-- 在右侧操作按钮组后部加入刷新按钮 -->
      <template #header-right-after>
        <YButton size="small" aria-label="刷新" title="刷新" :disabled="loading" @click="handleRefresh">
          <template #icon><ReloadOutlined /></template>
        </YButton>
      </template>
    </YMonthCalendar>
  </div>
</template>

<style scoped lang="less">
.month-calendar-demo-slots {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
</style>
