<template>
  <div class="demo-container" style="padding: 12px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap">
    <a-input v-model:value="content" placeholder="内容" style="width: 240px" />
    <a-input v-model:value="fileName" placeholder="文件名，如 hello.txt" style="width: 240px" />
    <a-button type="primary" @click="download">下载</a-button>
  </div>
</template>

<script setup lang="ts">
import { downloadFileStream } from '@yss-ui/utils';
import { Button, Input } from 'ant-design-vue';
import { ref } from 'vue';

const AInput = Input;
const AButton = Button;

const content = ref<string>('这是一段示例文本');
const fileName = ref<string>('hello.txt');

const download = (): void => {
  const blob = new Blob([content.value], { type: 'text/plain;charset=utf-8' });
  downloadFileStream(blob, fileName.value);
};
</script>

<style scoped></style>
