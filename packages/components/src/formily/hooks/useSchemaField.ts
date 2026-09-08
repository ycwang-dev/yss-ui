import { createSchemaField } from '@formily/vue';

export interface CreateSchemaFieldOptions {
  components: Record<string, any>;
  scope: Record<string, any>;
}

/**
 * 构建 SchemaField，聚合组件与作用域。
 */
export function useSchemaField(options: CreateSchemaFieldOptions) {
  const { SchemaField } = createSchemaField({
    components: options.components,
    scope: options.scope,
  });
  return { SchemaField };
}
