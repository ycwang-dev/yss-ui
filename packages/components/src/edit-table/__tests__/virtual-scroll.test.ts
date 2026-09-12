// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import YEditTable from '../index.vue';
import type { YEditTableColumn } from '../type';

describe('YEditTable 虚拟滚动配置与优先级对齐 (#17)', () => {
  const columns: YEditTableColumn[] = [
    { field: 'name', title: '姓名' },
    { field: 'age', title: '年龄' },
  ];
  const data = [{ name: '张三', age: 18 }];

  it('默认启用合理的虚拟滚动阈值（X: gt 50, Y: gt 100）', async () => {
    const wrapper = mount(YEditTable, {
      props: {
        columns,
        data,
      },
    });

    await nextTick();
    const vxeTable = wrapper.findComponent({ name: 'VxeTable' });
    expect(vxeTable.exists()).toBe(true);
    expect(vxeTable.props('virtualXConfig')).toEqual({ enabled: true, gt: 50 });
    expect(vxeTable.props('virtualYConfig')).toEqual({ enabled: true, gt: 100 });
  });

  it('支持通过直接 props 传入 virtualXConfig 与 virtualYConfig', async () => {
    const wrapper = mount(YEditTable, {
      props: {
        columns,
        data,
        virtualXConfig: { enabled: true, gt: 20 },
        virtualYConfig: { enabled: true, gt: 300 },
      },
    });

    await nextTick();
    const vxeTable = wrapper.findComponent({ name: 'VxeTable' });
    expect(vxeTable.props('virtualXConfig')).toEqual({ enabled: true, gt: 20 });
    expect(vxeTable.props('virtualYConfig')).toEqual({ enabled: true, gt: 300 });
  });

  it('兼容通过 tableConfig 传入 virtual*Config 或旧版 scroll*', async () => {
    const wrapper = mount(YEditTable, {
      props: {
        columns,
        data,
        tableConfig: {
          virtualXConfig: { enabled: true, gt: 15 },
          scrollY: { enabled: false, gt: 999 },
        },
      },
    });

    await nextTick();
    const vxeTable = wrapper.findComponent({ name: 'VxeTable' });
    expect(vxeTable.props('virtualXConfig')).toEqual({ enabled: true, gt: 15 });
    expect(vxeTable.props('virtualYConfig')).toEqual({ enabled: false, gt: 999 });
  });

  it('正确处理优先级：props.virtual*Config > tableConfig.virtual*Config > props.scroll* > tableConfig.scroll*', async () => {
    const wrapper = mount(YEditTable, {
      props: {
        columns,
        data,
        virtualXConfig: { enabled: true, gt: 10 },
        scrollX: { enabled: true, gt: 40 },
        tableConfig: {
          virtualXConfig: { enabled: true, gt: 25 },
          scrollX: { enabled: true, gt: 60 },
          scrollY: { enabled: true, gt: 500 },
        },
      },
    });

    await nextTick();
    const vxeTable = wrapper.findComponent({ name: 'VxeTable' });
    // props.virtualXConfig (10) 优先于 tableConfig (25) 与 scrollX (40/60)
    expect(vxeTable.props('virtualXConfig')).toEqual({ enabled: true, gt: 10 });
    // 未传 props.virtualYConfig，回落到 tableConfig.scrollY (500)
    expect(vxeTable.props('virtualYConfig')).toEqual({ enabled: true, gt: 500 });
  });
});
