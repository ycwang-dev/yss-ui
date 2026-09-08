<script setup lang="ts">
import { ref } from 'vue';
import { copyToClipboard } from '@yss-ui/utils';
import { Input, Button, message } from 'ant-design-vue';

const textToCopy = ref('这是一段用于测试剪贴板复制功能的样例文本。');
const loading = ref(false);

const handleCopy = async () => {
  if (!textToCopy.value) {
    message.warning('请输入要复制的内容');
    return;
  }

  loading.value = true;
  try {
    const success = await copyToClipboard(textToCopy.value);
    if (success) {
      message.success('已成功复制到剪贴板');
    } else {
      message.error('复制失败，请重试');
    }
  } catch (error) {
    message.error('复制出错');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div style="display: flex; gap: 8px; align-items: center">
    <Input v-model:value="textToCopy" style="width: 320px" placeholder="请输入需要复制的文本..." />
    <Button type="primary" :loading="loading" @click="handleCopy"> 复制文本 </Button>
  </div>
</template>
