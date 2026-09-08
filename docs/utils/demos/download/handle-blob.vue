<template>
  <div class="demo-container" style="padding: 12px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap">
    <a-input v-model:value="fileName" placeholder="文件名（含扩展名）" style="width: 240px" />
    <a-select v-model:value="charset" style="width: 320px">
      <a-select-option value="normal">Content-Disposition: filename="..."</a-select-option>
      <a-select-option value="utf8">Content-Disposition: filename*=utf-8''...</a-select-option>
    </a-select>
    <a-button type="primary" @click="download">下载模拟文件</a-button>
  </div>
</template>

<script setup lang="ts">
import { handleBlobResponse } from '@yss-ui/utils';
import { Button, Input, Select } from 'ant-design-vue';
import { ref } from 'vue';

const AInput = Input;
const ASelect = Select;
const ASelectOption = Select.Option;
const AButton = Button;

const fileName = ref<string>('报告.xlsx');
const charset = ref<'normal' | 'utf8'>('normal');

const download = (): void => {
  const data = new Blob(['hello world'], { type: 'text/plain;charset=utf-8' });
  const headers: Record<string, string> = {};
  if (charset.value === 'utf8') {
    headers['content-disposition'] = `attachment; filename*=utf-8''${encodeURIComponent(fileName.value)}`;
  } else {
    headers['content-disposition'] = `attachment; filename="${encodeURI(fileName.value)}"`;
  }
  // 现在 handleBlobResponse 会自动识别两种格式，无需传第三个参数
  handleBlobResponse(data, headers);
};
</script>

<style scoped></style>
