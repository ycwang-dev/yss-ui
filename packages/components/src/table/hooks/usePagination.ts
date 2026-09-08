import { computed, ref, watch } from 'vue';
import { useLocale } from '../../locale/useLocale';
import type { YTablePagination } from '../type';
import { DEFAULT_PAGINATION } from '../type';

export function usePagination(props: { pageable: boolean; pagination: YTablePagination; data: any[] }, emit: any) {
  const { t } = useLocale('table');
  const innerPagination = ref<YTablePagination>({ ...DEFAULT_PAGINATION, ...props.pagination });

  watch(
    () => props.pagination,
    val => {
      innerPagination.value = { ...innerPagination.value, ...val };
    },
    { deep: true }
  );

  // 未显式设置 remote 时，若提供了 total>0，则自动认为是远程分页（不进行前端 slice）
  const isRemote = computed<boolean>(() => {
    const remoteFlag = innerPagination.value.remote;
    if (typeof remoteFlag === 'boolean') return remoteFlag;
    const total = innerPagination.value.total;
    return typeof total === 'number' && total > 0;
  });

  const computedTotal = computed(() => {
    return props.pageable && !isRemote.value ? props.data.length : innerPagination.value.total || 0;
  });

  const displayData = computed(() => {
    if (!props.pageable) return props.data;
    if (isRemote.value) return props.data;
    const current = innerPagination.value.current ?? DEFAULT_PAGINATION.current ?? 1;
    const pageSize = innerPagination.value.pageSize ?? DEFAULT_PAGINATION.pageSize ?? 10;
    const start = (current - 1) * pageSize;
    return props.data.slice(start, start + pageSize);
  });

  const updatePagination = (partial: Partial<YTablePagination>) => {
    innerPagination.value = { ...innerPagination.value, ...partial } as YTablePagination;
    emit('update:pagination', innerPagination.value);
  };

  const handleAntdChange = (page: number, pageSize: number) => {
    const changedSize = pageSize !== innerPagination.value.pageSize;
    // 如果修改了 pageSize，固定将页码重置为 1
    const current = changedSize ? 1 : page;

    updatePagination({ current, pageSize });
    emit('page-change', { current, pageSize });
    if (changedSize) emit('size-change', pageSize);
  };

  const resolvedPagination = computed(() => {
    const p = innerPagination.value;
    const hasCustomShowTotal = props.pagination?.showTotal !== undefined;
    return {
      ...p,
      showTotal: hasCustomShowTotal ? p.showTotal : (total: number) => t('total', { total }),
    };
  });

  return { innerPagination, resolvedPagination, computedTotal, displayData, updatePagination, handleAntdChange };
}
