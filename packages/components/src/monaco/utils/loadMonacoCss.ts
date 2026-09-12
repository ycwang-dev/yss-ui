let monacoCssLoaded = false;
let monacoCssPromise: Promise<any> | null = null;

/**
 * 动态按需加载 Monaco Editor 核心 CSS 样式。
 * 避免在组件顶层静态引入造成未引用 Monaco 的页面被注入样式副作用或拖慢首屏。
 */
export const ensureMonacoCss = async (): Promise<void> => {
  if (monacoCssLoaded || typeof document === 'undefined') return;
  if (!monacoCssPromise) {
    monacoCssPromise = import('monaco-editor/min/vs/editor/editor.main.css')
      .then(() => {
        monacoCssLoaded = true;
      })
      .catch(error => {
        console.warn('[YSS-UI] Monaco 核心样式动态加载失败:', error);
      });
  }
  return monacoCssPromise;
};
