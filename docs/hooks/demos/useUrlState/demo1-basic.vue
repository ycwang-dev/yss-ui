<script setup lang="ts">
import { computed } from 'vue';
import { Space, Button, Input } from 'ant-design-vue';
import { useUrlState } from '@yss-ui/hooks';

defineOptions({ name: 'UseUrlStateBasicDemo' });

const ASpace = Space;
const AButton = Button;
const AInput = Input;

const { state, setState, clearKeys, clearState } = useUrlState();

const count = computed(() => Number(state.value.count || 0));
const keyword = computed(() => state.value.keyword || '');

const handleAdd = async () => {
  await setState({ count: count.value + 1 });
};

const handleKeywordChange = async (value: string) => {
  await setState({ keyword: value });
};

const handleClearKeyword = async () => {
  await clearKeys(['keyword']);
};

const handleClearAll = async () => {
  await clearState();
};
</script>

<template>
  <div class="demo-container">
    <a-space direction="vertical" :size="12">
      <div>当前 query 状态：{{ state }}</div>
      <a-space>
        <a-button type="primary" @click="handleAdd">count +1</a-button>
        <a-button @click="handleClearAll">清空全部 query</a-button>
      </a-space>
      <a-space>
        <a-input
          :value="keyword"
          style="width: 240px"
          placeholder="输入 keyword 并同步到 URL"
          @update:value="handleKeywordChange"
        />
        <a-button @click="handleClearKeyword">清理 keyword</a-button>
      </a-space>
    </a-space>
  </div>
</template>

<style scoped lang="less">
.demo-container {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}
</style>
