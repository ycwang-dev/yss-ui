<script setup lang="ts">
import { ref } from 'vue';
import { useFullscreen } from '@yss-ui/hooks';
import { Button } from 'ant-design-vue';

defineOptions({ name: 'FullscreenDemo1Basic' });

const AButton = Button;

const containerRef = ref<HTMLElement>();
const { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen } = useFullscreen(containerRef);
</script>

<template>
  <div ref="containerRef" class="demo-container">
    <div class="status-text">
      {{ isFullscreen ? '全屏中' : '未全屏' }}
    </div>
    <div class="button-group">
      <a-button type="primary" class="mr-8" @click="enterFullscreen"> 进入全屏 </a-button>
      <a-button class="mr-8" @click="exitFullscreen"> 退出全屏 </a-button>
      <a-button type="dashed" @click="toggleFullscreen"> 切换全屏 </a-button>
    </div>
  </div>
</template>

<style scoped lang="less">
.demo-container {
  background: #f5f5f5;
  padding: 24px;
  border-radius: 8px;
}

.status-text {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
}

.button-group {
  .mr-8 {
    margin-right: 8px;
  }
}
</style>
