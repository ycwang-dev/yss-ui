import {
  Cascader as ACascader,
  Checkbox as ACheckbox,
  DatePicker as ADatePicker,
  Input as AInput,
  InputNumber as AInputNumber,
  Select as ASelect,
  Switch as ASwitch,
  TimePicker as ATimePicker,
  TreeSelect as ATreeSelect,
} from 'ant-design-vue';
import { defineComponent, h } from 'vue';
import { resolveEditComponentName } from '../constant';
import type { YEditTableColumn } from '../type';

// 兼容布尔值 Select 编辑器，避免 ant-design-vue 报 [Vue warn]: Invalid prop: type check failed for prop "value"
const CompatibleASelect = defineComponent({
  name: 'CompatibleASelect',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => {
      const rawValue = attrs.value;
      const updatedAttrs = { ...attrs };
      const isBooleanValue = typeof rawValue === 'boolean';

      if (isBooleanValue) {
        updatedAttrs.value = String(rawValue);

        if (Array.isArray(attrs.options)) {
          updatedAttrs.options = attrs.options.map((opt: any) => {
            if (opt && typeof opt === 'object') {
              return {
                ...opt,
                value: typeof opt.value === 'boolean' ? String(opt.value) : opt.value,
              };
            }
            return opt;
          });
        }
      }

      // 拦截事件：
      // 在 Vue 3 中，v-model:value 会转化为 onUpdate:value 属性，change 事件会转化为 onChange 属性。
      const rawOnUpdateValue = attrs['onUpdate:value'] as Function | undefined;
      const rawOnChange = attrs.onChange as Function | undefined;

      if (isBooleanValue) {
        if (rawOnUpdateValue) {
          updatedAttrs['onUpdate:value'] = (val: any) => {
            let restoredVal = val;
            if (val === 'true') restoredVal = true;
            if (val === 'false') restoredVal = false;
            rawOnUpdateValue(restoredVal);
          };
        }
        if (rawOnChange) {
          updatedAttrs.onChange = (val: any, option: any) => {
            let restoredVal = val;
            if (val === 'true') restoredVal = true;
            if (val === 'false') restoredVal = false;
            rawOnChange(restoredVal, option);
          };
        }
      }

      return h(ASelect, updatedAttrs, slots);
    };
  },
});

// 在 autoClear=true 时，vxe-table 会监听 document 的鼠标事件来清除编辑状态。
// 当下拉面板挂载到 body 上时，点击面板会被判定为“表格外”，导致编辑被清除。
// 这里为所有下拉类编辑器提供一个专用容器，并在捕获/冒泡阶段阻断事件，避免误清除。
let __yEditTablePopupContainer: HTMLElement | null = null;
const getSafePopupContainer = (): HTMLElement => {
  if (typeof document === 'undefined') return undefined as unknown as HTMLElement;
  if (__yEditTablePopupContainer && document.body.contains(__yEditTablePopupContainer)) {
    return __yEditTablePopupContainer;
  }
  const el = document.createElement('div');
  // 关键：添加 vxe 认可的忽略类，防止 autoClear 清除编辑态；不再拦截事件，避免影响组件交互
  el.className = 'y-edit-table-popup-container vxe-table--ignore-clear';
  document.body.appendChild(el);
  __yEditTablePopupContainer = el;
  return el;
};

/**
 * 创建 YEditTable 内置编辑器的解析、属性和事件绑定能力。
 *
 * @param getOptions 获取当前单元格候选项。
 * @param updateCell 更新单元格值。
 * @param scheduleValidateRow 调度当前行校验。
 * @returns 编辑器渲染辅助方法。
 */
