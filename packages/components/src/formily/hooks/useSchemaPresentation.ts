import { Schema, type ISchema } from '@formily/json-schema';
import type { Form } from '@formily/core';
import { watch, type ComputedRef } from 'vue';

/** 仅更新 Schema 中实际变化的展示属性，保留 effects 注入的其它属性。 */
const changedProps = (
  next: Record<string, unknown> = {},
  previous: Record<string, unknown> = {}
): Record<string, unknown> =>
  Object.fromEntries(
    Object.keys({ ...previous, ...next })
      .filter(key => next[key] !== previous[key])
      .map(key => [key, next[key]])
  );

/** 只替换已有校验器中的消息或原有函数，保留运行时额外加入的规则。 */
const translateValidator = (current: any, before: any, next: any): any => {
  const replacements = new Map<unknown, unknown>();
  const collect = (oldValue: any, newValue: any, key = ''): void => {
    if (typeof oldValue === 'function' || (key === 'message' && typeof oldValue === 'string')) {
      if (oldValue !== newValue && newValue !== undefined) replacements.set(oldValue, newValue);
    } else if (oldValue && typeof oldValue === 'object') {
      Object.keys(oldValue).forEach(name => collect(oldValue[name], newValue?.[name], name));
    }
  };
  collect(before, next);
  const replace = (value: any): any => {
    if (replacements.has(value)) return replacements.get(value);
    if (Array.isArray(value)) return value.map(replace);
    if (value && Object.getPrototypeOf(value) === Object.prototype)
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replace(item)]));
    return value;
  };
  return replace(current);
};

/** 同步现有字段的展示和校验配置，不重建字段、不写 values/default/visible 等业务状态。 */
export const syncSchemaPresentation = (
  form: Form,
  next: ISchema,
  previous: ISchema,
  scope: Record<string, unknown> = {}
): void => {
  const visit = (schema: Schema, before: Schema | undefined, address: string[]): void => {
    if (before && address.length) {
      form.query(address.join('.')).forEach(field => {
        const compile = (value: unknown): any =>
          Schema.compile(value, { ...scope, $form: form, $values: form.values, $field: field });
        for (const key of ['title', 'description', 'content'] as const) {
          if (schema[key === 'content' ? 'x-content' : key] !== before[key === 'content' ? 'x-content' : key]) {
            field[key] = compile(schema[key === 'content' ? 'x-content' : key]);
          }
        }
        if (schema['x-component-props'] !== before['x-component-props']) {
          field.setComponentProps(compile(changedProps(schema['x-component-props'], before['x-component-props'])));
        }
        if (schema['x-decorator-props'] !== before['x-decorator-props']) {
          field.setDecoratorProps(compile(changedProps(schema['x-decorator-props'], before['x-decorator-props'])));
        }
        if ('dataSource' in field && schema.enum !== before.enum)
          field.dataSource = (compile(schema.enum) ?? []).map((item: unknown) =>
            item && typeof item === 'object' ? item : { label: item, value: item }
          );
        if ('validator' in field && schema['x-validator'] !== before['x-validator'])
          field.validator = translateValidator(
            field.validator,
            compile(before['x-validator']),
            compile(schema['x-validator'])
          );
        if ('validate' in field && field.errors.length) {
          Promise.resolve(field.validate()).catch(() => {
            /** 错误由字段反馈展示。 */
          });
        }
      });
    }
    schema.mapProperties((child, key) => visit(child, before?.properties?.[key], [...address, String(key)]));
    if (Array.isArray(schema.items)) {
      schema.items.forEach((item, index) =>
        visit(item, Array.isArray(before?.items) ? before.items[index] : undefined, [...address, String(index)])
      );
    } else if (schema.items) {
      const oldItems = before?.items && !Array.isArray(before.items) ? before.items : undefined;
      visit(schema.items, oldItems, [...address, '*']);
    }
  };
  visit(new Schema(next), new Schema(previous), []);
};

/** 监听 Schema 引用更新，适配 Formily createField 复用实例时不刷新配置的行为。 */
export const useSchemaPresentation = (
  form: ComputedRef<Form>,
  schema: () => ISchema,
  scope: () => Record<string, unknown>
): void => {
  watch(
    schema,
    (next, previous) => {
      if (next && previous) syncSchemaPresentation(form.value, next, previous, scope());
    },
    { flush: 'post' }
  );
};
