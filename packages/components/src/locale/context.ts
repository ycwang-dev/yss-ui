import { shallowRef, type InjectionKey, type Ref } from 'vue';
import zhCN from './lang/zh-CN';
import enUS from './lang/en-US';
import zhTW from './lang/zh-TW';
import type { YssLocale, YssLocaleName } from './types';

/**
 * 组件库内置语言包映射字典
 */
export const BUILTIN_LOCALES: Record<string, YssLocale> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS,
};

/**
 * YSS UI 国际化 Provide/Inject 注入标识
 */
export const LOCALE_INJECTION_KEY: InjectionKey<Ref<YssLocale>> = Symbol('YssLocaleContext');

/**
 * 全局默认语言单例（默认简体中文）
 */
export const globalLocaleRef = shallowRef<YssLocale>(zhCN);

/**
 * 设置全局单例语言（适用于未被 YConfigProvider 包裹或脱离 Vue 树的场景）
 * 支持直接传入标准语言代码（如 'zh-CN' | 'en-US' | 'zh-TW'），也可传入自定义语言包对象
 * @param locale 目标语言包或标准语言代码标识
 */
export const setGlobalLocale = (locale: YssLocale | YssLocaleName | string): void => {
  if (!locale) return;
  if (typeof locale === 'string') {
    globalLocaleRef.value = Object.prototype.hasOwnProperty.call(BUILTIN_LOCALES, locale)
      ? BUILTIN_LOCALES[locale]
      : BUILTIN_LOCALES['zh-CN'];
    return;
  }
  globalLocaleRef.value = locale;
};

/**
 * 获取当前全局单例语言
 */
export const getGlobalLocale = (): YssLocale => {
  return globalLocaleRef.value;
};
