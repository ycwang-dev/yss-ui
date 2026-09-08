import { createForm, isField } from '@formily/core';
import { createSchemaField, FormProvider } from '@formily/vue';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { describe, expect, it, vi } from 'vitest';

vi.mock('ant-design-vue', async () => {
  const { defineComponent: defineVueComponent, h: render } = await import('vue');
  const createStub = (name: string) =>
    defineVueComponent({
      name,
      setup:
        (_, { slots }) =>
        () =>
          render('div', slots.default?.()),
    });
  return {
    Rate: createStub('RateStub'),
    Slider: createStub('SliderStub'),
    Space: { Compact: createStub('SpaceCompactStub') },
  };
});

vi.mock('@formily/antdv', async () => {
  const { defineComponent: defineVueComponent, h: render } = await import('vue');
  const FormBaseItemStub = defineVueComponent({
    name: 'FormBaseItemStub',
    inheritAttrs: false,
    setup:
      (_, { attrs, slots }) =>
      () =>
        render('div', { class: 'ant-formily-form-item' }, [
          slots.default?.(),
          attrs.feedbackText
            ? render('div', { class: 'ant-formily-form-item-help' }, String(attrs.feedbackText))
            : null,
        ]),
  });
  return {
    FormItem: Object.assign(FormBaseItemStub, { BaseItem: FormBaseItemStub }),
  };
});

import { CompatibleFormilyFormItem } from '../components/CompatibleFormItem';
import { useAntdvRegistry } from '../hooks/useAntdvRegistry';

/** 输入框测试替身。 */
const InputStub = defineComponent({
  name: 'InputStub',
  setup: () => () => h('input'),
});

/** 创建使用兼容 FormItem 的最小 SchemaField 测试容器。 */
const createHarness = () => {
  const form = createForm();
  const { SchemaField } = createSchemaField({
    components: {
      FormItem: CompatibleFormilyFormItem,
      Input: InputStub,
    },
  });
  const schema = {
    type: 'object',
    properties: {
      password: {
        type: 'string',
        title: '密码',
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-validator': [{ required: true, whitespace: true, message: '请输入密码' }, { validator: () => true }],
      },
    },
  };
  const Harness = defineComponent({
    setup: () => () => h(FormProvider, { form }, { default: () => h(SchemaField, { schema }) }),
  });
  return { form, Harness };
};

describe('CompatibleFormilyFormItem', () => {
  it('is registered as the default YFormily FormItem adapter', () => {
    expect(useAntdvRegistry().AntdvComponents.FormItem).toBe(CompatibleFormilyFormItem);
  });

  it('renders only the relevant non-required feedback for a non-empty value', async () => {
    const { form, Harness } = createHarness();
    const wrapper = mount(Harness);
    await nextTick();

    const field = form.query('password').take();
    if (!isField(field)) throw new Error('password 字段未正确创建');
    field.value = 'Aa1xxxx';
    field.selfErrors = ['请输入密码', '密码长度需8-20位'];
    await nextTick();

    const feedback = wrapper.get('.ant-formily-form-item-help').text();
    expect(feedback).toBe('密码长度需8-20位');
    expect(feedback).not.toContain('请输入密码');
    expect(feedback).not.toContain(', ,');
  });
});
