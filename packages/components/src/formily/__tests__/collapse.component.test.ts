import { mount } from '@vue/test-utils';
import { computed, defineComponent, h } from 'vue';
import { describe, expect, it, vi } from 'vitest';

vi.mock('ant-design-vue', async () => {
  const { defineComponent: defineVueComponent, h: render } = await import('vue');
  return {
    Button: defineVueComponent({
      name: 'AButtonStub',
      inheritAttrs: false,
      emits: ['click'],
      setup(_, { attrs, emit, slots }) {
        return () =>
          render(
            'button',
            {
              ...attrs,
              onClick: (event: MouseEvent) => emit('click', event),
            },
            slots.default?.()
          );
      },
    }),
  };
});

vi.mock('@formily/antdv', async () => {
  const { defineComponent: defineVueComponent, h: render } = await import('vue');
  return {
    FormButtonGroup: defineVueComponent({
      name: 'FormButtonGroupStub',
      setup(_, { slots }) {
        return () => render('div', { class: 'form-button-group-stub' }, slots.default?.());
      },
    }),
  };
});

vi.mock('@ant-design/icons-vue', async () => {
  const { defineComponent: defineVueComponent, h: render } = await import('vue');
  return {
    DownOutlined: defineVueComponent({
      name: 'DownOutlinedStub',
      setup: () => () => render('span', { class: 'down-icon-stub' }),
    }),
    UpOutlined: defineVueComponent({
      name: 'UpOutlinedStub',
      setup: () => () => render('span', { class: 'up-icon-stub' }),
    }),
  };
});

import AutoButtonGroup from '../components/AutoButtonGroup.vue';
import CollapseTrigger from '../components/CollapseTrigger';
import { useFormilyCollapse } from '../hooks/useFormilyCollapse';
import { provideRootSlots } from '../hooks/useFormilySlots';

/**
 * 创建一个可以切换 Schema 按钮组与 actions 插槽的折叠测试容器。
 */
const Harness = defineComponent({
  props: {
    collapsible: { type: Boolean, default: false },
    expanded: { type: Boolean, default: undefined },
    defaultExpanded: { type: Boolean, default: false },
    collapsedRows: { type: Number, default: 1 },
    actionGroupCount: { type: Number, default: 1 },
  },
  emits: ['update:expanded', 'toggle'],
  setup(props, { emit, slots }) {
    provideRootSlots();
    const hasActionsSlot = computed(() => !!slots.actions);
    const collapse = useFormilyCollapse(props as any, emit as any, hasActionsSlot);
    const grid = collapse.registerGrid({ elementId: 'query-grid' });
    grid.updateRows(2);

    /** 渲染一个 Schema AutoButtonGroup 替身。 */
    const renderActionGroup = (index: number) =>
      h(
        AutoButtonGroup,
        { key: index },
        {
          default: () => [
            h('button', { class: `query-button query-button-${index}` }, '查询'),
            h('button', { class: `reset-button reset-button-${index}` }, '重置'),
          ],
        }
      );

    return () => {
      if (slots.actions) {
        return h('div', { class: 'custom-actions' }, [h(CollapseTrigger), slots.actions(collapse.slotScope.value)]);
      }
      return h(
        'div',
        { class: 'schema-actions' },
        Array.from({ length: props.actionGroupCount }, (_, index) => renderActionGroup(index))
      );
    };
  },
});

describe('YFormily collapse actions integration', () => {
  it('keeps the trigger disabled by default', () => {
    const wrapper = mount(Harness);
    expect(wrapper.find('.yss-formily__collapse-trigger').exists()).toBe(false);
  });

  it('injects the default trigger before query/reset buttons', async () => {
    const wrapper = mount(Harness, { props: { collapsible: true } });
    const group = wrapper.get('.form-button-group-stub > div');
    expect(group.element.children[0].classList.contains('yss-formily__collapse-trigger')).toBe(true);
    expect(group.element.children[1].classList.contains('query-button')).toBe(true);
    expect(group.element.children[2].classList.contains('reset-button')).toBe(true);
    expect(wrapper.get('.yss-formily__collapse-trigger').attributes('aria-controls')).toBe('query-grid');

    await wrapper.get('.yss-formily__collapse-trigger').trigger('click');
    expect(wrapper.get('.yss-formily__collapse-trigger').text()).toContain('收起');
    expect(wrapper.emitted('update:expanded')).toEqual([[true]]);
    expect(wrapper.emitted('toggle')).toEqual([[true]]);
  });

  it('uses the custom trigger and actions slot instead of AutoButtonGroup injection', async () => {
    const wrapper = mount(Harness, {
      props: { collapsible: true },
      slots: {
        actions: () => h('button', { class: 'custom-query' }, '自定义查询'),
        'collapse-trigger': ({ expanded, toggle }: any) =>
          h('button', { class: 'custom-trigger', onClick: toggle }, expanded ? '自定义收起' : '自定义展开'),
      },
    });
    expect(wrapper.get('.custom-actions').element.children[0].classList.contains('custom-trigger')).toBe(true);
    expect(wrapper.get('.custom-actions').element.children[1].classList.contains('custom-query')).toBe(true);
    await wrapper.get('.custom-trigger').trigger('click');
    expect(wrapper.get('.custom-trigger').text()).toBe('自定义收起');
  });

  it('renders the trigger only in the first active AutoButtonGroup', () => {
    const wrapper = mount(Harness, { props: { collapsible: true, actionGroupCount: 2 } });
    expect(wrapper.findAll('.yss-formily__collapse-trigger')).toHaveLength(1);
    expect(wrapper.get('.query-button-0').element.previousElementSibling?.classList).toContain(
      'yss-formily__collapse-trigger'
    );
    expect(wrapper.get('.query-button-1').element.previousElementSibling).toBeNull();
  });
});
