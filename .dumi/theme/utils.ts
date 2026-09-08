/**
 * 将相对根路径资源解析为包含 base path 的绝对路径
 */
export const toAssetUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const base = typeof process !== 'undefined' && process.env.DOCS_BASE_PATH ? process.env.DOCS_BASE_PATH : '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  return `${cleanBase}${cleanPath}`;
};
