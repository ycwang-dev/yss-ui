<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ensureMonacoCss } from './utils/loadMonacoCss';
import { useDiffEditor } from './hooks/useDiffEditor';
import { useToolbar } from './hooks/useToolbar';
import { CheckOutlined, CompressOutlined, CopyOutlined, DownloadOutlined, ExpandOutlined } from '@ant-design/icons-vue';
import { Tooltip as ATooltip } from 'ant-design-vue';
import type { YMonacoDiffExpose, YMonacoDiffProps, YMonacoToolbarTooltipTexts } from './types';
import { useLocale } from '../locale/useLocale';

defineOptions({ name: 'YMonacoDiff' });

/**
 * YMonacoDiff 差异对比编辑器
 */
const props = withDefaults(defineProps<YMonacoDiffProps>(), {
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

const emit = defineEmits(['update:value', 'change']);

const containerRef = ref<HTMLDivElement | null>(null);
const wrapperRef = ref<HTMLDivElement | null>(null);

const rootStyle = computed(() => {
  const normalize = (v: number | string | undefined) => {
    if (typeof v === 'number') return `${v}px`;
    if (typeof v === 'string') {
      // 兼容传入 "420" 这类纯数字字符串
      return /^\d+(?:\.\d+)?$/.test(v) ? `${v}px` : v;
    }
    return '100%';
  };
  return { width: normalize(props.width), height: normalize(props.height) } as Record<string, string>;
});

const {
  create,
  dispose,
  getInstance,
  setOriginal,
  setValue,
  setLanguage,
  setTheme,
  layout,
  toggleFullscreen,
  isFullscreen,
} = useDiffEditor(
  containerRef,
  wrapperRef,
  props as YMonacoDiffProps,
  emit as unknown as (e: string, ...args: any[]) => void
);

const { handleCopy, handleDownload, showBtn, isCopied } = useToolbar({
  props: props as YMonacoDiffProps,
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
  isCopied.value
    ? toolbarTooltipConfig.value.texts.copied
    : toolbarTooltipConfig.value.texts.diffCopy || toolbarTooltipConfig.value.texts.copy
);
const fullscreenLabel = computed(() =>
  isFullscreen.value
    ? toolbarTooltipConfig.value.texts.exitFullscreen
    : toolbarTooltipConfig.value.texts.enterFullscreen
);
const downloadLabel = computed(
  () => toolbarTooltipConfig.value.texts.diffDownload || toolbarTooltipConfig.value.texts.download
);

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
  await ensureMonacoCss();
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

defineExpose({
  getInstance,
  setOriginal,
  setValue,
  setLanguage,
  setTheme,
  layout,
  toggleFullscreen,
} as YMonacoDiffExpose);

watch(
  () => props.value,
  v => setValue(v)
);
watch(
  () => props.original,
  v => setOriginal(v)
);
watch(
  () => props.language,
  v => setLanguage(v)
);
watch(
  () => props.theme,
  () => setTheme(props.theme || siteTheme.value)
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
      :class="{
        'yss-monaco-border': props.showBorder,
      }"
      :data-theme="resolvedTheme"
    />
  </div>
</template>

<style lang="less">
@import url('./index.less');

/* 全局样式（限定在容器内），解决 Monaco 动态元素无法匹配 Scoped CSS 的问题 */
.yss-monaco-container {
  .yss-diff-line-insert {
    background-color: #e6ffec !important;
  }

  .yss-diff-line-delete {
    background-color: #ffebe9 !important;
  }

  /* 深色模式适配：直接根据 Monaco 自身添加的类名来判断，比 data-theme 更可靠 */
  .monaco-editor.vs-dark,
  .monaco-editor.hc-black {
    .yss-diff-line-insert,
    .yss-diff-gutter-insert {
      background-color: rgb(46 160 67 / 15%) !important;
    }

    .yss-diff-line-delete,
    .yss-diff-gutter-delete {
      background-color: rgb(218 54 51 / 15%) !important;
    }
  }

  /* Gutter (行号区) 样式 */
  .yss-diff-gutter-insert {
    background-color: #e6ffec !important;
  }

  .yss-diff-gutter-delete {
    background-color: #ffebe9 !important;
  }
}
</style>
