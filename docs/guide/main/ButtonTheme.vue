<template>
  <div class="custom-component">
    <YButton type="primary">主要按钮</YButton>
    <YButton type="primary" danger>危险按钮</YButton>
  </div>
</template>

<script setup>
import { YButton } from '@yss-ui/components';
</script>

<style scoped lang="less">
.custom-component {
  padding: var(--yss-spacing-md);
  background: var(--yss-color-neutral-1);
  display: flex;
  gap: 8px;
}
</style>
