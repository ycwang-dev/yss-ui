<script setup lang="ts">
import { ref } from 'vue';
import { useFullscreen } from '@yss-ui/hooks';
import { Button } from 'ant-design-vue';

defineOptions({ name: 'FullscreenDemo3Page' });

const AButton = Button;

const containerRef = ref<HTMLElement>();

/**
 * 使用页面全屏模式（伪全屏）
 * 通过 CSS fixed 定位实现，不使用浏览器全屏 API
 */
const { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen } = useFullscreen(containerRef, {
  pageFullscreen: true,
});
</script>

<template>
  <div class="demo-wrapper">
    <div ref="containerRef" class="fullscreen-content">
      <div class="status-text">
        {{ isFullscreen ? '页面全屏中' : '未全屏' }}
      </div>
      <div class="button-group">
        <a-button class="mr-8" @click="enterFullscreen"> 进入全屏 </a-button>
        <a-button class="mr-8" @click="exitFullscreen"> 退出全屏 </a-button>
        <a-button type="primary" @click="toggleFullscreen"> 切换全屏 </a-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.demo-wrapper {
  background: #f5f5f5;
  padding: 24px;
  border-radius: 8px;
}

.fullscreen-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  border-radius: 8px;
  color: white;
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
