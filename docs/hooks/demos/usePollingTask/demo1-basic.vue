<script setup lang="ts">
import { ref } from 'vue';
import { Alert, Button, Space, Tag } from 'ant-design-vue';
import { usePollingTask } from '@yss-ui/hooks';

defineOptions({ name: 'UsePollingTaskDemo1Basic' });

const AAlert = Alert;
const AButton = Button;
const ASpace = Space;
const ATag = Tag;

const logs = ref<string[]>([]);
const runCount = ref(0);
const lastRunAt = ref('-');

const appendLog = (message: string) => {
  logs.value = [message, ...logs.value].slice(0, 6);
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const { isActive, isRunning, currentInterval, generation, start, stop, restart, runNow } = usePollingTask(
  async ({ generation: currentGeneration, isCurrent }) => {
    const startedAt = new Date().toLocaleTimeString();
    appendLog(`[g${currentGeneration}] 开始执行 ${startedAt}`);

    await sleep(600);

    if (!isCurrent()) {
      appendLog(`[g${currentGeneration}] 本轮结果已失效，跳过写入`);
      return;
    }

    runCount.value += 1;
    lastRunAt.value = startedAt;
    appendLog(`[g${currentGeneration}] 执行完成，第 ${runCount.value} 次`);
  },
  {
    interval: 2000,
    pauseWhenHidden: true,
  }
);
</script>

<template>
  <div class="demo-container">
    <a-alert
      type="info"
      show-icon
      message="isRunning 只表示本轮轮询任务正在执行，不等同于页面 loading。业务页面如果要静默刷新，不要直接把它绑定到页面级 loading。"
    />

    <div class="toolbar">
      <a-space wrap>
        <a-button type="primary" @click="start({ immediate: true })">开始轮询</a-button>
        <a-button @click="stop">停止轮询</a-button>
        <a-button @click="restart({ immediate: true })">重启轮询</a-button>
        <a-button type="dashed" @click="runNow">立即执行一轮</a-button>
      </a-space>
    </div>

    <div class="status-panel">
      <div class="status-item">
        <span class="label">轮询状态</span>
        <a-tag :color="isActive ? 'processing' : 'default'">{{ isActive ? '进行中' : '已停止' }}</a-tag>
      </div>
      <div class="status-item">
        <span class="label">本轮执行中</span>
        <a-tag :color="isRunning ? 'warning' : 'success'">{{ isRunning ? '是' : '否' }}</a-tag>
      </div>
      <div class="status-item">
        <span class="label">当前间隔</span>
        <span>{{ currentInterval }} ms</span>
      </div>
      <div class="status-item">
        <span class="label">generation</span>
        <span>{{ generation }}</span>
      </div>
      <div class="status-item">
        <span class="label">成功执行次数</span>
        <span>{{ runCount }}</span>
      </div>
      <div class="status-item">
        <span class="label">最近执行时间</span>
        <span>{{ lastRunAt }}</span>
      </div>
    </div>

    <div class="log-panel">
      <div class="log-title">最近日志</div>
      <div v-if="logs.length" class="log-list">
        <div v-for="item in logs" :key="item" class="log-item">{{ item }}</div>
      </div>
      <div v-else class="log-empty">点击“开始轮询”或“立即执行一轮”查看效果</div>
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
  background: linear-gradient(180deg, #fbfcff 0%, #f5f8ff 100%);
}

.toolbar {
  padding: 4px 0;
}

.status-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e8eefc;
}

.label {
  color: rgb(0 0 0 / 65%);
}

.log-panel {
  padding: 16px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e8eefc;
}

.log-title {
  margin-bottom: 12px;
  font-weight: 600;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  padding: 10px 12px;
  border-radius: 8px;
  background: #f7f9ff;
  color: #334155;
  font-family: Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
}

.log-empty {
  color: rgb(0 0 0 / 45%);
}
</style>
