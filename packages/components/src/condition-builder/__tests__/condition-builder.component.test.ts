import { afterEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import YConditionBuilder from '../index.vue';
import ConditionLeaf from '../components/ConditionLeaf.vue';
import type { ConditionGroup, YConditionExpose } from '../types';

/** 当前测试创建的组件包装器。 */
const wrappers: VueWrapper[] = [];

/** 忽略第三方控件属性、仅保留插槽结构的测试替身。 */
const ControlStub = defineComponent({
  name: 'ControlStub',
  inheritAttrs: false,
  setup:
    (_, { slots }) =>
    () =>
      h('div', slots.default?.()),
});

/** 创建一棵完整且可校验的标准条件树。 */
const createConditionGroup = (): ConditionGroup => ({
  id: 'root',
  type: 'GROUP',
  logicalOp: 'AND',
  children: [
    {
      id: 'age-condition',
      type: 'LEAF',
      field: 'age',
      operator: 'EQ',
      value: 18,
    },
  ],
});

/** 挂载条件构造器并记录包装器，便于测试后统一卸载。 */
const mountConditionBuilder = (modelValue: ConditionGroup, props: Record<string, any> = {}): VueWrapper => {
  const wrapper = mount(YConditionBuilder, {
    props: { modelValue, ...props },
    global: {
      stubs: {
        AAutoComplete: ControlStub,
        AButton: ControlStub,
        ASelect: ControlStub,
      },
    },
  });
  wrappers.push(wrapper);
  return wrapper;
};

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
});

describe('YConditionBuilder 公开实例契约', () => {
  it('默认格式返回标准条件树', () => {
    const wrapper = mountConditionBuilder(createConditionGroup());
    const exposed = wrapper.vm as unknown as YConditionExpose;

    expect(exposed.getValue()).toEqual(createConditionGroup());
    expect(exposed.validate()).toBe(true);
  });

  it('legacy 历史参数与 normalized 返回相同标准结构', () => {
    const wrapper = mountConditionBuilder(createConditionGroup());
    const exposed = wrapper.vm as unknown as YConditionExpose;

    expect(exposed.getValue('legacy')).toEqual(exposed.getValue('normalized'));
  });

  it('渲染 ConditionLeaf 子组件', async () => {
    const wrapper = mountConditionBuilder(createConditionGroup());
    await nextTick();

    const leaf = wrapper.findComponent(ConditionLeaf);
    expect(leaf.exists()).toBe(true);
  });

  it('多条件时展示逻辑操作符并支持切换', async () => {
    const group: ConditionGroup = {
      id: 'root',
      type: 'GROUP',
      logicalOp: 'AND',
      children: [
        { id: 'c1', type: 'LEAF', field: 'name', operator: 'EQ', value: 'a' },
        { id: 'c2', type: 'LEAF', field: 'age', operator: 'GT', value: 10 },
      ],
    };
    const wrapper = mountConditionBuilder(group);
    await nextTick();

    const logicBtn = wrapper.find('.logic-btn');
    expect(logicBtn.exists()).toBe(true);
    expect(logicBtn.text()).toBe('且');

    await logicBtn.trigger('click');
    await nextTick();
    const exposed = wrapper.vm as unknown as YConditionExpose;
    expect(exposed.getValue().logicalOp).toBe('OR');
  });

  it('支持通过实例方法添加与删除条件', async () => {
    const wrapper = mountConditionBuilder(createConditionGroup());
    const exposed = wrapper.vm as unknown as YConditionExpose;

    exposed.addLeaf();
    await nextTick();
    expect(exposed.getValue().children.length).toBe(2);

    exposed.remove([1]);
    await nextTick();
    expect(exposed.getValue().children.length).toBe(1);
  });
});
