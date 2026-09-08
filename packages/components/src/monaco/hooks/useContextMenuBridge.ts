import type { Ref } from 'vue';

/**
 * useContextMenuBridge - 兜底桥接宿主环境拦截的原生右键到 Monaco 上下文菜单
 */
export const useContextMenuBridge = (
  containerRef: Ref<HTMLDivElement | null>,
  getEditor: () => any,
  ensureContributions: () => Promise<void>
) => {
  let bound = false;

  const onNativeContextMenu = (ev: MouseEvent) => {
    const editor = getEditor?.();
    if (!editor) return;
    const el = containerRef.value;
    if (!el || !el.contains(ev.target as Node)) return;
    ev.preventDefault();
    ev.stopPropagation();
    void ensureContributions().then(() => {
      try {
        editor.focus?.();
        editor.trigger?.('yss-contextmenu', 'editor.action.showContextMenu', null);
      } catch {}
    });
  };

  const bind = () => {
    if (bound) return;
    const el = containerRef.value;
    if (!el) return;
    el.addEventListener('contextmenu', onNativeContextMenu);
    bound = true;
  };

  const unbind = () => {
    if (!bound) return;
    const el = containerRef.value;
    if (!el) return;
    el.removeEventListener('contextmenu', onNativeContextMenu);
    bound = false;
  };

  return { bind, unbind };
};
