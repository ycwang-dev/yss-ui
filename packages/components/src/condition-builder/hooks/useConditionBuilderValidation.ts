import { ref } from 'vue';
import type { Ref } from 'vue';
import type { ConditionGroup, OperatorInputKind } from '../types';

/**
 * 管理条件构造器的节点与整树校验能力。
 *
 * @param rootRef 条件树响应式引用。
 * @param getStrictMode 获取是否为严格校验模式。
 * @param getOperatorKind 获取操作符输入类型的函数。
 * @param getBetweenValues 获取区间值引用。
 * @param nestedRefs 嵌套组件实例引用。
 * @param errors 错误状态引用。
 * @returns 错误状态与校验方法。
 */
export function useConditionBuilderValidation(
  rootRef: { value: ConditionGroup },
  getStrictMode: () => boolean,
  getOperatorKind: (idx: number) => OperatorInputKind,
  getBetweenValues: () => Array<[string | undefined, string | undefined]>,
  nestedRefs: { value: any[] },
  errors: Ref<Record<string, { field?: boolean; operator?: boolean; value?: boolean }>> = ref({})
) {
  /**
   * 校验单个叶子节点。
   *
   * @param idx 节点索引。
   */
  const validateNode = (idx: number) => {
    if (!getStrictMode()) return;

    const child = rootRef.value.children[idx];
    if (!child || child.type !== 'LEAF') return;

    const leaf = child as any;
    const leafErrors: { field?: boolean; operator?: boolean; value?: boolean } = {};
    let hasError = false;

    if (!leaf.field) {
      leafErrors.field = true;
      hasError = true;
    }

    if (!leaf.operator) {
      leafErrors.operator = true;
      hasError = true;
    }

    const kind = getOperatorKind(idx);
    if (kind !== 'none') {
      if (kind === 'between') {
        const between = getBetweenValues();
        if (!between[idx]?.[0] || !between[idx]?.[1]) {
          leafErrors.value = true;
          hasError = true;
        }
      } else if (kind === 'multiple') {
        if (!leaf.value || (Array.isArray(leaf.value) && leaf.value.length === 0)) {
          leafErrors.value = true;
          hasError = true;
        }
      } else {
        // 0 是有效值
        if (!leaf.value && leaf.value !== 0) {
          leafErrors.value = true;
          hasError = true;
        }
      }
    }

    if (hasError) {
      errors.value[idx] = leafErrors;
    } else {
      delete errors.value[idx];
    }
  };

  /**
   * 验证整个条件树（包含递归子条件组）。
   *
   * @returns 是否所有条件都有效。
   */
  const validate = (): boolean => {
    errors.value = {};
    let isValid = true;

    rootRef.value.children.forEach((child, idx) => {
      if (child.type === 'LEAF') {
        validateNode(idx);
        if (errors.value[idx]) {
          isValid = false;
        }
      } else if (child.type === 'GROUP') {
        const nestedComponent = nestedRefs.value[idx];
        if (nestedComponent && nestedComponent.validate) {
          const nestedValid = nestedComponent.validate();
          if (!nestedValid) {
            isValid = false;
          }
        }
      }
    });

    return isValid;
  };

  return {
    errors,
    validateNode,
    validate,
  };
}
