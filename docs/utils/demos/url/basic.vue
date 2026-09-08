<script setup lang="ts">
import { ref, computed } from 'vue';
import { getUrlData } from '@yss-ui/utils';

// 测试 URL，默认带几个参数
const inputUrl = ref('https://www.example.com/page?name=admin&role=manager&status=1#hash?id=123');

// 监听 inputUrl 变化并实时解析参数
const queryData = computed(() => getUrlData(inputUrl.value));
</script>

<template>
  <div class="demo-wrapper">
    <div class="input-box">
      <div class="label">测试 URL</div>
      <input v-model="inputUrl" class="url-input" type="text" placeholder="请输入带有参数的 URL" />
    </div>
    <div class="result-box">
      <div class="result-title">解析结果</div>
      <pre class="json-code">{{ JSON.stringify(queryData, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped lang="less">
.demo-wrapper {
  .input-box {
    margin-bottom: 16px;

    .label {
      font-weight: bold;
      margin-bottom: 8px;
      color: #1a1a1a;
      font-size: 14px;
    }

    .url-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      font-size: 14px;
      color: #333;
      outline: none;
      transition: all 0.3s;

      &:focus {
        border-color: #1677ff;
        box-shadow: 0 0 0 2px rgb(22 119 255 / 20%);
      }
    }
  }

  .result-box {
    padding: 12px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;

    .result-title {
      font-weight: bold;
      margin-bottom: 8px;
      color: #1a1a1a;
      font-size: 14px;
    }

    .json-code {
      margin: 0;
      padding: 8px;
      background: #fff;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      color: #474747;
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 12px;
      overflow-x: auto;
    }
  }
}
</style>
