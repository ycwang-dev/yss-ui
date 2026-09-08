import type { Ref } from 'vue';

/**
 * 禁用 Monaco 编辑器查找框的 tooltip
 * 通过 MutationObserver 监听 DOM 变化，一旦检测到 Monaco hover 元素出现就立即删除
 */
export const useDisableFindWidgetTooltips = (_containerRef?: Ref<HTMLElement | null>) => {
  let observer: MutationObserver | null = null;

  /**
   * 初始化 MutationObserver 监听器
   */
  const init = () => {
    // 使用 MutationObserver 监听 body 下新增的 Monaco hover 元素
    observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            // 检测是否是 Monaco hover 元素，如果是则立即删除
            if (
              node.classList?.contains('monaco-hover') ||
              node.classList?.contains('monaco-editor-hover') ||
              node.querySelector?.('.monaco-hover, .monaco-editor-hover')
            ) {
              node.remove();
            }
          }
        });
      });
    });

    // 监听 body 的子节点变化
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };

  /**
   * 清理监听器资源
   */
  const dispose = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  return {
    init,
    dispose,
  };
};
