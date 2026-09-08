<template>
  <AButton
    v-if="shouldRender"
    v-bind="passThroughProps"
    :class="buttonClass"
    :disabled="computedDisabled"
    @click="handleClick"
  >
    <template #icon>
      <slot name="icon" />
    </template>
    <slot>{{ innerText }}</slot>
  </AButton>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { Button as AButton } from 'ant-design-vue';
import type { ButtonProps } from './types';
import { hasAuth, getBtnInfo } from '@yss-ui/utils';

/**
 * YSS 按钮组件
 * @description 基于 Ant Design Vue Button 封装的企业级按钮组件
 */

/**
 * @description 组件 Props
 */
const props = withDefaults(defineProps<ButtonProps>(), {
  /** @default 'default' */
  type: 'default',
  /** @default 'middle' */
  size: 'middle',
  /** @default 'primary' */
  theme: 'primary',
  /** @default 'hide' */
  fallback: 'hide',
  modifiers: () => [],
});

/**
 * 按钮点击事件
 */
interface ButtonEmits {
  /**
   * @description 按钮点击事件
   */
  click: [event: MouseEvent];
}

const emit = defineEmits<ButtonEmits>();

const rawAttrs = useAttrs();

// 透传除 theme 外的所有 AButton 原生属性
const nativeProps = computed(() => {
  const { theme, permissionCode, fallback, modifiers, ...rest } = props as any;
  return rest;
});

// 过滤来自父组件的原生 onClick，避免与本组件的 emit('click') 双触发
const filteredAttrs = computed(() => {
  const { onClick, onclick, ...rest } = (rawAttrs as any) || {};
  return rest as Record<string, any>;
});

// 合并最终需要透传给 AButton 的属性
const passThroughProps = computed(() => ({
  ...(filteredAttrs.value as any),
  ...(nativeProps.value as any),
}));

const buttonClass = computed(() => ['yss-button', `yss-button--theme-${props.theme}`]);

/**
 * @description 处理按钮点击
 */
const enableAuth = computed(() => !!props.permissionCode);
const allowed = computed(() => (enableAuth.value ? hasAuth(props.permissionCode) : true));
const shouldRender = computed(() => {
  if (!enableAuth.value) return true;
  return allowed.value || props.fallback === 'disable';
});
const computedDisabled = computed(() => {
  const baseDisabled = (props as any).disabled || (props as any).loading;
  if (!enableAuth.value) return baseDisabled;
  if (!allowed.value && props.fallback === 'disable') return true;
  return baseDisabled;
});
const innerText = computed(() => {
  if (!props.permissionCode) return '';
  return getBtnInfo(props.permissionCode || '')?.btnName || '';
});

const handleClick = (event: MouseEvent) => {
  if (props.modifiers?.includes('stop')) event.stopPropagation();
  if (props.modifiers?.includes('prevent')) event.preventDefault();
  if (!allowed.value && props.fallback === 'disable') return;
  if (!computedDisabled.value) {
    emit('click', event);
  }
};
</script>

<script lang="ts">
export default {
  name: 'YButton',
  inheritAttrs: false,
};
</script>

<style scoped>
.yss-button {
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}

/*
  使用 Ant Design 标准主题变量
  确保在所有情况下颜色都能正确显示，不依赖运行时调用 applyYssTheme()
*/
.yss-button--theme-primary {
  --yss-button-color: var(--yss-color-primary-6, var(--ant-primary-color, #3371ff));
  --yss-button-hover-color: var(--yss-color-primary-5, var(--ant-primary-color-hover, #3177ff));
  --yss-button-active-color: var(--yss-color-primary-7, var(--ant-primary-color-active, #2a5acc));

  /* 兼容旧变量名 */
  --primary-color: var(--yss-button-color);
  --primary-hover-color: var(--yss-button-hover-color);
  --primary-active-color: var(--yss-button-active-color);
}

.yss-button--theme-success {
  --yss-button-color: var(--yss-color-success-6, var(--ant-success-color, #52c41a));
  --yss-button-hover-color: var(--yss-color-success-5, var(--ant-success-color-hover, #73d13d));
  --yss-button-active-color: var(--yss-color-success-7, var(--ant-success-color-active, #389e0d));
}

.yss-button--theme-warning {
  --yss-button-color: var(--ant-error-color, #ff4d4f);
  --yss-button-hover-color: var(--ant-error-color-hover, #ff7875);
  --yss-button-active-color: var(--ant-error-color-active, #d9363e);
  --primary-color: var(--yss-button-color);
  --primary-hover-color: var(--yss-button-hover-color);
  --primary-active-color: var(--yss-button-active-color);
}
</style>
