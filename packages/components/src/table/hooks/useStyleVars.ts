import { computed } from 'vue';

export function useStyleVars(props: any) {
  const wrapperStyleVars = computed(() => {
    const rowHeight = ((props as any).cellConfig?.height ?? 36) as number;
    const headerHeight = (props as any).headerHeight as number | undefined;
    return {
      '--rowHeight': `${rowHeight}px`,
      '--headerHeight': `${typeof headerHeight === 'number' ? headerHeight : rowHeight}px`,
    } as Record<string, string>;
  });
  return { wrapperStyleVars };
}
