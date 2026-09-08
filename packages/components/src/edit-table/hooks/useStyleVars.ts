import { computed } from 'vue';

export function useStyleVars(xTableProps: any) {
  const wrapperStyleVars = computed(() => {
    const h = ((xTableProps.value?.cellConfig as any)?.height ?? 36) as number;
    return { '--rowHeight': `${h}px`, '--headerHeight': `${h}px` } as Record<string, string>;
  });
  return { wrapperStyleVars };
}
