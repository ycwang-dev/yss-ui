<script setup lang="ts">
import { VerticalAlignTopOutlined, VerticalAlignMiddleOutlined } from '@ant-design/icons-vue';
import { useLocale } from '../locale/useLocale';

defineOptions({ name: 'YVerticalQuickActions' });

defineProps<{
  collapsible: boolean;
  showVerticalQuickActions: boolean;
  showHideTopButton: boolean;
  showResetButton: boolean;
  showHideBottomButton: boolean;
  topOffset: number;
}>();

const emits = defineEmits<{
  (e: 'hide-top'): void;
  (e: 'reset'): void;
  (e: 'hide-bottom'): void;
}>();

const { t } = useLocale('splitPane');
</script>

<template>
  <div
    v-if="collapsible && showVerticalQuickActions"
    class="y-split-pane__quick-actions"
    :style="{ top: `${topOffset}px` }"
  >
    <button
      v-if="showHideTopButton"
      class="y-split-pane__quick-btn"
      type="button"
      :aria-label="t('hideTop')"
      @click.stop="emits('hide-top')"
      @mousedown.stop
      @touchstart.stop
    >
      <VerticalAlignTopOutlined />
    </button>
    <button
      v-if="showResetButton"
      class="y-split-pane__quick-btn"
      type="button"
      :aria-label="t('resetHeight')"
      @click.stop="emits('reset')"
      @mousedown.stop
      @touchstart.stop
    >
      <VerticalAlignMiddleOutlined />
    </button>
    <button
      v-if="showHideBottomButton"
      class="y-split-pane__quick-btn"
      type="button"
      :aria-label="t('hideBottom')"
      @click.stop="emits('hide-bottom')"
      @mousedown.stop
      @touchstart.stop
    >
      <VerticalAlignTopOutlined class="y-split-pane__quick-btn--bottom" />
    </button>
  </div>
</template>
