/**
 * 将相对根路径资源解析为包含 base path 的绝对路径
 */
export const toAssetUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  let base =
    typeof process !== 'undefined' && (process.env.PUBLIC_PATH || process.env.DOCS_BASE_PATH)
      ? process.env.PUBLIC_PATH || process.env.DOCS_BASE_PATH
      : '';
  if (typeof base === 'string') {
    base = base.replace(/^["']|["']$/g, '').trim();
  }
  if (!base || base === '/') {
    if (typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/').filter(Boolean);
      const DOC_TOP_LEVEL_ROUTES = ['guide', 'components', 'hooks', 'utils', 'skills', 'changelog', 'resources'];
      if (parts.length > 0 && !DOC_TOP_LEVEL_ROUTES.includes(parts[0])) {
        base = `/${parts[0]}/`;
      }
    }
  }
  const cleanBase = (base || '/').endsWith('/') ? base || '/' : `${base}/`;
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  return `${cleanBase}${cleanPath}`;
};
