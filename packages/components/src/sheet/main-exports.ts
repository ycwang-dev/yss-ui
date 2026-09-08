/**
 * 主入口可安全同步加载的 Sheet 相关导出。
 * 不从 @univerjs 做运行时 import，避免 optionalDependencies 安装失败时拖垮整个组件库入口。
 */
import { defineAsyncComponent } from 'vue';

/**
 * 与 @univerjs/presets 的 LocaleType 枚举值对齐（Univer 0.25）
 */
export enum LocaleType {
  ZH_CN = 'zhCN',
  EN_US = 'enUS',
}

export type LocaleTypeString = 'zh-CN' | 'en-US';

/** YSheet 异步组件：仅在实际使用时才加载 Univer 运行时 */
export const YSheet: (typeof import('./index.vue'))['default'] = defineAsyncComponent(() => import('./index.vue'));

export type {
  IUniverSheetsCorePresetConfig,
  IWorkbookData,
  YSheetEmits,
  YSheetExpose,
  YSheetExtraLocales,
  YSheetExtraPlugin,
  YSheetProps,
} from './constant';
