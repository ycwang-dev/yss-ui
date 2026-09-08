import { computed, ref, watch } from 'vue';

export function usePagination(props: any, emit: any) {
  const innerPagination = ref({ ...props.pagination });

  watch(
    () => props.pagination,
    v => {
      innerPagination.value = { ...innerPagination.value, ...v };
    },
    { deep: true }
  );

  const computedTotal = computed(() =>
    props.pageable && !innerPagination.value.remote ? props.data.length : innerPagination.value.total || 0
  );

  const displayData = computed(() => {
    if (!props.pageable) return props.data;
    if (innerPagination.value.remote) return props.data;
    const { current, pageSize } = innerPagination.value;
    const start = (current - 1) * pageSize;
    return props.data.slice(start, start + pageSize);
  });

  const updatePagination = (p: Partial<{ current: number; pageSize: number }>) => {
    innerPagination.value = { ...innerPagination.value, ...p };
    emit('page-change', { current: innerPagination.value.current, pageSize: innerPagination.value.pageSize });
  };
  const handleAntdChange = (page: number, pageSize: number) => {
    const changed = pageSize !== innerPagination.value.pageSize;
    updatePagination({ current: page, pageSize });
    if (changed) emit('size-change', pageSize);
  };
  const handleAntdShowSizeChange = (_: number, size: number) => handleAntdChange(1, size);

  return { innerPagination, computedTotal, displayData, updatePagination, handleAntdChange, handleAntdShowSizeChange };
}
