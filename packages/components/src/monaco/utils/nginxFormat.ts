/**
 * 尝试格式化 Nginx 配置。
 * @param text 原始 Nginx 配置
 * @returns 格式化后的配置；解析失败时返回 null
 */
export const tryFormatNginx = async (text: string): Promise<string | null> => {
  if (!text) return text as unknown as string;

  try {
    const prettier = await import('prettier/standalone');
    const nginxPluginModule = await import('prettier-plugin-nginx');
    const nginxPlugin = (nginxPluginModule as any).default ?? nginxPluginModule;
    const formatted = await prettier.format(text, {
      parser: 'nginx',
      plugins: [nginxPlugin],
      tabWidth: 2,
      useTabs: false,
    });

    return formatted;
  } catch {
    return null;
  }
};
