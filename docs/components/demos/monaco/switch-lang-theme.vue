<script setup lang="ts">
import { YMonaco } from '@yss-ui/components';
import { Select } from 'ant-design-vue';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const refEditor = ref<InstanceType<typeof YMonaco> | null>(null);
type DemoLanguage =
  | 'javascript'
  | 'typescript'
  | 'json'
  | 'sql'
  | 'python'
  | 'java'
  | 'go'
  | 'html'
  | 'css'
  | 'yaml'
  | 'markdown'
  | 'shell'
  | 'log'
  | 'nginx'
  | 'ruby'
  | 'rust'
  | 'php';

const lang = ref<DemoLanguage>('json');
const getThemeBySiteMode = (): 'vs' | 'vs-dark' => {
  if (typeof document === 'undefined') return 'vs';
  return document.documentElement.getAttribute('data-prefers-color') === 'dark' ? 'vs-dark' : 'vs';
};
const theme = ref<'vs' | 'vs-dark'>(getThemeBySiteMode());
const code = ref<string>(`{\n  "name": "yss-ui",\n  "version": "1.0.0"\n}\n`);

/** 不同语言的示例内容 */
const codeSamples: Partial<Record<DemoLanguage, string>> = {
  json: `{\n  "name": "yss-ui",\n  "version": "1.0.0"\n}\n`,
  log: `2026-05-11 09:47:59 INFO  [build] 开始构建\n2026-05-11 09:48:05 WARN  [build] 发现缓存缺失\n2026-05-11 09:48:08 ERROR [error] 构建产物执行失败，退出码 1\nerror during build:\n[vite]: Rollup failed to resolve import "lodash"\n`,
  nginx: `server { listen 80; server_name example.com; location / { proxy_pass http://app; proxy_set_header Host $host; } }\n`,
};

const langOptions = [
  { label: 'Javascript', value: 'javascript' },
  { label: 'Typescript', value: 'typescript' },
  { label: 'JSON', value: 'json' },
  { label: 'SQL', value: 'sql' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'Go', value: 'go' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'YAML', value: 'yaml' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'Shell', value: 'shell' },
  { label: 'Log', value: 'log' },
  { label: 'Nginx', value: 'nginx' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'Rust', value: 'rust' },
  { label: 'PHP', value: 'php' },
];

const themeOptions = [
  { label: 'Vs', value: 'vs' },
  { label: 'Vs-dark', value: 'vs-dark' },
];

watch(theme, newVal => {
  refEditor.value?.setTheme(newVal);
});

watch(lang, newVal => {
  const sample = codeSamples[newVal];
  if (sample) code.value = sample;
});

let stopObserveTheme: (() => void) | null = null;
onMounted(() => {
  const root = document.documentElement;
  if (!root || typeof MutationObserver === 'undefined') return;
  const observer = new MutationObserver(() => {
    const nextTheme = getThemeBySiteMode();
    if (nextTheme !== theme.value) theme.value = nextTheme;
  });
  observer.observe(root, { attributes: true, attributeFilter: ['data-prefers-color'] });
  stopObserveTheme = () => observer.disconnect();
});

onBeforeUnmount(() => {
  stopObserveTheme?.();
  stopObserveTheme = null;
});
</script>

<template>
  <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px">
    <Select v-model:value="lang" :options="langOptions" style="width: 120px" />
    <Select v-model:value="theme" :options="themeOptions" style="width: 120px" />
  </div>
  <YMonaco ref="refEditor" v-model="code" :language="lang" :theme="theme" :height="260" />
</template>

<style scoped></style>
