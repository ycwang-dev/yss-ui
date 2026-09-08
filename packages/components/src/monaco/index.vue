<script setup lang="ts">
// Monaco Editor 样式由主项目统一导入，避免重复导入冲突
import 'monaco-editor/min/vs/editor/editor.main.css';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
// 使用相对导入，确保 ts 能解析本地类型文件
import { useMonaco } from './hooks/useMonaco';
import { useToolbar } from './hooks/useToolbar';
import { CheckOutlined, CompressOutlined, CopyOutlined, DownloadOutlined, ExpandOutlined } from '@ant-design/icons-vue';
import { Tooltip as ATooltip } from 'ant-design-vue';
import type { SqlSchema, YMonacoExpose, YMonacoProps, YMonacoToolbarTooltipTexts } from './type.ts';
import { useLocale } from '../locale/useLocale';

defineOptions({ name: 'YMonaco' });

/**
 * YMonaco 代码编辑器组件（基于 monaco-editor ESM）
 * - 按需动态加载 Monaco 与语言（减小首包体积）
 * - 支持只读置灰、自动布局、主题/语言切换
 * - 支持“应用内全屏”（非浏览器 Fullscreen API）
 * - 暴露编辑器实例与常用方法
 */

/** 组件 Props */
const props = withDefaults(defineProps<YMonacoProps>(), {
  modelValue: '',
  language: 'sql',
  height: 300,
  width: '100%',
  options: () => ({}),
  readonly: false,
  autoLayout: true,
  showBorder: true,
  formatOnMount: true,
  formatLanguages: () => ['sql'],
  nls: false,
  fullscreenZIndex: 10000,
  showToolbar: true,
  toolbarTooltip: () => ({
    placement: 'top',
    mouseEnterDelay: 0.2,
    mouseLeaveDelay: 0.05,
  }),
  fullscreenTransition: () => ({
    duration: 220,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  }),
});

/** 组件 Emits */
const emit = defineEmits(['update:modelValue', 'change', 'blur', 'selectedText', 'run', 'scroll-end', 'line-exceed']);

const containerRef = ref<HTMLDivElement | null>(null);
const wrapperRef = ref<HTMLDivElement | null>(null);
const rootStyle = computed(() => {
  const normalize = (v: number | string) => (typeof v === 'number' ? `${v}px` : v);
  return {
    width: normalize(props.width),
    height: normalize(props.height),
  } as Record<string, string>;
});

const {
  create,
  dispose,
  getInstance,
  insertText,
  insertTextAtPosition,
  setLanguage,
  setTheme,
  setValue,
  toggleReadonly,
  toggleFullscreen,
  layout,
  updateSqlSchema,
  appendContent,
  clearContent,
  scrollToBottom,
  getLineCount,
  isFullscreen,
} = useMonaco(
  containerRef,
  wrapperRef,
  props as YMonacoProps,
  emit as unknown as (evt: string, ...args: any[]) => void
);

const { handleCopy, handleDownload, showBtn, isCopied } = useToolbar({
  props: props as YMonacoProps,
  getEditor: getInstance,
  toggleFullscreen,
  isFullscreen: isFullscreen.value,
});

const resolveSiteMonacoTheme = (): 'vs' | 'vs-dark' => {
  if (typeof document === 'undefined') return 'vs';
  return document.documentElement.getAttribute('data-prefers-color') === 'dark' ? 'vs-dark' : 'vs';
};

const siteTheme = ref<'vs' | 'vs-dark'>(resolveSiteMonacoTheme());
const resolvedTheme = computed(() => props.theme || siteTheme.value);
let siteThemeObserver: MutationObserver | null = null;

const { t } = useLocale('monaco');

const resolvedDefaultTooltipTexts = computed<YMonacoToolbarTooltipTexts>(() => ({
  copy: t('copy'),
  copied: t('copied'),
  enterFullscreen: t('enterFullscreen'),
  exitFullscreen: t('exitFullscreen'),
  download: t('download'),
  diffCopy: t('diffCopy'),
  diffDownload: t('diffDownload'),
}));

const toolbarTooltipConfig = computed(() => {
  const raw = props.toolbarTooltip;
  const cfg = raw && typeof raw === 'object' ? raw : {};
  return {
    enabled: raw !== false,
    placement: cfg.placement ?? 'top',
    mouseEnterDelay: cfg.mouseEnterDelay ?? 0.2,
    mouseLeaveDelay: cfg.mouseLeaveDelay ?? 0.05,
    texts: {
      ...resolvedDefaultTooltipTexts.value,
      ...(cfg.texts ?? {}),
    },
  };
});

const toolbarTooltipProps = computed<Record<string, any>>(() => ({
  placement: toolbarTooltipConfig.value.placement,
  mouseEnterDelay: toolbarTooltipConfig.value.mouseEnterDelay,
  mouseLeaveDelay: toolbarTooltipConfig.value.mouseLeaveDelay,
}));

