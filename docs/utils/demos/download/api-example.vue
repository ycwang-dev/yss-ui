<script setup lang="ts">
import { handleBlobResponse } from '@yss-ui/utils';
import { Alert, Button, Card, Divider, Space } from 'ant-design-vue';
import { ref } from 'vue';

const AButton = Button;
const ACard = Card;
const ASpace = Space;
const AAlert = Alert;
const ADivider = Divider;

const loading = ref(false);

// 示例1：下载文件并从响应头提取 UTF-8 编码的文件名
const downloadWithAutoFilename = async () => {
  loading.value = true;
  try {
    // 模拟 Blob 响应数据
    const mockBlob = new Blob(['这是导出的Excel内容示例数据'], { type: 'application/vnd.ms-excel' });
    const mockHeaders = {
      'content-disposition': "attachment; filename*=utf-8''%E6%95%B0%E6%8D%AE%E5%AF%BC%E5%87%BA.xlsx",
    };

    // 模拟从 API 获取的响应结构
    const { data, headers } = { data: mockBlob, headers: mockHeaders };

    // 使用 handleBlobResponse 自动解析文件名并下载
    // 内部会自动探测 filename* (UTF-8) 或常规 filename 格式
    handleBlobResponse(data, headers);
  } catch (error) {
    console.error('下载失败:', error);
  } finally {
    loading.value = false;
  }
};

// 示例2：处理常规（非UTF-8）编码的文件名
const downloadWithNormalFilename = async () => {
  loading.value = true;
  try {
    const mockBlob = new Blob(['报表数据内容'], { type: 'application/pdf' });
    const mockHeaders = {
      'content-disposition': 'attachment; filename="report.pdf"',
    };

    const { data, headers } = { data: mockBlob, headers: mockHeaders };

    // 第三个参数为 false 或不传，表示使用常规文件名解析
    handleBlobResponse(data, headers);
  } catch (error) {
    console.error('下载失败:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="demo-container" style="padding: 12px">
    <a-alert
      message="使用说明"
      description="演示 handleBlobResponse 如何处理 API 返回的 Blob 响应并下载文件（点击按钮体验真实下载效果）"
      type="info"
      show-icon
      style="margin-bottom: 16px"
    />

    <a-space direction="vertical" :size="16" style="width: 100%">
      <a-card title="示例 1：自动解析 UTF-8 编码的文件名" size="small">
        <template #extra>
          <a-button type="primary" :loading="loading" @click="downloadWithAutoFilename"> 下载文件 </a-button>
        </template>
        <p style="margin: 0; color: #666">
          适用于文件名包含中文等非 ASCII 字符的场景<br />
          <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px"> responseType: 'blob' </code>
        </p>
      </a-card>

      <a-card title="示例 2：常规文件名解析" size="small">
        <template #extra>
          <a-button type="primary" :loading="loading" @click="downloadWithNormalFilename"> 下载文件 </a-button>
        </template>
        <p style="margin: 0; color: #666">
          适用于纯英文文件名的场景<br />
          <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px"> responseType: 'blob' </code>
        </p>
      </a-card>
    </a-space>

    <a-divider style="margin: 24px 0" />

    <a-card title="📋 在项目中配合 axios 使用" size="small" style="border-color: #1890ff">
      <div style="color: #666">
        <p style="margin-bottom: 12px; font-weight: 500">1️⃣ 配置响应拦截器（mutator.ts）：</p>
        <pre
          style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 13px"
        ><code>import axios from 'axios';

const customInstance = axios.create({ baseURL: '/api' });

// 响应拦截器：判断是否为 Blob 响应
customInstance.interceptors.response.use(
  (response) => {
    const { data, headers } = response;
    const isBlob = data instanceof Blob;
    
    // 如果是 Blob，返回 { data, headers } 供业务层处理
    return isBlob ? { data, headers } : data;
  },
  (error) => Promise.reject(error)
);

export default customInstance;</code></pre>

        <p style="margin: 16px 0 12px; font-weight: 500">2️⃣ 业务代码调用：</p>
        <pre
          style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 13px"
        ><code>import { handleBlobResponse } from '@yss-ui/utils';
import customInstance from './mutator';

const downloadFile = async () => {
  const res = await customInstance({
    url: '/spv/ext/export',
    method: 'POST',
    responseType: 'blob', // ⚠️ 必须是顶层属性
    data: { pfIdList: ['123'] }
  });
  
  const { data, headers } = res || {};
  handleBlobResponse(data, headers);
};</code></pre>
      </div>
    </a-card>

    <a-card title="⚠️ 重要提醒" size="small" style="margin-top: 16px; border-color: #faad14">
      <ul style="margin: 0; padding-left: 20px; color: #666; line-height: 1.8">
        <li><code>responseType: 'blob'</code> <strong>必须设置在 axios 配置的顶层</strong>，不能放在 headers 里</li>
        <li>响应拦截器需要判断 <code>data instanceof Blob</code> 来区分文件响应和普通响应</li>
        <li>中文等非 ASCII 文件名现在支持<strong>自动识别</strong>，无需再传第三个参数</li>
      </ul>
    </a-card>
  </div>
</template>

<style scoped>
.demo-container :deep(.ant-card-body) {
  padding: 12px;
}

code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
}
</style>
