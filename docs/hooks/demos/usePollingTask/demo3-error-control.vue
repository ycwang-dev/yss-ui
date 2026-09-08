<script setup lang="ts">
import { reactive } from 'vue';
import { Alert, Button, Space, Tag } from 'ant-design-vue';
import { usePollingTask } from '@yss-ui/hooks';

defineOptions({ name: 'UsePollingTaskDemo3ErrorControl' });

const AAlert = Alert;
const AButton = Button;
const ASpace = Space;
const ATag = Tag;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const createScenario = (label: string, continueOnError: boolean) => {
  const state = reactive({
    attempts: 0,
    successCount: 0,
    errorCount: 0,
    lastMessage: '未开始',
    logs: [] as string[],
  });

  const appendLog = (message: string) => {
    state.logs = [message, ...state.logs].slice(0, 6);
    state.lastMessage = message;
  };

  const polling = usePollingTask(
    async ({ generation }) => {
      state.attempts += 1;
      appendLog(`${label}: 第 ${state.attempts} 次尝试，generation=${generation}`);

      await sleep(500);

      if (state.attempts % 3 === 0) {
        throw new Error(`${label}: 模拟请求失败`);
      }

      state.successCount += 1;
      appendLog(`${label}: 请求成功，累计成功 ${state.successCount} 次`);
    },
    {
      interval: 1500,
      continueOnError,
      onError: error => {
        state.errorCount += 1;
        appendLog(`${label}: ${(error as Error).message}`);
      },
    }
  );

  return {
    state,
    ...polling,
  };
};

const keepRunning = createScenario('继续模式', true);
const stopOnError = createScenario('停止模式', false);

const startAll = () => {
  void keepRunning.start({ immediate: true });
  void stopOnError.start({ immediate: true });
};

const stopAll = () => {
  keepRunning.stop();
  stopOnError.stop();
};
</script>

<template>
  <div class="demo-container">
    <a-alert
      type="warning"
      show-icon
      message="这个 Demo 每第 3 次请求都会失败。左侧 continueOnError=true 会继续轮询，右侧 continueOnError=false 会在报错后停掉。"
    />

    <a-space>
      <a-button type="primary" @click="startAll">全部启动</a-button>
      <a-button @click="stopAll">全部停止</a-button>
    </a-space>

    <div class="panel-grid">
      <div class="panel-card">
        <div class="panel-header">
          <span>continueOnError = true</span>
          <a-tag :color="keepRunning.isActive ? 'processing' : 'default'">
            {{ keepRunning.isActive ? '轮询中' : '已停止' }}
          </a-tag>
        </div>
        <div class="stats">
          <div>尝试次数：{{ keepRunning.state.attempts }}</div>
          <div>成功次数：{{ keepRunning.state.successCount }}</div>
          <div>错误次数：{{ keepRunning.state.errorCount }}</div>
        </div>
        <div class="logs">
          <div v-for="item in keepRunning.state.logs" :key="item" class="log-item">{{ item }}</div>
        </div>
      </div>

      <div class="panel-card">
        <div class="panel-header">
          <span>continueOnError = false</span>
          <a-tag :color="stopOnError.isActive ? 'processing' : 'default'">
            {{ stopOnError.isActive ? '轮询中' : '已停止' }}
          </a-tag>
        </div>
        <div class="stats">
          <div>尝试次数：{{ stopOnError.state.attempts }}</div>
          <div>成功次数：{{ stopOnError.state.successCount }}</div>
          <div>错误次数：{{ stopOnError.state.errorCount }}</div>
        </div>
        <div class="logs">
          <div v-for="item in stopOnError.state.logs" :key="item" class="log-item">{{ item }}</div>
        </div>
      </div>
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
  background: linear-gradient(180deg, #fffdfa 0%, #fff7ed 100%);
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.panel-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #f4e2c4;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.stats {
  display: grid;
  gap: 8px;
  color: rgb(0 0 0 / 70%);
}

.logs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  padding: 10px 12px;
  border-radius: 8px;
  background: #fff8ee;
  color: #7c2d12;
  font-size: 12px;
}
</style>
