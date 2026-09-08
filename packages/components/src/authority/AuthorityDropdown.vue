<template>
  <ADropdown v-if="allowed || fallback === 'disable'">
    <AButton v-bind="buttonProps" :disabled="!allowed && fallback === 'disable'">
      <slot>
        {{ btnLabel }}
      </slot>
    </AButton>
    <template #overlay>
      <AMenu @click="onMenuClick">
        <AMenuItem v-for="item in filtered" :key="itemKey(item)">
          {{ itemLabel(item) }}
        </AMenuItem>
      </AMenu>
    </template>
  </ADropdown>
</template>

<script setup lang="ts">
import { getBtnInfo, hasAuth } from '@yss-ui/utils';
import { Button as AButton, Dropdown as ADropdown, Menu as AMenu, MenuItem as AMenuItem } from 'ant-design-vue';
import { computed } from 'vue';
import type { AuthorityDropdownItem, AuthorityDropdownProps } from './types';

defineOptions({ name: 'AuthorityDropdown' });

const props = withDefaults(defineProps<AuthorityDropdownProps>(), {
  dropdownItems: () => [],
  options: () => ({ label: 'text', value: 'id' }),
  buttonProps: () => ({}),
  fallback: 'hide',
});

const perListFilter = (item: AuthorityDropdownItem) => !item?.permissionCode || hasAuth(item.permissionCode);
const filtered = computed(() => (props.dropdownItems || []).filter(perListFilter));

const itemLabel = (i: AuthorityDropdownItem) => i[props.options.label || 'text'];
const itemKey = (i: AuthorityDropdownItem) => i[props.options.value || 'id'];

const btnLabel = computed(() => getBtnInfo(props.permissionCode || '')?.btnName || '');
const allowed = computed(() => !props.permissionCode || hasAuth(props.permissionCode));

const emit = defineEmits<{ (e: 'command', record: AuthorityDropdownItem): void }>();
const onMenuClick = ({ key }: any) => {
  const record = (props.dropdownItems || []).find(i => itemKey(i) === key);
  if (record) emit('command', record);
};
</script>

<script lang="ts">
export type { AuthorityDropdownItem, AuthorityDropdownProps } from './types';

export default { name: 'AuthorityDropdown' };
</script>
