import { afterEach, describe, expect, it } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { computed, defineComponent, h, ref, nextTick } from 'vue';
import dayjs from 'dayjs';
import { createForm } from '@formily/core';
import { VxeUI } from 'vxe-pc-ui';
import { syncVxeLanguage } from '../vxeBridge';
import { LOCALE_INJECTION_KEY, setGlobalLocale } from '../context';
import zhCN from '../lang/zh-CN';
import enUS from '../lang/en-US';
import YConfigProvider from '../config-provider/index.vue';
import YMonthCalendar from '../../month-calendar/index.vue';
import { useFormilyLocale } from '../../formily/hooks/useFormilyLocale';
import { syncSchemaPresentation } from '../../formily/hooks/useSchemaPresentation';
import { useFormilyForm } from '../../formily/hooks/useFormilyForm';
import { useLocalizedActions } from '../../monaco/hooks/useLocalizedActions';

afterEach(() => {
  setGlobalLocale(zhCN);
});

describe('语言适配器回归', () => {
  it('Monaco 自定义菜单热切换只替换动作，保持编辑器与模型', async () => {
    const locale = ref(zhCN);
    const labels: string[] = [];
    let disposals = 0;
    const editor = {
      addAction: (action: any) => {
        labels.push(action.label);
        return {
          dispose: () => {
            disposals += 1;
          },
        };
      },
    };
    const wrapper = mount(
      defineComponent({
        setup() {
          const add = useLocalizedActions(() => editor);
          add({ id: 'find', label: 'find' });
          return () => h('div');
        },
      }),
      { global: { provide: { [LOCALE_INJECTION_KEY as symbol]: locale } } }
    );
    locale.value = enUS;
    await nextTick();
    expect(labels).toEqual(['查找...', 'Find...']);
    expect(disposals).toBe(1);
    wrapper.unmount();
    expect(disposals).toBe(2);
  });

  it('VXE 注册真实英文和繁体词典，连续切换最后一次生效', async () => {
    await syncVxeLanguage('en-US');
    expect(VxeUI.hasLanguage('en-US')).toBe(true);
    expect(VxeUI.getI18n('vxe.base.pleaseInput')).toBe('Please enter');
    await Promise.all([syncVxeLanguage('en-US'), syncVxeLanguage('zh-TW')]);
    expect(VxeUI.getLanguage()).toBe('zh-TW');
    expect(VxeUI.getI18n('vxe.base.pleaseInput')).not.toBe('vxe.base.pleaseInput');
  });

  it('已有中文日期实例切为英文后显示英文月份，选中日期不变', async () => {
    const locale = ref(zhCN);
    const month = dayjs('2026-09-01').locale('zh-cn');
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(YConfigProvider, { locale: locale.value }, () => h(YMonthCalendar, { month, modelValue: month })),
      })
    );
    locale.value = enUS;
    await nextTick();
    expect(wrapper.text()).toContain('September 2026');
    expect(month.format('YYYY-MM-DD')).toBe('2026-09-01');
    expect(month.locale()).toBe('zh-cn');
    wrapper.unmount();
  });

  it('Formily 已显示的默认校验错误随语言更新，输入和表单实例保留', async () => {
    const locale = ref(zhCN);
    const form = createForm({ values: { memo: 'unsaved' } });
    const field = form.createField({ name: 'name', required: true });
    const wrapper = mount(
      defineComponent({
        setup() {
          useFormilyLocale(computed(() => form));
          return () => h('div');
        },
      }),
      { global: { provide: { [LOCALE_INJECTION_KEY as symbol]: locale } } }
    );
    await field.validate().catch(() => undefined);
    const before = JSON.stringify(field.errors);
    locale.value = enUS;
    await nextTick();
    await flushPromises();
    expect(JSON.stringify(field.errors)).not.toBe(before);
    expect(form.values.memo).toBe('unsaved');
    wrapper.unmount();
  });

  it('翻译更新现有嵌套字段展示，同时保留输入、远端选项和动态禁用状态', () => {
    const form = createForm({ values: { name: 'unsaved' } });
    const field = form.createField({
      name: 'name',
      basePath: 'layout',
      title: '姓名',
      component: ['Input', { disabled: true, placeholder: '请输入' }],
    });
    const before = {
      type: 'object',
      properties: {
        layout: {
          type: 'void',
          properties: {
            name: {
              type: 'string',
              title: '姓名',
              'x-component': 'Input',
              'x-component-props': { placeholder: '请输入' },
            },
          },
        },
      },
    };
    const next = {
      type: 'object',
      properties: {
        layout: {
          type: 'void',
          properties: {
            name: {
              type: 'string',
              title: 'Name',
              'x-component': 'Input',
              'x-component-props': { placeholder: 'Enter name' },
            },
          },
        },
      },
    };
    syncSchemaPresentation(form, next, before);
    expect(field.title).toBe('Name');
    expect(field.componentProps.placeholder).toBe('Enter name');
    expect(field.componentProps.disabled).toBe(true);
    expect(form.values.name).toBe('unsaved');
  });

  it('表单配置响应式变化不会创建新 Form 或覆盖未保存内容', async () => {
    const pretty = ref(false);
    let state!: ReturnType<typeof useFormilyForm>;
    const wrapper = mount(
      defineComponent({
        setup() {
          state = useFormilyForm({
            initialValues: { memo: '' },
            get readPretty() {
              return pretty.value;
            },
          });
          return () => h('div');
        },
      })
    );
    const form = state.innerForm.value;
    form.setValues({ memo: 'unsaved' });
    pretty.value = true;
    await nextTick();
    expect(state.innerForm.value).toBe(form);
    expect(state.getValues()).toMatchObject({ memo: 'unsaved' });
    wrapper.unmount();
  });
});
