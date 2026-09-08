<template>
  <div class="demo-container" style="padding: 12px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap">
    <a-input v-model:value="url" placeholder="输入 URL，如 https://.../file.txt" style="width: 360px" />
    <a-input v-model:value="fileName" placeholder="文件名（可选）" style="width: 240px" />
    <a-button type="primary" @click="download">下载</a-button>
  </div>
</template>

<script setup lang="ts">
import { downloadFileFromUrl } from '@yss-ui/utils';
import { Button, Input } from 'ant-design-vue';
import { ref } from 'vue';

const AInput = Input;
const AButton = Button;

const url = ref<string>('data:text/plain;charset=utf-8,' + encodeURIComponent('Hello from URL!'));
const fileName = ref<string>('from-url.txt');

const download = (): void => {
  downloadFileFromUrl(url.value, fileName.value || undefined);
};
</script>

<style scoped></style>
