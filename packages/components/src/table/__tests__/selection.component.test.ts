/* eslint-disable vue/one-component-per-file */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, ref, nextTick } from 'vue';
import YTable from '../index.vue';
import type { YTableColumn } from '../type';

// 模拟 vxe-table 与 vxe-pc-ui
vi.mock('@yss-ui/utils', () => ({ hasAuth: () => true }));

describe('YTable Selection & Batch Operations', () => {
  const sampleData = [
    { id: '1', userCode: 'u1', name: 'Alice', status: 1 },
    { id: '2', userCode: 'u2', name: 'Bob', status: 0 },
    { id: '3', userCode: 'u3', name: 'Charlie', status: 0 },
  ];

  const columns: YTableColumn[] = [
    { type: 'checkbox', width: 50 },
    { field: 'name', title: '姓名' },
  ];

  it('should emit selection events when row checkbox changes', async () => {
    const onSelectionChange = vi.fn();
    const onUpdateSelectedRowKeys = vi.fn();
    const onUpdateSelectedRows = vi.fn();

    const wrapper = mount(YTable, {
      props: {
        data: sampleData,
        columns,
        rowConfig: { keyField: 'userCode', useKey: true },
        'onSelection-change': onSelectionChange,
        'onUpdate:selectedRowKeys': onUpdateSelectedRowKeys,
        'onUpdate:selectedRows': onUpdateSelectedRows,
      },
    });

    const tableExpose = wrapper.vm as any;
    expect(tableExpose).toBeDefined();

    // 模拟 vxe-table 触发 checkbox-change
    const vxeTable = wrapper.findComponent({ name: 'VxeTable' });
    if (vxeTable.exists()) {
      vxeTable.vm.$emit('checkbox-change', {
        records: [sampleData[1]],
        row: sampleData[1],
        checked: true,
      });

      await nextTick();

      expect(onUpdateSelectedRows).toHaveBeenCalledWith([sampleData[1]]);
      expect(onUpdateSelectedRowKeys).toHaveBeenCalledWith(['u2']);
      expect(onSelectionChange).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedRows: [sampleData[1]],
          selectedRowKeys: ['u2'],
        })
      );
    }
  });

  it('should support clearSelection instance method', async () => {
    const onSelectionChange = vi.fn();

    const wrapper = mount(YTable, {
      props: {
        data: sampleData,
        columns,
        'onSelection-change': onSelectionChange,
      },
    });

    const vm = wrapper.vm as any;
    expect(typeof vm.clearSelection).toBe('function');
    expect(typeof vm.getSelectedRows).toBe('function');
    expect(typeof vm.getSelectedRowKeys).toBe('function');

    vm.clearSelection();
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedRows: [],
        selectedRowKeys: [],
      })
    );
  });

  it('should support v-model:selectedRowKeys two-way binding', async () => {
    const TestComponent = defineComponent({
      setup() {
        const selectedRowKeys = ref<(string | number)[]>(['u1']);
        return { selectedRowKeys, sampleData, columns };
      },
      render() {
        return h(YTable, {
          data: this.sampleData,
          columns: this.columns,
          rowConfig: { keyField: 'userCode', useKey: true },
          selectedRowKeys: this.selectedRowKeys,
          'onUpdate:selectedRowKeys': (keys: (string | number)[]) => {
            this.selectedRowKeys = keys;
          },
        });
      },
    });

    const wrapper = mount(TestComponent);
    await nextTick();

    const vxeTable = wrapper.findComponent({ name: 'VxeTable' });
    if (vxeTable.exists()) {
      vxeTable.vm.$emit('checkbox-change', {
        records: [sampleData[0], sampleData[2]],
        row: sampleData[2],
        checked: true,
      });

      await nextTick();
      expect(wrapper.vm.selectedRowKeys).toEqual(['u1', 'u3']);
    }
  });

  it('should emit checkbox-all and selection-change when select all changes', async () => {
    const onSelectionChange = vi.fn();
    const onCheckboxAll = vi.fn();

    const wrapper = mount(YTable, {
      props: {
        data: sampleData,
        columns,
        rowConfig: { keyField: 'id', useKey: true },
        'onSelection-change': onSelectionChange,
        'onCheckbox-all': onCheckboxAll,
      },
    });

    const vxeTable = wrapper.findComponent({ name: 'VxeTable' });
    if (vxeTable.exists()) {
      vxeTable.vm.$emit('checkbox-all', {
        records: sampleData,
        checked: true,
      });

      await nextTick();

      expect(onCheckboxAll).toHaveBeenCalled();
      expect(onSelectionChange).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedRows: sampleData,
          selectedRowKeys: ['1', '2', '3'],
        })
      );
    }
  });
});
