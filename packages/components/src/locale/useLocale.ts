import { computed, inject } from 'vue';
import { globalLocaleRef, LOCALE_INJECTION_KEY } from './context';
import zhCN from './lang/zh-CN';
import type { YssLocale, YssLocaleName } from './types';

/** 只读取词典自身路径，避免对象原型或非字符串结果被作为文案。 */
const readMessage = (messages: unknown, path: string): string | undefined => {
  let value = messages;
  for (const key of path.split('.')) {
    if (!value || typeof value !== 'object' || !Object.prototype.hasOwnProperty.call(value, key)) return;
    value = (value as Record<string, unknown>)[key];
  }
  return typeof value === 'string' ? value : undefined;
};

/**
 * 模板字符串参数替换
 * @example format('是否确认{action}此条数据？', { action: '删除' }) => '是否确认删除此条数据？'
 */
export const formatTemplate = (template: string, params?: Record<string, string | number>): string => {
  if (!params || typeof template !== 'string') return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
};

/**
 * 获取当前环境生效的 YSS UI 语言配置与翻译方法
 *
 * @param componentName 可选的组件命名空间（如 'table' | 'formily' | 'fileImport' 等）
 */
export function useLocale<K extends keyof Omit<YssLocale, 'name'>>(componentName?: K) {
  const contextLocaleRef = inject(LOCALE_INJECTION_KEY, null);

  const currentLocale = computed<YssLocale>(() => {
    return contextLocaleRef?.value ?? globalLocaleRef.value ?? zhCN;
  });

  const localeName = computed<YssLocaleName>(() => {
    return currentLocale.value.name;
  });

  const messages = computed(() => {
    if (!componentName) return currentLocale.value;
    return currentLocale.value[componentName] ?? zhCN[componentName];
  });

  /**
   * 翻译方法
   * @param path 词条键名。支持当前组件命名空间下的键名，也支持 common 命名空间下的通用键
   * @param params 插值变量，如 { action: '删除' }
   */
  const t = (path: string, params?: Record<string, string | number>): string => {
    const message =
      readMessage(componentName ? currentLocale.value[componentName] : currentLocale.value, path) ??
      readMessage(currentLocale.value.common, path) ??
      readMessage(componentName ? zhCN[componentName] : zhCN, path) ??
      readMessage(zhCN.common, path);
    return message === undefined ? path : formatTemplate(message, params);
  };

  return {
    currentLocale,
    localeName,
    messages,
    t,
  };
}
