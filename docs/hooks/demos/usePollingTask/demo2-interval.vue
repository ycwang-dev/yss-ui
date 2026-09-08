<script setup lang="ts">
import { computed, ref } from 'vue';
import { Alert, Button, Select, Space, Tag } from 'ant-design-vue';
import { usePollingTask } from '@yss-ui/hooks';

defineOptions({ name: 'UsePollingTaskDemo2Interval' });

const AAlert = Alert;
const AButton = Button;
const ASelect = Select;
const ASpace = Space;
const ATag = Tag;

const intervalOptions = [
  { label: '0s（停止）', value: 0 },
  { label: '1s', value: 1 },
  { label: '2s', value: 2 },
  { label: '5s', value: 5 },
];

const intervalSeconds = ref(2);
const runCount = ref(0);
const logs = ref<string[]>([]);

const appendLog = (message: string) => {
  logs.value = [message, ...logs.value].slice(0, 8);
};

const { isActive, currentInterval, start, stop } = usePollingTask(
  async ({ generation }) => {
    runCount.value += 1;
    appendLog(`[g${generation}] 已执行，第 ${runCount.value} 次，间隔 ${intervalSeconds.value}s`);
  },
  {
    interval: computed(() => intervalSeconds.value * 1000),
    pauseWhenHidden: true,
  }
);

const handleIntervalChange = (value: unknown) => {
  const nextValue = typeof value === 'number' ? value : Number(value);
  intervalSeconds.value = Number.isFinite(nextValue) ? nextValue : 0;
  appendLog(`切换轮询间隔到 ${intervalSeconds.value}s`);
};
</script>

<template>
  <div class="demo-container">
    <a-alert
      type="success"
      show-icon
      message="轮询进行中切换间隔会立即生效；切到 0 会自动停止。这个 Demo 展示的是 Hook 的调度能力，不关心页面 loading。"
    />

    <div class="controls">
      <a-space wrap>
        <a-select
          :value="intervalSeconds"
          style="width: 180px"
          :options="intervalOptions"
          @change="handleIntervalChange"
        />
        <a-button type="primary" @click="start({ immediate: true })">开始轮询</a-button>
        <a-button @click="stop">停止轮询</a-button>
      </a-space>
    </div>

    <div class="summary">
      <div class="summary-card">
        <span>是否激活</span>
        <a-tag :color="isActive ? 'processing' : 'default'">{{ isActive ? '是' : '否' }}</a-tag>
      </div>
      <div class="summary-card">
        <span>当前间隔</span>
        <strong>{{ currentInterval }} ms</strong>
      </div>
      <div class="summary-card">
        <span>执行次数</span>
        <strong>{{ runCount }}</strong>
      </div>
    </div>

    <div class="timeline">
      <div class="timeline-title">切换记录</div>
      <div v-if="logs.length" class="timeline-list">
        <div v-for="item in logs" :key="item" class="timeline-item">{{ item }}</div>
      </div>
      <div v-else class="timeline-empty">启动后切换间隔，观察日志变化</div>
    </div>
  </div>
</template>

<style scoped lang="less">
.demo-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: 12px;
  background: linear-gradient(180deg, #fbfffb 0%, #f3fbf6 100%);
}

.summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.summary-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #dff2e4;
}

.timeline {
  padding: 16px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #dff2e4;
}

.timeline-title {
  margin-bottom: 12px;
  font-weight: 600;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-item {
  padding: 10px 12px;
  border-radius: 8px;
  background: #f6fbf7;
  color: #334155;
}

.timeline-empty {
  color: rgb(0 0 0 / 45%);
}
</style>
