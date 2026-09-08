<template>
  <div style="width: 280px">
    <YTree :tree-data="resources" block-node>
      <template #node-title="{ node, text }">
        <span :style="{ color: node.color || 'inherit' }">{{ text }}</span>
      </template>
    </YTree>
  </div>
</template>
<script setup lang="ts">
import { YTree } from '@yss-ui/components';
const resources = [
  {
    key: 'all',
    title: '全部',
    color: 'var(--primary-color, #3371ff)',
    children: [
      {
        key: 'srv',
        title: '服务资源',
        color: '#597ef7',
        children: [
          { key: 'core', title: '核心应用' },
          { key: 'eureka', title: 'Eureka' },
        ],
      },
      {
        key: 'sys',
        title: '系统资源',
        color: '#9254de',
        children: [
          { key: 'db', title: '数据源' },
          { key: 'redis', title: 'Redis' },
          { key: 'tomcat', title: 'Tomcat', color: '#13c2c2' },
        ],
      },
      { key: 'biz', title: '业务资源', color: '#fa8c16' },
    ],
  },
];
</script>
