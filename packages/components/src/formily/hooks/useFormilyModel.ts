import type { Form } from '@formily/core';
import { watch, type ComputedRef } from 'vue';
import { DETAIL_RENDER_START_MARK } from '../constants/perf';
import type { YssFormilyValues } from '../types';

/** useFormilyModel 选项。 */
export interface FormilyModelOptions {
  innerForm: ComputedRef<Form>;
  getModelValue: () => YssFormilyValues | undefined;
  getMode: () => number | undefined;
  emitModelValue: (values: YssFormilyValues) => void;
}

/**
 * 判断对象是否为空。
 * @param value 待判断对象
 * @returns 是否为空对象
 */
const isEmptyObject = (value: YssFormilyValues | null | undefined): boolean =>
  !!value && Object.keys(value).length === 0;

/**
 * 管理 YFormily v-model 的双向同步。
 * @param options 模型同步选项
 */
export const useFormilyModel = (options: FormilyModelOptions) => {
  watch(
    () => options.innerForm.value,
    (form, _, onCleanup) => {
      if (!form) return;
      const dispose = form.subscribe((payload: any) => {
        if (payload.type === 'onFormValuesChange' && options.getMode() !== 2) {
          options.emitModelValue(form.values);
        }
      });
      if (typeof dispose === 'function') onCleanup(dispose);
    },
    { immediate: true }
  );

  watch(options.getModelValue, newValue => {
    const form = options.innerForm.value;
    if (!form || newValue === undefined) return;
    if (newValue === null || isEmptyObject(newValue)) {
      form.reset?.('*', { forceClear: true });
      return;
    }
    if (newValue === form.values) return;
    if (options.getMode() === 2 && typeof window !== 'undefined' && window.performance) {
      window.performance.mark(DETAIL_RENDER_START_MARK);
    }
    form.setValues(newValue, 'overwrite');
  });
};
