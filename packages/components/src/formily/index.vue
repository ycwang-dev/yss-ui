<script setup lang="ts">
import { FormProvider } from '@formily/vue';
import { computed, useSlots } from 'vue';
import DescriptionsView from './components/DescriptionsView/index.vue';
import CollapseTrigger from './components/CollapseTrigger';
import { useFormilyCollapse } from './hooks/useFormilyCollapse';
import { useSchemaPresentation } from './hooks/useSchemaPresentation';
import { useFormilyLocale } from './hooks/useFormilyLocale';
import { useFormilyForm } from './hooks/useFormilyForm';
import { useFormilyGrid } from './hooks/useFormilyGrid';
import { useFormilyModel } from './hooks/useFormilyModel';
import { useFormilySchema } from './hooks/useFormilySchema';
import { provideRootSlots } from './hooks/useFormilySlots';
import type { YssFormilyActionsSlotScope, YssFormilyEmits, YssFormilyProps } from './types';

defineOptions({ name: 'YFormily' });

/** YFormily Props 与默认值。 */
const props = withDefaults(defineProps<YssFormilyProps>(), {
  readPretty: false,
  mode: 0,
  initialValues: () => ({}),
  components: () => ({}),
  scope: () => ({}),
  gridDefaults: () => ({}),
  detailOptions: () => ({}),
  form: undefined,
  modelValue: undefined,
  collapsible: false,
  expanded: undefined,
  defaultExpanded: false,
  collapsedRows: 1,
});
/** YFormily 事件发送器。 */
const emit = defineEmits<YssFormilyEmits>();
/** YFormily 根插槽。 */
const slots = useSlots();
/** 是否使用外部自定义操作区。 */
const hasActionsSlot = computed(() => !!slots.actions);

/** 将根组件具名插槽透传给 Schema Slot 和折叠触发器。 */
provideRootSlots();
/** 展开/收起状态与 Grid/按钮组注册中心。 */
const collapseController = useFormilyCollapse(props, emit, hasActionsSlot);
/** 默认响应式栅格与折叠适配器。 */
const { detailResolved, FormGridWithDefaults } = useFormilyGrid({
  gridDefaults: props.gridDefaults,
  detailOptions: props.detailOptions,
  collapse: collapseController,
});
/** 编辑态与详情隐式 SchemaField。 */
const { SchemaField, HiddenSchemaField } = useFormilySchema({
  components: props.components,
  scope: props.scope,
  mode: props.mode,
  formGrid: FormGridWithDefaults,
});
/** 表单实例与公开方法。 */
const { innerForm, getValues, setValues, submit, setFieldState } = useFormilyForm({
  initialValues: props.modelValue || props.initialValues,
  get readPretty() {
    return props.readPretty;
  },
  get mode() {
    return props.mode;
  },
  get form() {
    return props.form;
  },
});

useFormilyLocale(innerForm);
useSchemaPresentation(
  innerForm,
  () => props.schema,
  () => props.scope
);

/** 同步内外表单值。 */
useFormilyModel({
  innerForm,
  getModelValue: () => props.modelValue,
  getMode: () => props.mode,
  emitModelValue: values => emit('update:modelValue', values),
});

/** actions 插槽作用域。 */
const actionsSlotScope = computed<YssFormilyActionsSlotScope>(() => ({
  ...collapseController.slotScope.value,
  showTrigger: collapseController.showTrigger.value,
  form: innerForm.value,
  getValues,
  submit,
}));

defineExpose({
  form: innerForm,
  getValues,
  setValues,
  submit,
  setFieldState,
  toggle: collapseController.toggle,
  expand: collapseController.expand,
  collapse: collapseController.collapse,
});
</script>

<template>
  <FormProvider :form="innerForm">
    <div class="yss-formily">
      <template v-if="mode === 2">
        <div style="display: none">
          <HiddenSchemaField :schema="schema" />
        </div>
        <DescriptionsView :schema="schema" :form="innerForm" v-bind="detailResolved">
          <template v-for="(_, name) in $slots" #[name]="slotProps">
            <slot :name="name" v-bind="slotProps" />
          </template>
        </DescriptionsView>
      </template>
      <SchemaField v-else :schema="schema" />

      <div v-if="hasActionsSlot || collapseController.showFallbackTrigger.value" class="yss-formily__actions">
        <CollapseTrigger />
        <slot v-if="hasActionsSlot" name="actions" v-bind="actionsSlotScope" />
      </div>
      <slot />
    </div>
  </FormProvider>
</template>

<style scoped lang="less">
@import url('./style.less');
</style>
