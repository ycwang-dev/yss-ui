<script setup lang="ts">
import { useLoading } from '@yss-ui/hooks';
import { Button, Space, Spin, Tag } from 'ant-design-vue';

defineOptions({ name: 'UseLoadingManualDemo' });

const AButton = Button;
const ASpace = Space;
const ASpin = Spin;
const ATag = Tag;

const { loading, setLoading, toggleLoading } = useLoading();

const handleStart = () => setLoading(true);
const handleStop = () => setLoading(false);
const handleToggle = () => toggleLoading();
</script>

<template>
  <div class="demo-container">
    <a-space>
      <a-button type="primary" @click="handleStart">开始加载</a-button>
      <a-button @click="handleStop">停止加载</a-button>
      <a-button type="dashed" @click="handleToggle">切换状态</a-button>
    </a-space>
    <div class="status-display">
      <a-spin :spinning="loading">
        <div class="demo-content">
          <a-tag :color="loading ? 'blue' : 'green'">
            {{ loading ? '加载中...' : '空闲状态' }}
          </a-tag>
          <p class="status-text">
            当前加载状态：<strong>{{ loading }}</strong>
          </p>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<style scoped lang="less">
.demo-container {
  background: #f5f5f5;
  padding: 24px;
  border-radius: 8px;
}

.status-display {
  margin-top: 20px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  padding: 16px;
  background: #fff;
}

.demo-content {
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.status-text {
  margin: 0;
  font-size: 14px;
  color: #666;

  strong {
    color: #1890ff;
    font-weight: 600;
  }
}
</style>
