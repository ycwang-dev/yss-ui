import { setValidateLanguage } from '@formily/validator';
import type { Form } from '@formily/core';
import { watch, type ComputedRef } from 'vue';
import { useLocale } from '../../locale/useLocale';

/** 同步 Formily 内置校验词典，只刷新已显示的校验错误，保留表单实例与输入。 */
export const useFormilyLocale = (form: ComputedRef<Form>): void => {
  const { localeName } = useLocale();
  watch(
    localeName,
    locale => {
      setValidateLanguage(locale);
      form.value.query('*').forEach(field => {
        if ('validate' in field && field.errors.length > 0) {
          Promise.resolve(field.validate()).catch(() => {
            /** 校验不通过是表单状态，错误由字段反馈区域展示。 */
          });
        }
      });
    },
    { immediate: true }
  );
};
