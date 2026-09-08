<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { CSSProperties } from 'vue';
import type { YMonthCalendarAppearance } from '../types';

defineOptions({ name: 'YMonthCalendarContextMenu' });

const props = defineProps<{
  x: number;
  y: number;
  appearance: YMonthCalendarAppearance;
}>();
const emit = defineEmits<{
  close: [reason: 'outside' | 'escape' | 'scroll' | 'resize' | 'blur'];
}>();
const menuRef = ref<HTMLElement>();
const menuStyle = ref<CSSProperties>({});

/** 根据视口边界修正菜单坐标。 */
const updatePosition = async (): Promise<void> => {
  await nextTick();
  const rect = menuRef.value?.getBoundingClientRect();
  const gap = 8;
  const maxLeft = Math.max(gap, window.innerWidth - (rect?.width ?? 0) - gap);
  const maxTop = Math.max(gap, window.innerHeight - (rect?.height ?? 0) - gap);
  menuStyle.value = {
    left: `${Math.min(Math.max(props.x, gap), maxLeft)}px`,
    top: `${Math.min(Math.max(props.y, gap), maxTop)}px`,
  };
  const focusTarget = menuRef.value?.querySelector<HTMLElement>(
    '[autofocus], button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'
  );
  focusTarget?.focus({ preventScroll: true });
};

/** 点击菜单外部时关闭。 */
const handleDocumentPointerDown = (event: PointerEvent): void => {
  if (!menuRef.value?.contains(event.target as Node)) emit('close', 'outside');
};

/** Escape 关闭菜单。 */
const handleDocumentKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') emit('close', 'escape');
};

/** 窗口失焦时关闭菜单。 */
const handleWindowBlur = (): void => emit('close', 'blur');

/** 页面滚动时关闭菜单，避免菜单脱离触发日期。 */
const handleDocumentScroll = (): void => emit('close', 'scroll');

/** 视口尺寸变化时关闭菜单。 */
const handleWindowResize = (): void => emit('close', 'resize');

watch(() => [props.x, props.y], updatePosition);
onMounted(() => {
  updatePosition();
  document.addEventListener('pointerdown', handleDocumentPointerDown);
  document.addEventListener('keydown', handleDocumentKeydown);
  document.addEventListener('scroll', handleDocumentScroll, true);
  window.addEventListener('blur', handleWindowBlur);
  window.addEventListener('resize', handleWindowResize);
});
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown);
  document.removeEventListener('keydown', handleDocumentKeydown);
  document.removeEventListener('scroll', handleDocumentScroll, true);
  window.removeEventListener('blur', handleWindowBlur);
  window.removeEventListener('resize', handleWindowResize);
});
</script>

<template>
  <Teleport to="body">
    <div
      ref="menuRef"
      :class="['y-month-calendar__context-menu', `y-month-calendar__context-menu--${appearance}`]"
      :style="menuStyle"
      role="menu"
      @click.stop
      @contextmenu.prevent.stop
    >
      <slot />
    </div>
  </Teleport>
</template>

<style scoped lang="less">
@import url('../cell-style.less');
</style>
