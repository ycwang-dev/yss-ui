<template>
  <div class="demo-container" style="padding: 12px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap">
    <a-space direction="vertical">
      <a-space>
        <a-button @click="write">写入模拟认证数据</a-button>
        <a-button danger type="primary" @click="clear">清除认证数据</a-button>
      </a-space>
      <div class="demo-hint-text">auth_btns：</div>
      <pre style="max-width: 680px; white-space: pre-wrap">{{ authBtnsPreview }}</pre>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import { clearAuthInfo } from '@yss-ui/utils';
import { Button, Space } from 'ant-design-vue';
import { computed } from 'vue';

const ASpace = Space;
const AButton = Button;

const demoAuth = [
  { btnCode: 'VIEW', btnName: '查看' },
  { btnCode: 'EDIT', btnName: '编辑' },
];

const write = (): void => {
  localStorage.setItem('access_token', 'token_xxx');
  localStorage.setItem('user_info', JSON.stringify({ name: 'YSS' }));
  localStorage.setItem('auth_btns', JSON.stringify(demoAuth));
};

const clear = (): void => {
  clearAuthInfo();
};

const authBtnsPreview = computed(() => {
  try {
    return JSON.stringify(JSON.parse(localStorage.getItem('auth_btns') || 'null'), null, 2);
  } catch {
    return 'null';
  }
});
</script>

<style scoped></style>
