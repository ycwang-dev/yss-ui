<script setup lang="ts">
import { ref, computed } from 'vue';
import { getUrlData } from '@yss-ui/utils';
import { Input as AInput, Select as ASelect } from 'ant-design-vue';

const inputUrl = ref('http://localhost:3000/#/dashboard?id=1106&version=1.00.00&_ex=111x&timestamp=17123');
const excludeKeys = ref(['_ex', 'timestamp']);

// 动态计算解析结果
const queryData = computed(() => {
  return getUrlData(inputUrl.value, excludeKeys.value);
});
</script>

<template>
  <div class="demo-wrapper">
    <div style="margin-bottom: 16px">
      <div style="margin-bottom: 8px; font-weight: bold; color: #333">目标 URL 链接：</div>
      <a-input v-model:value="inputUrl" allow-clear />
    </div>

    <div style="margin-bottom: 16px">
      <div style="margin-bottom: 8px; font-weight: bold; color: #333">过滤屏蔽的 Key（输入后回车添加）：</div>
      <a-select
        v-model:value="excludeKeys"
        mode="tags"
        style="width: 100%"
        placeholder="输入需要排除的参数 key"
        :token-separators="[',']"
      ></a-select>
    </div>

    <div class="result-box">
      <div class="result-title" style="color: #1890ff">过滤后的解析结果</div>
      <pre class="json-code">{{ JSON.stringify(queryData, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped lang="less">
.demo-wrapper {
  .result-box {
    margin-top: 16px;
    padding: 12px;
    background: #f0f7ff;
    border: 1px solid #bae7ff;
    border-radius: 4px;

    .result-title {
      font-weight: bold;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .json-code {
      margin: 0;
      padding: 8px;
      background: #fff;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      color: #333;
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 12px;
      overflow-x: auto;
    }
  }
}
</style>
