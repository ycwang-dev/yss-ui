import { useField, useForm } from '@formily/vue';
import { defineComponent, inject, provide, useSlots } from 'vue';

export const SLOTS_KEY = Symbol('YSS_FORMILY_SLOTS');

/**
 * 注入根插槽，供 SlotRenderer 使用。
 */
export function provideRootSlots() {
  const rootSlots = useSlots();
  provide(SLOTS_KEY, rootSlots);
}

/**
 * Slot 渲染器：让 schema 中的 { 'x-component': 'Slot', 'x-component-props': { name, params } }
 * 能调用到 <YFormily> 的具名插槽，例如 <template #customField="{ value, onChange }">...</template>
 *
 * 默认传递的参数（无需配置 params）：
 * - 'value': 当前字段的值 (field.value)
 * - 'onChange': 字段值更新函数 (包装 field.onInput)
 *
 * 可选 params 配置：
 * - 'field': 传递整个 field 对象
 * - '$values' / 'values': 传递整个表单的值对象
 * - 其他: 从 field.props 中读取
 */
export const SlotRenderer = defineComponent({
  name: 'YssFormilySlot',
  inheritAttrs: false,
  props: {
    name: { type: String, required: true },
    params: { type: Array as unknown as () => string[], default: (): string[] => [] },
  },
  setup(props) {
    const slots = inject<any>(SLOTS_KEY, null);
    const field = useField();
    const form = useForm();
    return () => {
      const render = slots?.[props.name];
      if (!render) return null;
      const values = (form as any)?.value?.values ?? (form as any)?.values ?? {};
      const fieldRef = (field?.value ?? field) as any;

      // 默认始终传递 value 和 onChange，无需配置 params
      const scope: Record<string, any> = {
        value: fieldRef?.value,
        onChange: (val: any) => {
          fieldRef?.onInput?.(val);
        },
      };

      // 处理额外的 params 配置
      for (const p of props.params || []) {
        if (p === 'field') {
          scope.field = fieldRef;
        } else if (p === 'value' || p === 'onChange') {
          // 已经在默认 scope 中了，跳过
          continue;
        } else if (p === '$values' || p === 'values') {
          scope.values = values;
        } else {
          scope[p] = fieldRef?.props?.[p];
        }
      }
      return render(scope);
    };
  },
});
