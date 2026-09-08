<script setup lang="ts">
import { FormButtonGroup } from '@formily/antdv';
import { computed, inject, onUnmounted } from 'vue';
import CollapseTrigger from './CollapseTrigger';
import {
  FORMILY_COLLAPSE_CONTEXT,
  type FormilyCollapseActionHandle,
  type FormilyCollapseContext,
} from '../hooks/useFormilyCollapse';

defineOptions({ name: 'AutoButtonGroup' });

/** AutoButtonGroup Props。 */
const props = withDefaults(defineProps<{ align?: 'left' | 'right' | 'center'; gutter?: number }>(), {
  align: 'right',
  gutter: 8,
});

/** YFormily 折叠上下文。 */
const collapse = inject<FormilyCollapseContext | null>(FORMILY_COLLAPSE_CONTEXT, null);
/** 当前按钮组在折叠上下文中的注册句柄。 */
const collapseAction: FormilyCollapseActionHandle | undefined = collapse?.registerActionGroup();
/** 是否由当前 Schema 按钮组渲染折叠入口。 */
const showCollapseTrigger = computed(
  () => !!collapse?.showTrigger.value && !collapse.hasActionsSlot.value && !!collapseAction?.isPrimary.value
);

/** 卸载时释放按钮组注册。 */
onUnmounted(() => collapseAction?.unregister());
</script>

<template>
  <FormButtonGroup :align="props.align">
    <div :style="{ display: 'inline-flex', gap: props.gutter + 'px' }">
      <CollapseTrigger v-if="showCollapseTrigger" />
      <slot />
    </div>
  </FormButtonGroup>
</template>
