<template>
  <y-button type="primary" @click="handleClick"> 点击按钮 </y-button>
</template>

<script setup>
import { YButton } from '@yss-ui/components';

const handleClick = () => {
  console.log('按钮被点击');
};
</script>
