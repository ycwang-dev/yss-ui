import { computed, type ComputedRef } from 'vue';
import type { YTableColumn } from '../type';

const hasOwn = Object.prototype.hasOwnProperty;

const isSafePlainObject = (value: unknown): value is Record<string, any> => {
  return (
    Object.prototype.toString.call(value) === '[object Object]' && Object.getPrototypeOf(value) === Object.prototype
  );
};

/**
 * 数据安全处理：确保所有列定义的字段在数据对象中都存在
 * 避免 vxe-table 在访问不存在的字段时抛出异常
 */
export function useSafeData(dataRef: ComputedRef<any[]>, columnsRef: ComputedRef<YTableColumn[]>): ComputedRef<any[]> {
  const fields = computed(() => extractFields(columnsRef.value));

  return computed(() => {
    const data = dataRef.value;
    if (!Array.isArray(data) || data.length === 0) return data;

    let nextData: any[] | null = null;

    data.forEach((item, index) => {
      const safeItem = normalizeRow(item, fields.value);

      if (nextData) {
        nextData.push(safeItem);
        return;
      }

      if (safeItem !== item) {
        nextData = data.slice(0, index);
        nextData.push(safeItem);
      }
    });

    return nextData || data;
  });
}

/**
 * 递归提取所有列的字段名（包括分组列）
 */
function extractFields(columns: YTableColumn[]): string[] {
  const fields = new Set<string>();

  columns.forEach(column => {
    // 跳过特殊列类型
    if (
      column.type === 'seq' ||
      column.type === 'checkbox' ||
      column.type === 'radio' ||
      column.type === 'expand' ||
      column.type === 'action'
    ) {
      return;
    }

    // 添加字段名
    if (column.field) {
      fields.add(column.field as string);
    }

    // 递归处理分组列
    if (column.children && column.children.length > 0) {
      extractFields(column.children as YTableColumn[]).forEach(field => fields.add(field));
    }
  });

  return [...fields];
}

function normalizeRow(item: any, fields: string[]) {
  const safeSource = isSafePlainObject(item) ? item : Object.assign({}, item);
  const needsClone = safeSource !== item;

  if (fields.length === 0) {
    return needsClone ? safeSource : item;
  }

  let nextRow: Record<string, any> | null = needsClone ? safeSource : null;

  fields.forEach(field => {
    const target = nextRow || safeSource;
    if (hasOwn.call(target, field)) return;

    const normalizedRow = nextRow ?? { ...safeSource };
    normalizedRow[field] = undefined;
    nextRow = normalizedRow;
  });

  return nextRow || item;
}
