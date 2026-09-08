<script setup lang="ts">
import { ref } from 'vue';
import { useLoading } from '@yss-ui/hooks';
import { Button, Space, message } from 'ant-design-vue';

defineOptions({ name: 'UseLoadingBasicDemo' });

const AButton = Button;
const ASpace = Space;

const { loading, withLoading } = useLoading();
const data = ref<string>('');

/**
 * 模拟成功的异步数据加载
 */
const fetchData = () => {
  withLoading(
    async () => {
      // 模拟 API 请求
      await new Promise(resolve => setTimeout(resolve, 2000));
      return '数据加载成功！时间：' + new Date().toLocaleTimeString();
    },
    {
      onSuccess: result => {
        data.value = result;
        message.success('数据加载完成');
      },
      onFinally: () => {
        console.log('请求完成');
      },
    }
  );
};

/**
 * 模拟失败的异步请求
 */
const fetchWithError = () => {
  withLoading(
    async () => {
      await new Promise((_, reject) => setTimeout(() => reject(new Error('网络错误')), 1500));
    },
    {
      onError: error => {
        message.error(`加载失败: ${error.message}`);
        data.value = '';
      },
      onFinally: () => {
        console.log('错误请求完成');
      },
    }
  );
};
</script>

<template>
  <div class="demo-container">
    <a-space>
      <a-button type="primary" :loading="loading" @click="fetchData">
        {{ loading ? '加载中...' : '加载数据' }}
      </a-button>
      <a-button danger :loading="loading" :disabled="loading" @click="fetchWithError"> 模拟错误 </a-button>
    </a-space>
    <div v-if="data" class="result-text">{{ data }}</div>
  </div>
</template>

<style scoped lang="less">
.demo-container {
  background: #f5f5f5;
  padding: 24px;
  border-radius: 8px;
}

.result-text {
  margin-top: 16px;
  padding: 12px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  color: #0958d9;
}
</style>