const copyLabel = computed(() =>
  isCopied.value ? toolbarTooltipConfig.value.texts.copied : toolbarTooltipConfig.value.texts.copy
);
const fullscreenLabel = computed(() =>
  isFullscreen.value
    ? toolbarTooltipConfig.value.texts.exitFullscreen
    : toolbarTooltipConfig.value.texts.enterFullscreen
);
const downloadLabel = computed(() => toolbarTooltipConfig.value.texts.download);

const tooltipTitle = (text: string) => (toolbarTooltipConfig.value.enabled ? text : null);

onMounted(async () => {
  if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
    siteThemeObserver = new MutationObserver(() => {
      const next = resolveSiteMonacoTheme();
      if (next === siteTheme.value) return;
      siteTheme.value = next;
      if (!props.theme) {
        setTheme(next);
      }
    });
    siteThemeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-prefers-color'],
    });
  }
  await create();
  if (!props.theme) {
    setTheme(siteTheme.value);
  }
});

onBeforeUnmount(() => {
  siteThemeObserver?.disconnect();
  siteThemeObserver = null;
  dispose();
});

/** 暴露方法 */
defineExpose({
  getInstance,
  setValue,
  insertText,
  insertTextAtPosition,
  setLanguage,
  setTheme,
  toggleReadonly,
  toggleFullscreen,
  layout,
  appendContent,
  clearContent,
  scrollToBottom,
  getLineCount,
} as YMonacoExpose);

// 同步外部 v-model 到内部（避免父组件批量更新场景下不同步）
watch(
  () => props.modelValue,
  val => {
    setValue(val);
  }
);

// SQL 模式变化（用于表/字段提示）
watch(
  () => props.sqlSchema,
  (schema: SqlSchema | null | undefined) => {
    try {
      (updateSqlSchema as any)?.(schema ?? null);
    } catch {}
  },
  { deep: true }
);

// 语言变更时，切换模型以触发语法高亮更新
watch(
  () => props.language,
  lang => {
    setLanguage(lang);
  }
);

// 主题变更时，应用主题
watch(
  () => props.theme,
  theme => {
    setTheme(theme || siteTheme.value);
  }
);

// 只读状态变更时，同步到编辑器
watch(
  () => props.readonly,
  ro => {
    toggleReadonly(ro);
  }
);
</script>

<template>
  <div ref="wrapperRef" class="yss-monaco-wrapper" :style="isFullscreen ? undefined : rootStyle">
    <!-- 悬浮工具栏 -->
    <div v-if="props.showToolbar" class="yss-monaco-toolbar">
      <slot name="toolbar" :editor="getInstance()" :fullscreen="isFullscreen" :toggle-fullscreen="toggleFullscreen">
        <slot
          name="toolbar-prefix"
          :editor="getInstance()"
          :fullscreen="isFullscreen"
          :toggle-fullscreen="toggleFullscreen"
        />
        <ATooltip v-if="showBtn.copy" v-bind="toolbarTooltipProps" :title="tooltipTitle(copyLabel)">
          <button type="button" class="yss-monaco-toolbar-btn" :aria-label="copyLabel" @click.stop="handleCopy">
            <component :is="isCopied ? CheckOutlined : CopyOutlined" :style="{ color: isCopied ? '#52c41a' : '' }" />
          </button>
        </ATooltip>
        <ATooltip v-if="showBtn.fullscreen" v-bind="toolbarTooltipProps" :title="tooltipTitle(fullscreenLabel)">
          <button
            type="button"
            class="yss-monaco-toolbar-btn"
            :aria-label="fullscreenLabel"
            @click.stop="toggleFullscreen"
          >
            <component :is="isFullscreen ? CompressOutlined : ExpandOutlined" />
          </button>
        </ATooltip>
        <ATooltip v-if="showBtn.download" v-bind="toolbarTooltipProps" :title="tooltipTitle(downloadLabel)">
          <button type="button" class="yss-monaco-toolbar-btn" :aria-label="downloadLabel" @click.stop="handleDownload">
            <DownloadOutlined />
          </button>
        </ATooltip>
        <slot
          name="toolbar-suffix"
          :editor="getInstance()"
          :fullscreen="isFullscreen"
          :toggle-fullscreen="toggleFullscreen"
        />
      </slot>
    </div>

    <div
      ref="containerRef"
      class="yss-monaco-container"
      :class="{ 'yss-monaco-border': props.showBorder }"
      :data-theme="resolvedTheme"
    ></div>
  </div>
  <!-- 全屏时通过类名控制固定定位与尺寸，不使用浏览器 Fullscreen API -->
</template>

<style scoped lang="less">
@import url('./index.less');
</style>
