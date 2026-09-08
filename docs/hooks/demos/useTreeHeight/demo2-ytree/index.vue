<script setup lang="ts">
import { ref } from 'vue';
import { Input as AInput } from 'ant-design-vue';
import { YTree } from '@yss-ui/components';
import { useTreeHeight } from '@yss-ui/hooks';
import { FolderOutlined, FolderOpenOutlined, FileOutlined } from '@ant-design/icons-vue';
import { treeData, getActions, fieldNames } from './constant.ts';

/**
 * 树区域引用
 * 使用 flex: 1 自动填充剩余空间，hook 监听这个区域的高度
 */
const treeAreaRef = ref<HTMLDivElement>();

/** 使用 useTreeHeight，直接监听树区域 */
const { treeHeight } = useTreeHeight(treeAreaRef, { minHeight: 150 });

/** 展开的节点 keys */
const expandedKeys = ref<string[]>(['root']);

/** 搜索关键字 */
const searchValue = ref('');

const onExpand = (keys: (string | number)[]) => {
  expandedKeys.value = keys.map(k => String(k));
};

const isLeaf = (node: any): boolean => !node.children?.length;
const isExpanded = (node: any): boolean => expandedKeys.value.includes(String(node.code));
</script>

<template>
  <div class="demo2-use-tree-height-container">
    <!-- 左侧面板：使用 flex 布局 -->
    <div class="left-panel">
      <!-- 头部：搜索框 -->
      <div class="header">
        <AInput v-model:value="searchValue" placeholder="搜索项目" size="small" allow-clear />
      </div>

      <!-- 树区域：flex: 1 自动填充，hook 直接监听这个区域 -->
      <div ref="treeAreaRef" class="tree-area">
        <YTree
          :tree-data="treeData"
          :get-node-actions="getActions"
          :expanded-keys="expandedKeys"
          :field-names="fieldNames"
          :height="treeHeight"
          :filterable="false"
          @expand="onExpand"
        >
          <template #node-prefix="{ node }">
            <FolderOpenOutlined v-if="!isLeaf(node) && isExpanded(node)" />
            <FolderOutlined v-else-if="!isLeaf(node)" />
            <FileOutlined v-else />
          </template>
        </YTree>
      </div>
    </div>

    <!-- 右侧信息 -->
    <div class="info-panel">
      <p>
        树区域高度: <strong>{{ treeHeight }}px</strong>
      </p>
      <p class="tip">
        使用 flex 布局：头部搜索框 + 树区域(flex:1)。
        <br />Hook 直接监听树区域，无需计算 offset。
      </p>
    </div>
  </div>
</template>

<style scoped lang="less">
@import url('./style.less');
</style>
