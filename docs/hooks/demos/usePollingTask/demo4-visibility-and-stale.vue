<script setup lang="ts">
import { ref } from 'vue';
import { Alert, Button, Space, Tag } from 'ant-design-vue';
import { usePollingTask } from '@yss-ui/hooks';

defineOptions({ name: 'UsePollingTaskDemo4VisibilityAndStale' });

const AAlert = Alert;
const AButton = Button;
const ASpace = Space;
const ATag = Tag;

const latestRequestId = ref(0);
const appliedResult = ref('暂无结果');
const logs = ref<string[]>([]);

const appendLog = (message: string) => {
  logs.value = [message, ...logs.value].slice(0, 8);
};

const waitWithSignal = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    const cleanup = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    };

    const onAbort = () => {
      cleanup();
      reject(new DOMException('aborted', 'AbortError'));
    };

    signal?.addEventListener('abort', onAbort, { once: true });
  });

const { isActive, isRunning, generation, start, stop, restart, runNow } = usePollingTask(
  async ({ generation: currentGeneration, signal, isCurrent }) => {
    latestRequestId.value += 1;
    const requestId = latestRequestId.value;
    appendLog(`[g${currentGeneration}] 请求 #${requestId} 已启动`);

    try {
      await waitWithSignal(1800, signal);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        appendLog(`[g${currentGeneration}] 请求 #${requestId} 已被 abort`);
        return;
      }
      throw error;
    }

    if (!isCurrent()) {
      appendLog(`[g${currentGeneration}] 请求 #${requestId} 结果已过期，放弃写入`);
      return;
    }

    appliedResult.value = `请求 #${requestId} 在 ${new Date().toLocaleTimeString()} 写入成功`;
    appendLog(`[g${currentGeneration}] 请求 #${requestId} 已写入最新结果`);
  },
  {
    interval: 4000,
    pauseWhenHidden: true,
    resumeMode: 'immediate',
  }
);
</script>

<template>
  <div class="demo-container">
    <a-alert
      type="info"
      show-icon
      message="这个 Demo 演示 signal 与 isCurrent() 的配合。切换浏览器标签页可观察暂停/恢复；在请求进行中点击“立即重启”可观察旧请求被 abort 或旧结果被丢弃。"
    />

    <a-space wrap>
      <a-button type="primary" @click="start({ immediate: true })">开始轮询</a-button>
      <a-button type="dashed" @click="restart({ immediate: true })">立即重启</a-button>
      <a-button @click="runNow">立即执行一轮</a-button>
      <a-button @click="stop">停止轮询</a-button>
    </a-space>

    <div class="status-panel">
      <div class="status-item">
        <span>轮询状态</span>
        <a-tag :color="isActive ? 'processing' : 'default'">{{ isActive ? '进行中' : '已停止' }}</a-tag>
      </div>
      <div class="status-item">
        <span>执行中</span>
        <a-tag :color="isRunning ? 'warning' : 'success'">{{ isRunning ? '是' : '否' }}</a-tag>
      </div>
      <div class="status-item">
        <span>generation</span>
        <strong>{{ generation }}</strong>
      </div>
      <div class="status-item">
        <span>当前展示结果</span>
        <strong>{{ appliedResult }}</strong>
      </div>
    </div>

    <div class="log-panel">
      <div class="log-title">失效保护 / Abort 日志</div>
      <div v-if="logs.length" class="log-list">
        <div v-for="item in logs" :key="item" class="log-item">{{ item }}</div>
      </div>
      <div v-else class="log-empty">开始后观察日志变化</div>
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
  background: linear-gradient(180deg, #faf5ff 0%, #f5efff 100%);
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
  padding: 14px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #eadcff;
}

.log-panel {
  padding: 16px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #eadcff;
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
  background: #f8f4ff;
  color: #5b21b6;
  font-size: 12px;
}

.log-empty {
  color: rgb(0 0 0 / 45%);
}
</style>
