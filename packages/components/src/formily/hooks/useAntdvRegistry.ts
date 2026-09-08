import * as Antdv from '@formily/antdv';
import { connect } from '@formily/vue';
import { Rate as ARate, Slider as ASlider, Space } from 'ant-design-vue';
import { defineComponent, h } from 'vue';
import { CompatibleFormilyFormItem } from '../components/CompatibleFormItem';

/** 仅挑选出“像 Vue 组件”的导出项，避免将样式/工具函数塞进注册表 */
export const pickVueComponents = (mod: Record<string, any>): Record<string, any> => {
  const out: Record<string, any> = {};
  Object.keys(mod).forEach(k => {
    const v = (mod as any)[k];
    const isVue =
      v && (typeof v === 'object' || typeof v === 'function') && (v.setup || v.render || v.__file || v.name);
    if (isVue) out[k] = v;
  });
  return out;
};

/** useAntdvRegistry 返回类型 */
export interface AntdvRegistryResult {
  AntdvComponents: Record<string, any>;
  Rate: ReturnType<typeof connect>;
  Slider: ReturnType<typeof connect>;
  InputGroup: typeof Space.Compact;
}

/**
 * 注册 antdv 相关组件，并提供 @formily/antdv 缺失组件的 connect 适配。
 */
export function useAntdvRegistry(): AntdvRegistryResult {
  const AntdvComponents = pickVueComponents(Antdv);

  /** 修复上游 FormItem 多消息重复拼接与残留必填反馈。 */
  AntdvComponents.FormItem = CompatibleFormilyFormItem;

  // 兼容布尔值 Select 下拉，避免 ant-design-vue 报 [Vue warn]: Invalid prop: type check failed for prop "value"
  if (AntdvComponents.Select) {
    const OriginalSelect = AntdvComponents.Select;
    AntdvComponents.Select = defineComponent({
      name: 'CompatibleFormilySelect',
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () => {
          const rawValue = attrs.value;
          const updatedAttrs = { ...attrs };

          if (typeof rawValue === 'boolean') {
            updatedAttrs.value = String(rawValue);

            const processOptions = (list: any[]) => {
              return list.map((opt: any) => {
                if (opt && typeof opt === 'object') {
                  return {
                    ...opt,
                    value: typeof opt.value === 'boolean' ? String(opt.value) : opt.value,
                  };
                }
                return opt;
              });
            };

            if (Array.isArray(attrs.options)) {
              updatedAttrs.options = processOptions(attrs.options);
            }
            if (Array.isArray(attrs.dataSource)) {
              updatedAttrs.dataSource = processOptions(attrs.dataSource);
            }
          }

          return h(OriginalSelect, updatedAttrs, slots);
        };
      },
    });
  }

  // @formily/antdv 缺失的 antd 组件，轻量适配为表单字段
  const Rate = connect(ARate);
  const Slider = connect(ASlider);
  const InputGroup = Space.Compact;

  return { AntdvComponents, Rate, Slider, InputGroup };
}
