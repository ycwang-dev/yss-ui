<script setup lang="ts">
import { ref } from 'vue';
import { useFullscreen } from '@yss-ui/hooks';
import { Button } from 'ant-design-vue';

defineOptions({ name: 'FullscreenDemo4Coexist' });

const AButton = Button;

const containerRef = ref<HTMLElement>();
const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

/**
 * 使用原生 API 切换全屏
 * 验证 Hook 能正确追踪外部全屏状态变化
 */
const vanillaToggleFullscreen = () => {
  const isCurrentlyFullscreen = !!document.fullscreenElement;

  if (isCurrentlyFullscreen) {
    document.exitFullscreen();
  } else {
    containerRef.value?.requestFullscreen();
  }
};
</script>

<template>
  <div ref="containerRef" class="demo-container">
    <div class="status-text">
      {{ isFullscreen ? '全屏中' : '未全屏' }}
    </div>
    <div class="button-group">
      <a-button type="primary" class="mr-8" @click="toggleFullscreen"> Hook 切换全屏 </a-button>
      <a-button @click="vanillaToggleFullscreen"> 原生 API 切换全屏 </a-button>
    </div>
    <div class="tip-box">💡 提示：尝试使用两个按钮交替切换全屏，Hook 能正确同步状态</div>
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

.tip-box {
  margin-top: 16px;
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
}
</style>
