/**
 * 文件下载相关工具函数
 */

interface MSNavigator extends Navigator {
  msSaveBlob?: (blob: Blob, defaultName?: string) => boolean;
}

/**
 * @description 将二进制流下载为文件（现代浏览器 + IE10+ 兼容）
 * @param stream 文件流数据
 * @param fileName 下载文件名（包含后缀）
 */
export const downloadFileStream = (stream: BlobPart, fileName: string): void => {
  const blob = new Blob([stream]);
  const anchor = document.createElement('a');
  const canDownload = 'download' in anchor;

  if (canDownload) {
    anchor.download = fileName;
    anchor.style.display = 'none';
    anchor.href = URL.createObjectURL(blob);
    document.body.appendChild(anchor);
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    document.body.removeChild(anchor);
    return;
  }

  const msNavigator = navigator as MSNavigator;
  if (msNavigator.msSaveBlob) {
    msNavigator.msSaveBlob(blob, fileName);
  }
};

/**
 * @description 从 Content-Disposition 提取文件名
 * @param contentDisposition 响应头 content-disposition
 */
export const getFileNameFromContentDisposition = (contentDisposition?: string): string | null => {
  if (!contentDisposition) return null;

  // 1. 优先匹配 RFC 5987 规范的 filename* (UTF-8 编码)
  // 这种格式通常是 filename*=utf-8''encoded_name
  const utf8Match = contentDisposition.match(/filename\*=utf-8''([^;]+)/i);
  if (utf8Match && utf8Match[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  // 2. 兜底匹配普通的 filename=
  // 匹配带引号或不带引号的文件名
  const match = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (match && match[1]) {
    const raw = match[1].trim().replace(/^"|"$/g, '');
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  return null;
};

/**
 * @description 处理 API 返回的 blob 响应并触发下载
 * @param data Blob 数据
 * @param headers 响应头（支持 AxiosHeaders 对象，内部自动处理大小写）
 * @param _hasUtf8Encoding (已弃用) 内部自动识别，无需传值
 */
export const handleBlobResponse = (
  data: BlobPart,
  headers: Record<string, string>,
  _hasUtf8Encoding: boolean = false
): void => {
  try {
    let fileName = 'download';
    // 兼容 AxiosHeaders 和普通对象，优先查找 content-disposition
    const headerKey = Object.keys(headers || {}).find(k => k.toLowerCase() === 'content-disposition');
    const contentDisposition = headerKey ? headers[headerKey] : undefined;

    const extracted = getFileNameFromContentDisposition(contentDisposition);
    if (extracted) fileName = extracted;

    downloadFileStream(data, fileName);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error handling blob response:', error);
  }
};

/**
 * @description 直接从 URL 下载文件（支持自定义文件名）
 * @param url 文件 URL（支持 http(s)、data:）
 * @param fileName 可选的下载文件名（未提供时由浏览器决定）
 */
export const downloadFileFromUrl = (url: string, fileName?: string): void => {
  const link = document.createElement('a');
  link.href = url;
  if (fileName) link.download = fileName;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
