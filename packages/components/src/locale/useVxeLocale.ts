import { watch } from 'vue';
import { useLocale } from './useLocale';
import { syncVxeLanguage } from './vxeBridge';

/** 表格挂载时自动同步底层词典，组件卸载时由 Vue 停止监听。 */
export const useVxeLocale = (): void => {
  const { localeName } = useLocale();
  watch(localeName, locale => syncVxeLanguage(locale), { immediate: true });
};
