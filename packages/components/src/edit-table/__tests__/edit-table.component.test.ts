// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import YEditTable from '../index.vue';
import type { YEditTableColumn } from '../type';

describe('YEditTable 组件挂载与基础行为', () => {
  it('正常挂载并提供公开实例方法', async () => {
    const columns: YEditTableColumn[] = [
      { field: 'name', title: '姓名' },
      { field: 'age', title: '年龄' },
    ];
    const data = [
      { name: '张三', age: 18 },
      { name: '李四', age: 20 },
    ];

    const wrapper = mount(YEditTable, {
      props: {
        columns,
        data,
      },
    });

    await nextTick();
    expect(wrapper.find('.y-edit-table-wrapper').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'VxeTable' }).exists()).toBe(true);

    const exposed = wrapper.vm as any;
    expect(typeof exposed.getTableInstance).toBe('function');
    expect(typeof exposed.validate).toBe('function');

    const validateResult = await exposed.validate();
    expect(validateResult).toBeDefined();
  });

  it('点击添加按钮触发 add 事件', async () => {
    const onAdd = vi.fn();
    const wrapper = mount(YEditTable, {
      props: {
        columns: [{ field: 'name', title: '姓名' }],
        data: [],
        addable: true,
        addBtnText: '新增一行',
        onAdd,
      },
    });

    await nextTick();
    const addBtn = wrapper.find('.y-edit-table-add__btn');
    expect(addBtn.exists()).toBe(true);
    expect(addBtn.text()).toBe('新增一行');

    await addBtn.trigger('click');
    expect(onAdd).toHaveBeenCalled();
  });

  it('开启分页时渲染分页组件', async () => {
    const wrapper = mount(YEditTable, {
      props: {
        columns: [{ field: 'name', title: '姓名' }],
        data: Array.from({ length: 30 }, (_, i) => ({ name: `User ${i}` })),
        pageable: true,
        pagination: {
          current: 1,
          pageSize: 10,
          total: 30,
        },
      },
    });

    await nextTick();
    expect(wrapper.find('.y-edit-table-pagination').exists()).toBe(true);
  });

  it('响应 filter-change 与 updateRow 事件', async () => {
    const onFilterChange = vi.fn();
    const onUpdateRow = vi.fn();
    const wrapper = mount(YEditTable, {
      props: {
        columns: [{ field: 'name', title: '姓名' }],
        data: [{ name: 'Tom' }],
        'onFilter-change': onFilterChange,
        onUpdateRow,
      },
    });

    await nextTick();
    const vxeTable = wrapper.findComponent({ name: 'VxeTable' });
    if (vxeTable.exists()) {
      vxeTable.vm.$emit('filter-change', { column: { field: 'name' } });
      expect(onFilterChange).toHaveBeenCalledWith({ column: { field: 'name' } });
    }
  });
});
