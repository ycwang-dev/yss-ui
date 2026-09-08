<template>
  <AForm v-bind="formProps" :class="formClass">
    <template v-for="field in formFields" :key="field.name">
      <AFormItem :label="field.label" :name="field.name" :rules="field.rules" :required="field.required">
        <component
          :is="getFormComponent(field.type)"
          v-model:value="formData[field.name]"
          v-bind="field.props"
          :placeholder="field.placeholder || `请输入${field.label}`"
        />
      </AFormItem>
    </template>

    <AFormItem v-if="showButtons" :wrapper-col="{ offset: labelCol?.span || 4 }">
      <ASpace>
        <AButton type="primary" :loading="loading" @click="handleSubmit">
          {{ submitText }}
        </AButton>
        <AButton @click="handleReset">
          {{ resetText }}
        </AButton>
      </ASpace>
    </AFormItem>
  </AForm>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import {
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Select as ASelect,
  DatePicker as ADatePicker,
  Button as AButton,
  Space as ASpace,
} from 'ant-design-vue';
import type { FormProps } from './types';

/**
 * YSS 表单组件
 * @description 基于 Ant Design Vue Form 封装的企业级表单组件
 */

const props = withDefaults(defineProps<FormProps>(), {
  layout: 'horizontal',
  showButtons: true,
  submitText: '提交',
  resetText: '重置',
  loading: false,
});

/**
 * 表单事件
 */
interface FormEmits {
  /**
   * @description 表单提交事件
   */
  submit: [values: Record<string, any>];
  /**
   * @description 表单重置事件
   */
  reset: [];
}

const emit = defineEmits<FormEmits>();

// 表单数据
const formData = reactive<Record<string, any>>({});

// 初始化表单数据
if (props.formFields) {
  props.formFields.forEach(field => {
    formData[field.name] = field.defaultValue || undefined;
  });
}

const formProps = computed(() => ({
  model: formData,
  layout: props.layout,
  labelCol: props.labelCol,
  wrapperCol: props.wrapperCol,
  colon: props.colon,
  disabled: props.disabled,
}));

const formClass = computed(() => ['yss-form', `yss-form--layout-${props.layout}`]);

/**
 * @description 获取表单组件
 */
const getFormComponent = (type: string) => {
  const componentMap = {
    input: AInput,
    select: ASelect,
    date: ADatePicker,
    textarea: AInput.TextArea,
  };
  return componentMap[type as keyof typeof componentMap] || AInput;
};

/**
 * @description 提交表单
 * @public
 */
const handleSubmit = () => {
  emit('submit', { ...formData });
};

/**
 * @description 重置表单
 * @public
 */
const handleReset = () => {
  if (props.formFields) {
    props.formFields.forEach(field => {
      formData[field.name] = field.defaultValue || undefined;
    });
  }
  emit('reset');
};

/**
 * @description 获取表单值
 * @public
 */
const getFieldsValue = () => {
  return { ...formData };
};

/**
 * @description 设置表单值
 * @public
 */
const setFieldsValue = (values: Record<string, any>) => {
  Object.assign(formData, values);
};

defineExpose({
  getFieldsValue,
  setFieldsValue,
  handleSubmit,
  handleReset,
});
</script>

<script lang="ts">
export default {
  name: 'YssForm',
};
</script>

<style scoped>
.yss-form {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
}

.yss-form--layout-vertical .ant-form-item-label {
  text-align: left;
}

.yss-form--layout-inline .ant-form-item {
  margin-right: 16px;
}
</style>
