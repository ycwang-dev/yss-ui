<script setup lang="ts">
import { ref } from 'vue';
import { Select as ASelect, Input as AInput } from 'ant-design-vue';
import { YTree, YButton } from '@yss-ui/components';
import { useTreeHeight, YTREE_SEARCH_HEIGHT } from '@yss-ui/hooks';
import { treeData, dataSourceOptions, databaseOptions } from './constant.ts';

/**
 * 树区域引用
 * 头部和底部都有元素，树区域使用 flex: 1 自动填充中间空间
 */
const treeAreaRef = ref<HTMLDivElement>();

/**
 * 使用 useTreeHeight，直接监听树区域高度
 * 因为 YTree 启用 filterable（默认搜索框），需要传入 extraOffset
 */
const { treeHeight } = useTreeHeight(treeAreaRef, {
  minHeight: 100,
  extraOffset: YTREE_SEARCH_HEIGHT, // YTree 内部搜索框高度
});

/** 下拉框选中值 */
const dataSource = ref('mysql-test');
const database = ref('yss_data');
const searchValue = ref('');
</script>

<template>
  <div class="demo3-use-tree-height-container">
    <!-- 左侧面板：头部 + 树区域 + 底部 -->
    <div class="left-panel">
      <!-- 头部区域 -->
      <div class="header">
        <div class="selects-row">
          <ASelect
            v-model:value="dataSource"
            :options="dataSourceOptions"
            placeholder="选择数据源"
            size="small"
            class="select-item"
          />
          <ASelect
            v-model:value="database"
            :options="databaseOptions"
            placeholder="选择数据库"
            size="small"
            class="select-item"
          />
        </div>
        <AInput v-model:value="searchValue" placeholder="搜索表名" size="small" allow-clear />
      </div>

      <!-- 树区域：flex: 1 自动填充，YTree 启用默认搜索框 -->
      <div ref="treeAreaRef" class="tree-area">
        <YTree :tree-data="treeData" :height="treeHeight" default-expand-all />
      </div>

      <!-- 底部区域 -->
      <div class="footer">
        <YButton size="small">新建目录</YButton>
        <YButton size="small" type="primary">刷新</YButton>
      </div>
    </div>

    <!-- 右侧信息 -->
    <div class="info-panel">
      <p>
        树区域高度: <strong>{{ treeHeight + YTREE_SEARCH_HEIGHT }}px</strong>
      </p>
      <p>
        YTree 搜索框: <span class="warning">-{{ YTREE_SEARCH_HEIGHT }}px</span>
      </p>
      <p>
        树可用高度: <strong class="primary">{{ treeHeight }}px</strong>
      </p>
      <p class="tip">YTree 启用 filterable 时，使用 <code>extraOffset: YTREE_SEARCH_HEIGHT</code> 扣除搜索框高度。</p>
    </div>
  </div>
</template>

<style scoped lang="less">
@import url('./style.less');
</style>
