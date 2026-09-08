<template>
  <AButton
    v-if="allowed || fallback === 'disable'"
    v-bind="$attrs"
    :disabled="!allowed && fallback === 'disable'"
    @click="onClick"
  >
    <slot>
      {{ innerText }}
    </slot>
  </AButton>
</template>

<script setup lang="ts">
import { getBtnInfo, hasAuth } from '@yss-ui/utils';
import { Button as AButton } from 'ant-design-vue';
import { computed } from 'vue';

defineOptions({ name: 'AuthorityButton' });

const props = withDefaults(defineProps<AuthorityButtonProps>(), {
  permissionCode: undefined,
  modifiers: () => [],
  text: undefined,
  fallback: 'hide',
});

const allowed = computed(() => hasAuth(props.permissionCode));
const innerText = computed(() => getBtnInfo(props.permissionCode || '')?.btnName || props.text || '');

const emit = defineEmits<{ (e: 'click', ev: MouseEvent): void }>();
const onClick = (ev: MouseEvent) => {
  if (props.modifiers?.includes('stop')) ev.stopPropagation();
  if (props.modifiers?.includes('prevent')) ev.preventDefault();
  if (!allowed.value && props.fallback === 'disable') return;
  emit('click', ev);
};
</script>

<script lang="ts">
export interface AuthorityButtonProps {
  permissionCode?: string;
  modifiers?: Array<'stop' | 'prevent'>;
  text?: string;
  /** 无权限时的处理：隐藏（默认）或禁用 */
  fallback?: 'hide' | 'disable';
}

export default { name: 'AuthorityButton' };
</script>
