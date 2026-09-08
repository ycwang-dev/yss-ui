/**
 * 复制文本到剪贴板（兼容非安全上下文）
 * @param text - 需要复制的文本
 * @returns 是否复制成功
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!text) return false;

  // 优先使用 Clipboard API（安全上下文：HTTPS / localhost）
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 可能被权限策略阻止，回退到降级方案
    }
  }

  // 降级方案：textarea + execCommand（HTTP 兼容）
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    // 隐藏 textarea，避免页面跳动
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
};
