/* eslint-disable vue/one-component-per-file */
/* eslint-disable vue/require-prop-types */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import YTable from '../index.vue';
import type { YTableColumn } from '../type';

vi.mock('@yss-ui/utils', () => ({ hasAuth: () => true }));

vi.mock('vxe-table', async () => {
  const { defineComponent, h } = await import('vue');
  return {
    VxeTable: defineComponent({
      name: 'VxeTable',
      props: ['data', 'columns', 'rowConfig', 'customConfig'],
      setup(_props, { slots }) {
        return () => h('div', { class: 'vxe-table-mock' }, slots.default?.());
      },
    }),
    VxeColumn: defineComponent({
      name: 'VxeColumn',
      props: ['field', 'title', 'type', 'width'],
      setup() {
        return () => h('div', { class: 'vxe-column-mock' });
      },
    }),
    VxeColgroup: defineComponent({
      name: 'VxeColgroup',
      setup() {
        return () => h('div', { class: 'vxe-colgroup-mock' });
      },
    }),
    VxeToolbar: defineComponent({
      name: 'VxeToolbar',
      props: ['custom', 'tools', 'size'],
      setup(props, { slots }) {
        return () =>
          h('div', { class: 'vxe-toolbar-mock', 'data-custom': String(props.custom) }, [
            h('div', { class: 'toolbar-buttons' }, slots.buttons?.()),
            h('div', { class: 'toolbar-tools' }, slots.tools?.()),
          ]);
      },
    }),
  };
});

describe('YTable Toolbar & Custom Decoupling', () => {
  const sampleData = [{ id: '1', name: 'Alice' }];
  const columns: YTableColumn[] = [{ field: 'name', title: '姓名' }];

  it('should render toolbar with toolbar-right slot WITHOUT requiring toolbar-config.custom', () => {
    const TestComponent = defineComponent({
      render() {
        return h(
          YTable,
          {
            data: sampleData,
            columns,
          },
          {
            'toolbar-right': () => h('button', { class: 'batch-delete-btn' }, '批量删除'),
          }
        );
      },
    });

    const wrapper = mount(TestComponent);
    const toolbar = wrapper.find('.vxe-toolbar-mock');
    expect(toolbar.exists()).toBe(true);
    expect(toolbar.attributes('data-custom')).toBe('false');

    const batchBtn = wrapper.find('.batch-delete-btn');
    expect(batchBtn.exists()).toBe(true);
    expect(batchBtn.text()).toBe('批量删除');
  });

  it('should enable custom column setting when toolbar-config.custom is explicitly true', () => {
    const TestComponent = defineComponent({
      render() {
        return h(
          YTable,
          {
            data: sampleData,
            columns,
            toolbarConfig: { custom: true },
          },
          {
            'toolbar-right': () => h('button', { class: 'add-btn' }, '新增'),
          }
        );
      },
    });

    const wrapper = mount(TestComponent);
    const toolbar = wrapper.find('.vxe-toolbar-mock');
    expect(toolbar.exists()).toBe(true);
    expect(toolbar.attributes('data-custom')).toBe('true');
  });
});
