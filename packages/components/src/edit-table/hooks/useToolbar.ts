import { computed } from 'vue';

export function useToolbar(toolbarConfig?: { custom?: boolean }) {
  const toolbarConfigComputed = computed(() => {
    const cfg = toolbarConfig || { custom: false };
    return cfg.custom ? { custom: true } : undefined;
  });
  return { toolbarConfigComputed };
}
