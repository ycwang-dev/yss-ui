import YConfigProvider from './config-provider/index.vue';
import zhCN from './lang/zh-CN';

export { YConfigProvider };
export { default as YConfigProviderDefault } from './config-provider/index.vue';
export { useLocale, formatTemplate } from './useLocale';
export { setGlobalLocale, getGlobalLocale, LOCALE_INJECTION_KEY } from './context';
export { syncVxeLanguage } from './vxeBridge';
export { zhCN };

export type * from './types';
