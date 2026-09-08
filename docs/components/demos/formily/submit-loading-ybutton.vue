<template>
  <div>
    <YFormily
      ref="formRef"
      :schema="schema"
      :initial-values="{ name: '', status: true, submitLoading: false }"
      :scope="{ handleFormSubmit }"
    />
  </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { YFormily, type ISchema } from '@yss-ui/components';
import { ref } from 'vue';

const formRef = ref<any>();

const mockRequest = (values: Record<string, any>) =>
  new Promise<void>(resolve => {
    setTimeout(() => {
      message.success(`提交成功：${values.name || '未填写姓名'}`);
      resolve();
    }, 1200);
  });

const handleFormSubmit = async () => {
  if (!formRef.value) return;
  formRef.value.setValues({ submitLoading: true });
  try {
    // 触发 Formily 校验，校验通过后返回 values
    const values = await formRef.value.submit();
    await mockRequest(values);
  } catch {
    // 校验失败时 Formily 会自动显示错误消息
  } finally {
    formRef.value.setValues({ submitLoading: false });
  }
};

const schema: ISchema = {
  type: 'object',
  properties: {
    layout: {
      type: 'void',
      'x-component': 'FormLayout',
      'x-component-props': { layout: 'horizontal', labelWidth: 90 },
      properties: {
        grid: {
          type: 'void',
          'x-component': 'FormGrid',
          properties: {
            name: {
              type: 'string',
              title: '姓名',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-validator': [{ required: true, message: '请输入姓名' }],
            },
            status: {
              type: 'boolean',
              title: '状态',
              'x-decorator': 'FormItem',
              'x-component': 'Switch',
            },
            actions: {
              type: 'void',
              'x-decorator': 'FormItem',
              'x-decorator-props': { gridSpan: 3, colon: false },
              'x-component': 'AutoButtonGroup',
              properties: {
                submit: {
                  type: 'void',
                  'x-component': 'YButton',
                  'x-content': '提交',
                  'x-component-props': {
                    type: 'primary',
                    loading: '{{ $form.values.submitLoading }}',
                    onClick: '{{ handleFormSubmit }}',
                  },
                },
                reset: { type: 'void', 'x-component': 'Reset', 'x-content': '重置' },
              },
            },
          },
        },
      },
    },
  },
};
</script>
