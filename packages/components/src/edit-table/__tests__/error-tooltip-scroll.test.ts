// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { useValidation } from '../hooks/useValidation';
import { useEditors } from '../hooks/useEditors';
import { useErrorTooltip } from '../hooks/useErrorTooltip';
import YEditTable from '../index.vue';
import type { YEditTableColumn } from '../type';

describe('YEditTable 校验提示与滚动交互测试', () => {
  it('手动滚动表格时自动收起当前激活的错误单元格气泡', async () => {
    const props = {
      data: [{ id: '1', code: '' }],
      columns: [{ field: 'code', title: '科目代码' }],
      tableConfig: {
        rowConfig: { keyField: 'id' },
        editRules: {
          code: [{ required: true, message: '请输入科目代码' }],
        },
      },
    };
    const tableRef = ref({
      getTableData: () => ({ tableData: props.data }),
    });

    const validation = useValidation(props, tableRef);
    await validation.validate();

    // 校验后第 1 行的 code 列应处于激活错误状态
    expect(validation.isActiveErrorCell(props.data[0], 'code')).toBe(true);

    // 模拟表格滚动
    validation.handleTableScroll();

    // 滚动后激活错误气泡应被自动收起
    expect(validation.isActiveErrorCell(props.data[0], 'code')).toBe(false);
    // 但单元格依然判定为错误状态（红框常驻）
    expect(validation.shouldShowError(props.columns[0], props.data[0])).toBe(true);
  });

  it('程序自动滚动保护：validate 触发的滚动不应误关闭初始错误提示', async () => {
    vi.useFakeTimers();

    const props = {
      data: [{ id: '1', code: '' }],
      columns: [{ field: 'code', title: '科目代码' }],
      tableConfig: {
        rowConfig: { keyField: 'id' },
        editRules: {
          code: [{ required: true, message: '请输入科目代码' }],
        },
      },
    };
    const tableRef = ref({
      getTableData: () => ({ tableData: props.data }),
    });

    const validation = useValidation(props, tableRef);
    await validation.validate();

    expect(validation.isActiveErrorCell(props.data[0], 'code')).toBe(true);

    // 标记程序正在自动滚动定位
    validation.markProgrammaticScrolling(300);

    // 保护期内触发滚动事件，不应清除激活气泡
    validation.handleTableScroll();
    expect(validation.isActiveErrorCell(props.data[0], 'code')).toBe(true);

    // 保护期过后，用户再次滚动，气泡应正常被关闭
    vi.advanceTimersByTime(350);
    validation.handleTableScroll();
    expect(validation.isActiveErrorCell(props.data[0], 'code')).toBe(false);

    vi.useRealTimers();
  });

  it('单元格获得焦点时触发 onCellFocus 回调以重新激活提示气泡', () => {
    const column: YEditTableColumn = { field: 'name', title: '姓名' };
    const row = { name: '' };
    const onCellFocus = vi.fn();
    const { editorEvents } = useEditors(() => [], vi.fn(), vi.fn().mockResolvedValue(undefined), onCellFocus);

    const events = editorEvents(column, row);
    expect(typeof events.focus).toBe('function');

    events.focus();
    expect(onCellFocus).toHaveBeenCalledWith(column, row);
  });

  it('YEditTable 组件上触发 scroll 事件能够正常响应', async () => {
    const columns: YEditTableColumn[] = [
      { field: 'code', title: '科目代码' },
      { field: 'name', title: '科目名称' },
    ];
    const data = [{ code: '', name: '张三' }];

    const wrapper = mount(YEditTable, {
      props: {
        columns,
        data,
        editRules: {
          code: [{ required: true, message: '请输入科目代码' }],
        },
      },
    });

    await nextTick();
    const vm = wrapper.vm as any;

    // 执行校验
    await vm.validate();

    const vxeTable = wrapper.findComponent({ name: 'VxeTable' });
    expect(vxeTable.exists()).toBe(true);

    // 触发 vxe-table 的 scroll 事件
    vxeTable.vm.$emit('scroll', { scrollLeft: 100, scrollTop: 0 });
    await nextTick();

    // 验证组件未发生异常并正常处理了滚动
    expect(wrapper.find('.y-edit-table-wrapper').exists()).toBe(true);
  });

  it('active 模式下非激活的错误单元格 open 属性必须为 false，防止鼠标悬浮 hover 误弹气泡', () => {
    const props = { errorTooltipConfig: { mode: 'active' as const } };
    const getCellError = () => '请输入科目代码';
    const shouldShowError = () => true;
    const isActiveErrorCell = vi.fn().mockReturnValue(false);

    const { getErrorTooltipProps } = useErrorTooltip(props, getCellError, shouldShowError, isActiveErrorCell);
    const tooltipProps = getErrorTooltipProps({ field: 'code' }, {});

    expect(tooltipProps.open).toBe(false);
  });
});
