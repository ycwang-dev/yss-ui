<script setup lang="ts">
import { ref, computed } from 'vue';
import { getUrlData } from '@yss-ui/utils';
import { YCard } from '@yss-ui/components';
import { Input as AInput } from 'ant-design-vue';

const url1 = ref('https://example.com/api/v1/auth?redirect_uri=http://a.com?b=1&token=123');
const url2 = ref('id=123&base64=MTIzNDU2==&invalid=%1');

const query1 = computed(() => getUrlData(url1.value));
const query2 = computed(() => getUrlData(url2.value));
</script>

<template>
  <div class="demo-wrapper">
    <YCard title="场景一：包含重定向等携带复杂串联参数的链接" size="small" style="margin-bottom: 16px">
      <a-input v-model:value="url1" style="margin-bottom: 12px" />
      <div class="result-box">
        <div class="result-title">解析结果</div>
        <pre class="json-code">{{ JSON.stringify(query1, null, 2) }}</pre>
      </div>
    </YCard>

    <YCard title="场景二：包含等号组合与非法 decode 的乱码参数" size="small">
      <a-input v-model:value="url2" style="margin-bottom: 12px" />
      <div class="result-box">
        <div class="result-title">解析结果</div>
        <pre class="json-code">{{ JSON.stringify(query2, null, 2) }}</pre>
      </div>
    </YCard>
  </div>
</template>

<style scoped lang="less">
.demo-wrapper {
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