export function useEditors(
  getOptions: (col: any, row: any) => any[],
  updateCell: (row: any, key: string, val: any) => void,
  scheduleValidateRow: (row: any, field?: string) => Promise<void>
) {
  const resolveEditor = (col: YEditTableColumn, row: any) => {
    const name = resolveEditComponentName(col, row);
    if (name === 'form-item-input-number') return AInputNumber;
    if (name === 'form-item-select') return CompatibleASelect as any;
    if (name === 'form-item-date') return ADatePicker as any;
    if (name === 'form-item-date-range') return (ADatePicker as any).RangePicker;
    if (name === 'form-item-time') return ATimePicker as any;
    if (name === 'form-item-tree-select') return ATreeSelect as any;
    if (name === 'form-item-cascader') return ACascader as any;
    if (name === 'form-item-switch') return ASwitch as any;
    if (name === 'form-item-checkbox') return ACheckbox as any;
    return AInput;
  };

  const editorProps = (col: YEditTableColumn, row: any) => {
    const componentName = resolveEditComponentName(col, row);
    const base: Record<string, any> = { size: 'small', style: { width: '100%' } };
    const rawProps = (col?.props || {}) as Record<string, any>;
    const dynamicProps =
      typeof col?.cellProps === 'function' ? col.cellProps({ row, field: col?.field, column: col }) : {};
    if (componentName === 'form-item-select') {
      const fm = rawProps?.fieldNames || { label: 'label', value: 'value' };
      const opts = getOptions(col, row).map((o: any) => ({ label: o[fm.label], value: o[fm.value] }));
      const allowCreate = !!rawProps?.allowCreate;
      const { fieldNames: _omitFieldNames, ...restProps } = rawProps;
      return {
        ...base,
        options: opts,
        mode: rawProps?.multiple ? 'multiple' : allowCreate ? 'tags' : undefined,
        showSearch: true,
        optionFilterProp: 'label', // 按 label 搜索，而非默认的 value
        allowClear: true,
        getPopupContainer: getSafePopupContainer,
        dropdownMatchSelectWidth: false,
        ...restProps,
        ...dynamicProps,
      };
    }
    if (componentName === 'form-item-date' || componentName === 'form-item-date-range') {
      const { valueFormat = 'YYYY-MM-DD', format = 'YYYY-MM-DD', ...restProps } = rawProps;
      return {
        ...base,
        allowClear: true,
        getPopupContainer: getSafePopupContainer,
        valueFormat,
        format,
        ...restProps,
        ...dynamicProps,
      };
    }
    if (componentName === 'form-item-time') {
      const { valueFormat = 'HH:mm:ss', format = 'HH:mm:ss', ...restProps } = rawProps;
      return {
        ...base,
        allowClear: true,
        getPopupContainer: getSafePopupContainer,
        valueFormat,
        format,
        ...restProps,
        ...dynamicProps,
      };
    }
    if (componentName === 'form-item-tree-select') {
      const fm = rawProps?.fieldNames || { label: 'label', value: 'value', children: 'children' };
      const treeData = getOptions(col, row);
      const { fieldNames: _omitFieldNames, ...restProps } = rawProps;
      return {
        ...base,
        style: { width: '100%' },
        treeData,
        fieldNames: fm,
        showSearch: true,
        treeNodeFilterProp: fm.label || 'label',
        allowClear: true,
        getPopupContainer: getSafePopupContainer,
        ...restProps,
        ...dynamicProps,
      } as Record<string, any>;
    }
    if (componentName === 'form-item-cascader') {
      const fm = rawProps?.fieldNames || { label: 'label', value: 'value', children: 'children' };
      const options = getOptions(col, row);
      const { fieldNames: _omitFieldNames, ...restProps } = rawProps;
      return {
        ...base,
        options,
        fieldNames: fm,
        showSearch: true,
        allowClear: true,
        getPopupContainer: getSafePopupContainer,
        ...restProps,
        ...dynamicProps,
      } as Record<string, any>;
    }
    if (componentName === 'form-item-switch' || componentName === 'form-item-checkbox') {
      const { ...restProps } = rawProps;
      return {
        ...base,
        // Switch/Checkbox 使用 checked 作为受控属性
        checked: !!row[col.field as string],
        ...restProps,
        ...dynamicProps,
      } as Record<string, any>;
    }
    return { ...base, ...rawProps, ...dynamicProps };
  };

  const editorEvents = (col: YEditTableColumn, row: any) => {
    const componentName = resolveEditComponentName(col, row);
    const update = (val: any) => updateCell(row, col.field as string, val);
    const validate = () => scheduleValidateRow(row, col.field as string);
    if (
      componentName === 'form-item-select' ||
      componentName === 'form-item-time' ||
      componentName === 'form-item-date' ||
      componentName === 'form-item-date-range' ||
      componentName === 'form-item-tree-select' ||
      componentName === 'form-item-cascader'
    ) {
      return {
        // 以 v-model 的 update 事件为唯一“变更来源”，避免与 change 同时触发造成重复更新
        'update:value': (val: any) => {
          update(val);
          validate();
        },
        // change 仅用于触发校验
        change: validate,
      } as Record<string, any>;
    }
    if (componentName === 'form-item-switch' || componentName === 'form-item-checkbox') {
      return {
        // 以 v-model:checked 为准，避免与 change 同时触发导致重复
        'update:checked': (checked: boolean) => {
          update(!!checked);
          validate();
        },
        // change 仅用于触发校验
        change: validate,
      } as Record<string, any>;
    }
    return {
      'update:value': (val: any) => {
        update(val);
        validate();
      },
      change: validate,
      input: validate,
    } as Record<string, any>;
  };

  return { resolveEditor, editorProps, editorEvents };
}
