// @vitest-environment happy-dom
/* eslint-disable vue/one-component-per-file -- 同一测试文件集中声明多个轻量 Harness，便于覆盖状态与目标注册。 */

import { computed, defineComponent, h, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { appendVisibleGridNode, normalizeCollapsedRows, type FormilyGridWalkState } from '../constant';
import { useFormilyCollapse } from '../hooks/useFormilyCollapse';

/**
 * 按指定列数顺序计算节点行号。
 * @param spans 节点跨列数
 * @param columns 栅格列数
 * @param strictAutoFit 是否启用严格自适应
 * @returns 行号与总行数
 */
const calculateRows = (spans: number[], columns: number, strictAutoFit = false) => {
  const state: FormilyGridWalkState = { walkedColumns: 0, rowCount: 0 };
  const rows = spans.map((span, index) =>
    appendVisibleGridNode(state, { index, originSpan: span }, columns, strictAutoFit)
  );
  return { rows, rowCount: state.rowCount };
};

describe('YFormily collapse helpers', () => {
  it('normalizes collapsed rows to a positive integer', () => {
    expect(normalizeCollapsedRows()).toBe(1);
    expect(normalizeCollapsedRows(0)).toBe(1);
    expect(normalizeCollapsedRows(-2)).toBe(1);
    expect(normalizeCollapsedRows(2.9)).toBe(2);
    expect(normalizeCollapsedRows(Number.NaN)).toBe(1);
  });

  it('calculates responsive rows by columns and grid spans', () => {
    expect(calculateRows([1, 1, 1, 1, 1, 1], 3)).toEqual({ rows: [1, 1, 1, 2, 2, 2], rowCount: 2 });
    expect(calculateRows([1, 2, 1, -1], 3)).toEqual({ rows: [1, 1, 2, 2], rowCount: 2 });
  });

  it('wraps strict auto-fit nodes before applying a span', () => {
    expect(calculateRows([2, 2], 3, true)).toEqual({ rows: [1, 2], rowCount: 2 });
  });
});

describe('useFormilyCollapse', () => {
  /** 折叠状态测试容器。 */
  const Harness = defineComponent({
    props: {
      collapsible: { type: Boolean, default: true },
      expanded: { type: Boolean, default: undefined },
      defaultExpanded: { type: Boolean, default: false },
      collapsedRows: { type: Number, default: 1 },
    },
    emits: ['update:expanded', 'toggle'],
    setup(props, { emit, expose }) {
      const hasActionsSlot = ref(false);
      const collapse = useFormilyCollapse(
        props as any,
        emit as any,
        computed(() => hasActionsSlot.value)
      );
      const grid = collapse.registerGrid();
      grid.updateRows(2);
      expose({ collapse, grid });
      return () =>
        h('button', { class: 'toggle', onClick: collapse.toggle }, collapse.expanded.value ? '已展开' : '已收起');
    },
  });

  it('uses collapsed uncontrolled state and emits model/toggle events', async () => {
    const wrapper = mount(Harness);
    expect(wrapper.text()).toBe('已收起');
    await wrapper.get('.toggle').trigger('click');
    expect(wrapper.text()).toBe('已展开');
    expect(wrapper.emitted('update:expanded')).toEqual([[true]]);
    expect(wrapper.emitted('toggle')).toEqual([[true]]);
  });

  it('waits for parent updates in controlled mode', async () => {
    const wrapper = mount(Harness, { props: { expanded: false } });
    await wrapper.get('.toggle').trigger('click');
    expect(wrapper.text()).toBe('已收起');
    expect(wrapper.emitted('update:expanded')).toEqual([[true]]);
    await wrapper.setProps({ expanded: true });
    expect(wrapper.text()).toBe('已展开');
  });

  it('does not emit duplicate events when requesting the current state', () => {
    const wrapper = mount(Harness, { props: { defaultExpanded: true } });
    (wrapper.vm as any).collapse.expand();
    expect(wrapper.emitted('update:expanded')).toBeUndefined();
    expect(wrapper.emitted('toggle')).toBeUndefined();
  });

  it('keeps grid registration identity and aggregates explicit targets with row offsets', () => {
    /** 多 Grid 目标选择测试容器。 */
    const TargetHarness = defineComponent({
      setup(_, { expose }) {
        const collapse = useFormilyCollapse(
          { schema: {}, collapsible: true } as any,
          ((): undefined => undefined) as any,
          computed(() => false)
        );
        const defaultGrid = collapse.registerGrid();
        defaultGrid.updateRows(4);
        const explicitGridA = collapse.registerGrid({ target: true });
        explicitGridA.updateRows(2);
        const explicitGridB = collapse.registerGrid({ target: true });
        explicitGridB.updateRows(3);
        expose({ collapse, defaultGrid, explicitGridA, explicitGridB });
        return () => h('div');
      },
    });
    const wrapper = mount(TargetHarness);
    const vm = wrapper.vm as any;

    expect(vm.defaultGrid.isTarget.value).toBe(false);
    expect(vm.explicitGridA.isTarget.value).toBe(true);
    expect(vm.explicitGridB.isTarget.value).toBe(true);
    expect(vm.explicitGridA.rowOffset.value).toBe(0);
    expect(vm.explicitGridB.rowOffset.value).toBe(2);
    expect(vm.collapse.rowCount.value).toBe(5);
  });
});
