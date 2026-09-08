<script setup lang="ts">
import { YTable } from '@yss-ui/components';
import { useMergeCells } from './hooks/useMergeCells';

defineOptions({ name: 'DemoTableMergeCells' });

const { columns, tableData, spanMethod } = useMergeCells();
</script>

<template>
  <div class="demo-container">
    <YTable :data="tableData" :columns="columns" :span-method="spanMethod" :border="true" :show-overflow="'tooltip'" />
  </div>
</template>

<style scoped lang="less">
@import url('./style.less');
</style>
