import { ref, watch, computed, type ComputedRef } from 'vue';

type RequiredFieldNames = { title: string; key: string; children: string };

interface UseTreeSearchProps {
  filterable?: boolean;
  searchValue?: string;
  treeData?: any[];
}

interface UseTreeSearchEmits {
  (e: 'update:searchValue', value: string): void;
}

/**
 * 树组件搜索功能 Hook
 * @param props - 组件 props
 * @param emit - 事件发射器
 * @param fieldNames - 字段名称配置
 * @returns 内部搜索值和过滤后的可见数据源
 */
export const useTreeSearch = (
  props: UseTreeSearchProps,
  emit: UseTreeSearchEmits,
  fieldNames: ComputedRef<RequiredFieldNames>
) => {
  const internalSearch = ref<string>(props.searchValue || '');

  // 监听外部 searchValue 变化
  watch(
    () => props.searchValue,
    v => {
      internalSearch.value = v || '';
    }
  );

  // 监听内部搜索值变化，同步到外部
  watch(internalSearch, v => {
    emit('update:searchValue', v);
  });

  /**
   * 过滤树节点数据
   * @param data - 原始树数据
   * @param keyword - 搜索关键词
   * @param f - 字段名称配置
   * @returns 过滤后的树数据
   */
  const filterNodes = (data: any[], keyword: string, f: RequiredFieldNames): any[] => {
    if (!keyword) {
      return data;
    }

    const match = (text: any): boolean => {
      return String(text || '')
        .toLowerCase()
        .includes(keyword.toLowerCase());
    };

    const recur = (list: any[]): any[] => {
      return list
        .map(item => {
          const children = Array.isArray(item[f.children]) ? recur(item[f.children]) : [];
          const hit = match(item[f.title]);
          if (hit || children.length) {
            return { ...item, [f.children]: children };
          }
          return null;
        })
        .filter((item): item is any => item !== null);
    };

    return recur(data);
  };

  // 可见数据源（已按关键词过滤）
  const visibleSource = computed<any[]>(() => {
    const f = fieldNames.value;
    if (!props.filterable) {
      return props.treeData || [];
    }
    return filterNodes(props.treeData || [], internalSearch.value, f);
  });

  return {
    internalSearch,
    visibleSource,
  };
};
