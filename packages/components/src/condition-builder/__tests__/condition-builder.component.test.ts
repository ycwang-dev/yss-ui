import { afterEach, describe, expect, it } from 'vitest';
import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import YConditionBuilder from '../index.vue';
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
const mountConditionBuilder = (modelValue: ConditionGroup): VueWrapper => {
  const wrapper = shallowMount(YConditionBuilder, {
    props: { modelValue },
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
});
