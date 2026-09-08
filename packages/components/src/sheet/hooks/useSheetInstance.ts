import { markRaw, ref, shallowRef, watch, onBeforeUnmount } from 'vue';
import type { Ref } from 'vue';
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import type { IUniverSheetsCorePresetConfig } from '@univerjs/presets/preset-sheets-core';
import sheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN';
import sheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US';
import sheetsCoreZhTW from '@univerjs/presets/preset-sheets-core/locales/zh-TW';
import { DEFAULT_CONFIG } from '../constant';
import type { YSheetExtraLocales, YSheetExtraPlugin } from '../constant';

/**
 * Univer 实例管理 Hook
 */
export const useSheetInstance = (options: {
  container: Ref<HTMLElement | null>;
  locale: Ref<string>;
  darkMode: Ref<boolean>;
  config: Ref<Partial<IUniverSheetsCorePresetConfig> | undefined>;
  extraPresets: Ref<any[]>;
  extraPlugins: Ref<YSheetExtraPlugin[]>;
  extraLocales: Ref<YSheetExtraLocales>;
}) => {
  const univerAPI = shallowRef<any>(null);
  const univer = shallowRef<any>(null);
  const initializing = ref(false);
  const initError = shallowRef<Error | null>(null);

  /**
   * 统一初始化异常类型，便于组件层展示和事件透出。
   *
   * @param error 原始异常对象
   * @returns 标准 Error 实例
   */
  const normalizeError = (error: unknown): Error => {
    return error instanceof Error ? error : new Error(String(error));
  };

  /**
   * 获取当前语言对应的扩展语言包。
   *
   * @param localeType Univer 内部语言枚举值
   * @returns 可传入 mergeLocales 的语言包数组
   */
  const getExtraLocalePacks = (localeType: LocaleType, locale: string) => {
    const extraLocales = options.extraLocales.value ?? {};
    const localeKeys = [localeType, locale];
    const matchedLocale = localeKeys.map(key => extraLocales[key]).find(Boolean);

    if (!matchedLocale) {
      return [];
    }
    return Array.isArray(matchedLocale) ? matchedLocale : [matchedLocale];
  };

  /** 标准语言代码映射为引擎枚举，繁体使用独立词典。 */
  const resolveLocaleType = (locale: string): LocaleType =>
    locale === 'en-US' ? LocaleType.EN_US : locale === 'zh-TW' ? LocaleType.ZH_TW : LocaleType.ZH_CN;

  /**
   * 初始化 Univer 实例
   */
  const initUniver = () => {
    if (!options.container.value || univerAPI.value || initializing.value) return;

    initializing.value = true;
    initError.value = null;
    try {
      const localeType = resolveLocaleType(options.locale.value);
      /** 所有已支持语言注册到同一实例，切换不销毁工作簿、选区和撤销栈。 */
      const locales = {
        [LocaleType.ZH_CN]: mergeLocales(sheetsCoreZhCN, ...getExtraLocalePacks(LocaleType.ZH_CN, 'zh-CN')),
        [LocaleType.ZH_TW]: mergeLocales(sheetsCoreZhTW, ...getExtraLocalePacks(LocaleType.ZH_TW, 'zh-TW')),
        [LocaleType.EN_US]: mergeLocales(sheetsCoreEnUS, ...getExtraLocalePacks(LocaleType.EN_US, 'en-US')),
      };

      const { univer: _univer, univerAPI: _univerAPI } = createUniver({
        darkMode: options.darkMode.value,
        locale: localeType,
        locales,
        presets: [
          UniverSheetsCorePreset({
            container: options.container.value,
            ...DEFAULT_CONFIG,
            ...options.config.value,
          }),
          ...options.extraPresets.value,
        ],
        plugins: options.extraPlugins.value.filter(Boolean),
      });

      univer.value = markRaw(_univer);
      univerAPI.value = markRaw(_univerAPI);
    } catch (error) {
      const normalizedError = normalizeError(error);
      initError.value = normalizedError;
      console.error('[YSheet] Failed to initialize Univer:', normalizedError);
    } finally {
      initializing.value = false;
    }
  };

  /**
   * 销毁实例
   */
  const dispose = () => {
    if (!univerAPI.value && !univer.value) {
      initializing.value = false;
      return;
    }

    try {
      univerAPI.value?.dispose?.();
      univer.value?.dispose?.();
    } catch (error) {
      console.error('[YSheet] Failed to dispose Univer:', error);
    } finally {
      initializing.value = false;
      univerAPI.value = null;
      univer.value = null;
    }
  };

  // 监听容器变化，自动初始化
  watch(
    () => options.container.value,
    newVal => {
      if (newVal && !univerAPI.value) {
        initUniver();
      }
    },
    { immediate: true }
  );

  /**
   * 监听 darkMode 变化，动态切换 Univer 暗色模式
   * 通过 Univer Facade API (toggleDarkMode) 实现运行时主题切换
   */
  watch(
    () => options.darkMode.value,
    isDark => {
      if (univerAPI.value) {
        univerAPI.value.toggleDarkMode(isDark);
      }
    }
  );

  /** Facade 原生热更新语言，避免通过重新创建实例丢失编辑状态。 */
  watch(options.locale, locale => {
    univerAPI.value?.setLocale(resolveLocaleType(locale));
  });

  // 组件卸载时清理
  onBeforeUnmount(() => {
    dispose();
  });

  return {
    univerAPI,
    univer,
    initializing,
    initError,
    initUniver,
    dispose,
  };
};
