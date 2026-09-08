import { createForm } from '@formily/core';
import { computed, toRaw, watch } from 'vue';

type AnyObject = Record<string, any>;

export interface UseFormilyFormOptions {
  initialValues?: AnyObject;
  readPretty?: boolean;
  mode?: number;
  form?: ReturnType<typeof createForm>;
}

/**
 * 管理 form 实例创建/复用、只读态同步以及常用方法导出。
 */
export function useFormilyForm(options: UseFormilyFormOptions) {
  /** 自建表单按需创建一次，支持外部 Form 移除后回到内部模式。 */
  let ownedForm: ReturnType<typeof createForm> | undefined;
  const innerForm = computed(() => {
    if (options.form) return options.form;
    ownedForm ??= createForm({
      values: options.initialValues || {},
      initialValues: options.initialValues || {},
      readPretty: options.mode === 2 ? true : !!options.readPretty,
    });
    return ownedForm;
  });

  const getValues = () => toRaw(innerForm.value.values);
  const setValues = (values: AnyObject) => innerForm.value.setValues(values);
  const submit = async () => innerForm.value.submit();
  const setFieldState = (...args: any[]) => (innerForm.value as any).setFieldState?.(...args);

  // 当 readPretty 改变时，同步到 form
  watch(
    () => options.readPretty,
    v => {
      if (innerForm.value) innerForm.value.setInitialValues?.(innerForm.value.values);
      (innerForm.value as any).readPretty = v;
    }
  );

  // 当 mode 改变时，同步只读态
  watch(
    () => options.mode,
    m => {
      (innerForm.value as any).readPretty = m === 2 ? true : !!options.readPretty;
    }
  );

  return { innerForm, getValues, setValues, submit, setFieldState };
}
