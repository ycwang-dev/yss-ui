<script setup lang="ts">
import { ref, computed, watch, inject, shallowRef } from 'vue';
import type { Ref } from 'vue';
import { useSheetInstance } from './hooks/useSheetInstance';
import { useSheetData } from './hooks/useSheetData';
import { useSheetLoading } from './hooks/useSheetLoading';
import { DEFAULT_WORKBOOK_DATA } from './constant';
import type { IWorkbookData, YSheetProps, YSheetEmits, YSheetExpose } from './constant';
import { useLocale } from '../locale/useLocale';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';
import '@univerjs/preset-sheets-filter/lib/index.css';
import '@univerjs/preset-sheets-data-validation/lib/index.css';

defineOptions({ name: 'YSheet' });

/**
 * Props 定义
 */
const { t, localeName } = useLocale('sheet');

const props = withDefaults(defineProps<YSheetProps>(), {
  height: '100%',
  locale: undefined,
  darkMode: undefined,
  readonly: false,
  extraPresets: () => [],
  extraPlugins: () => [],
  extraLocales: () => ({}),
});

/**
 * Emits 定义
 */
const emit = defineEmits<YSheetEmits>();

/**
 * 容器 Ref
 */
const containerRef = ref<HTMLElement | null>(null);

/**
 * 暗色模式：优先使用 props.darkMode，否则从 renderer 注入的全局暗色状态中读取
 */
const injectedDark = inject<Ref<boolean>>('__dumi_dark__', ref(false));
const effectiveDarkMode = computed(() => props.darkMode ?? injectedDark.value);

/**
 * 记录 save() 刚刚通过 v-model 回写的数据引用，避免 watcher 立即 reload 同一份快照。
 */
const lastEmittedModelValue = shallowRef<IWorkbookData | null>(null);

/**
 * 实例管理
 */
const { univerAPI, initializing, initError, dispose } = useSheetInstance({
  container: containerRef,
  locale: computed(() => props.locale ?? localeName.value),
  darkMode: effectiveDarkMode,
  extraPresets: computed(() => props.extraPresets),
  extraPlugins: computed(() => props.extraPlugins),
  extraLocales: computed(() => props.extraLocales),
  config: computed(() => props.config),
});

/**
 * 数据管理
 */
const { loadWorkbook, saveWorkbook, reload } = useSheetData({
  univerAPI,
  emit,
  beforeEmitModelValue: data => {
    lastEmittedModelValue.value = data;
  },
});

/**
 * 计算容器高度
 */
const containerHeight = computed(() => {
  if (typeof props.height === 'number') {
    return props.height > 0 ? `${props.height}px` : '100%';
  }
  return props.height?.trim() || '100%';
});

const resolvedDefaultData = computed<IWorkbookData>(() => ({
  ...(DEFAULT_WORKBOOK_DATA as IWorkbookData),
  name: t('newWorkbook'),
}));

/**
 * 加载态管理
 */
const { currentError, showLoading, renderWorkbook, reloadWorkbook } = useSheetLoading({
  univerAPI,
  initializing,
  initError,
  defaultData: resolvedDefaultData.value,
  loadWorkbook,
  reloadWorkbookData: reload,
});

watch(
  univerAPI,
  api => {
    if (api) {
      void renderWorkbook(props.modelValue || resolvedDefaultData.value);
    }
  },
  { immediate: true }
);

/**
 * 透出初始化异常
 */
watch(initError, error => {
  if (error) {
    emit('error', error);
  }
});

/**
 * 监听 modelValue 变化
 */
watch(
  () => props.modelValue,
  newData => {
    if (!univerAPI.value) {
      return;
    }
    if (newData && newData === lastEmittedModelValue.value) {
      lastEmittedModelValue.value = null;
      return;
    }
    void reloadWorkbook(newData ?? (DEFAULT_WORKBOOK_DATA as IWorkbookData));
  }
);

/**
 * 只读模式下允许复制、撤销等组合键，但拦截会修改单元格的键盘输入。
 *
 * @param event 键盘事件
 * @returns 是否为编辑键
 */
const isReadonlyEditKey = (event: KeyboardEvent) => {
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return false;
  }
  return event.key.length === 1 || ['Backspace', 'Delete', 'Enter', 'F2'].includes(event.key);
};

/**
 * 阻止只读模式下进入或执行编辑。
 *
 * @param event 原生事件
 */
const preventReadonlyEdit = (event: Event) => {
  if (!props.readonly) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
};

/**
 * 只读键盘事件处理。
 *
 * @param event 键盘事件
 */
const handleReadonlyKeydown = (event: KeyboardEvent) => {
  if (isReadonlyEditKey(event)) {
    preventReadonlyEdit(event);
  }
};

/**
 * 暴露方法给父组件
 */
defineExpose<YSheetExpose>({
  getUniverAPI: () => univerAPI.value,
  getWorkbook: () => univerAPI.value?.getActiveWorkbook(),
  save: saveWorkbook,
  reload: data => {
    void reloadWorkbook(data ?? (DEFAULT_WORKBOOK_DATA as IWorkbookData));
  },
  dispose,
});
</script>

<template>
  <div
    class="y-sheet-container"
    :aria-busy="showLoading"
    :aria-readonly="readonly"
    :style="{ height: containerHeight }"
    @keydown.capture="handleReadonlyKeydown"
    @beforeinput.capture="preventReadonlyEdit"
    @paste.capture="preventReadonlyEdit"
    @drop.capture="preventReadonlyEdit"
    @dblclick.capture="preventReadonlyEdit"
    @contextmenu.capture="preventReadonlyEdit"
  >
    <div ref="containerRef" class="y-sheet-canvas" />
    <div v-if="showLoading" class="y-sheet-loading" aria-live="polite">
      <span class="y-sheet-loading__spinner" />
      <span class="y-sheet-loading__text">{{ t('loading') }}</span>
    </div>
    <div v-else-if="currentError" class="y-sheet-error" role="alert">
      <span class="y-sheet-error__title">{{ t('loadFailed') }}</span>
      <span class="y-sheet-error__message">{{ currentError.message }}</span>
    </div>
  </div>
</template>

<style scoped lang="less">
@import url('./style.less');
</style>
