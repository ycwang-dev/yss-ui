<template>
  <div class="file-import-custom-config-demo">
    <YButton type="primary" @click="visible = true">无模板按钮导入</YButton>
    <YFileImport
      v-model:model-value="visible"
      title="导入数据"
      :show-download-template="false"
      :show-upload-tip="false"
      dragger-text="拖拽或点击选择 Excel 文件"
      :texts="{
        nextStep: '开始校验',
        confirmImport: '提交导入',
        cancel: '关闭',
      }"
      :file-type-list="['xlsx']"
      @next-step="handleNextStep"
      @final-import="handleFinalImport"
    />
  </div>
</template>

<script setup lang="ts">
import { YButton, YFileImport } from '@yss-ui/components';
import { ref } from 'vue';

const visible = ref(false);

function handleNextStep({ onSuccess }: { onSuccess: () => void }) {
  onSuccess();
}

function handleFinalImport({ close }: { close: () => void }) {
  (window as any).$message?.success?.('导入成功');
  close();
}
</script>
