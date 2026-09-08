<script setup lang="ts">
import { ref } from 'vue';
import { useTreeHeight } from '@yss-ui/hooks';
import { mockNodes } from './constant.ts';

/**
 * 树区域引用
 * 直接监听这个区域的高度，无需手动计算 offset
 */
const treeAreaRef = ref<HTMLDivElement>();

/** 使用 useTreeHeight hook */
const { treeHeight, recalculateHeight } = useTreeHeight(treeAreaRef);
</script>

<template>
  <div class="demo-use-tree-height-container">
    <div class="left-panel">
      <!-- 树区域：使用 flex: 1 自动填充剩余空间 -->
      <div ref="treeAreaRef" class="tree-area">
        <div class="mock-tree">
          <div v-for="(node, index) in mockNodes" :key="index" class="mock-node">
            {{ node }}
          </div>
        </div>
      </div>
    </div>
    <div class="info-panel">
      <p>
        树区域高度: <strong>{{ treeHeight }}px</strong>
      </p>
      <button class="btn" @click="recalculateHeight">手动重算</button>
      <p class="tip">Hook 直接监听树区域高度，自动响应尺寸变化</p>
    </div>
  </div>
</template>

<style scoped lang="less">
@import url('./style.less');
</style>
