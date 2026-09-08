<script setup lang="ts">
import { useFullscreen } from '@yss-ui/hooks';
import { Button } from 'ant-design-vue';

defineOptions({ name: 'FullscreenDemo2Image' });

const AButton = Button;

/**
 * 使用函数形式传入目标元素
 */
const { enterFullscreen } = useFullscreen(() => document.getElementById('fullscreen-img'));
</script>

<template>
  <div class="demo-container">
    <div class="image-wrapper">
      <img
        id="fullscreen-img"
        src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop"
        class="demo-image"
        alt="Vue Hooks 示例图"
      />
    </div>
    <a-button type="primary" @click="enterFullscreen"> 图片全屏 </a-button>
  </div>
</template>

<style scoped lang="less">
.demo-container {
  background: #f5f5f5;
  padding: 24px;
  border-radius: 8px;
}

.image-wrapper {
  margin-bottom: 16px;
}

.demo-image {
  width: 320px;
  border-radius: 4px;
}
</style>
