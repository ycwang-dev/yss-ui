<script setup lang="ts">
import { useParentForm } from '@formily/vue';
import { Button as AButton } from 'ant-design-vue';
import { computed, ref, useAttrs } from 'vue';

defineOptions({ name: 'Reset' });

const props = withDefaults(
  defineProps<{
    forceClear?: boolean;
    validate?: boolean;
    onClick?: (event: MouseEvent) => void | boolean | Promise<void | boolean>;
  }>(),
  {
    forceClear: false,
    validate: false,
    onClick: undefined,
  }
);

const emit = defineEmits<{
  (e: 'resetValidateSuccess', payload: any): void;
  (e: 'resetValidateFailed', feedbacks: any): void;
}>();

const attrs = useAttrs();
const formRef = useParentForm();
const handlingByTick = ref(false);

const buttonAttrs = computed(() => {
  const { onClick: _onClick, onclick: _onclick, ...rest } = (attrs as any) || {};
  return rest as Record<string, any>;
});

const callClick = async (handler: any, e: MouseEvent) => {
  if (Array.isArray(handler)) {
    for (const fn of handler) {
      const result = await fn?.(e);
      if (result === false) return false;
    }
    return;
  }
  return await handler?.(e);
};

const handleClick = async (e: MouseEvent) => {
  if (handlingByTick.value) return;
  handlingByTick.value = true;
  queueMicrotask(() => {
    handlingByTick.value = false;
  });

  const result = await callClick(props.onClick, e);
  if (result === false) return;

  try {
    const payload = await formRef.value?.reset?.('*', {
      forceClear: props.forceClear,
      validate: props.validate,
    });
    emit('resetValidateSuccess', payload);
  } catch (error) {
    emit('resetValidateFailed', error);
  }
};
</script>

<template>
  <AButton v-bind="buttonAttrs" @click="handleClick">
    <slot />
  </AButton>
</template>
