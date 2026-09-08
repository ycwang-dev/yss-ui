import type { IWorkbookData } from '@univerjs/presets';
import { LocaleType } from '@univerjs/presets';
import type { IUniverSheetsCorePresetConfig } from '@univerjs/presets/preset-sheets-core';
export { UniverSheetsFilterPreset } from '@univerjs/preset-sheets-filter';
export { default as UniverPresetSheetsFilterZhCN } from '@univerjs/preset-sheets-filter/locales/zh-CN';
export { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation';
export { default as UniverPresetSheetsDataValidationZhCN } from '@univerjs/preset-sheets-data-validation/locales/zh-CN';
export { UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing';
export { default as UniverPresetSheetsDrawingZhCN } from '@univerjs/preset-sheets-drawing/locales/zh-CN';

// 重新导出 IWorkbookData 类型和 LocaleType 枚举，使其能通过 @yss-ui/components 导出
export type { IWorkbookData };
export { LocaleType };

/**
 * Locale 类型
 */
export type LocaleTypeString = 'zh-CN' | 'zh-TW' | 'en-US';

/**
 * Locale 映射
 */
export const LOCALE_MAP = {
  'zh-CN': 'ZH_CN',
  'zh-TW': 'ZH_TW',
  'en-US': 'EN_US',
} as const;

export type { IUniverSheetsCorePresetConfig };

/**
 * YSheet 扩展语言包配置
 */
export type YSheetExtraLocales = Record<string, unknown | unknown[]>;

/**
 * YSheet 扩展插件配置
 */
export type YSheetExtraPlugin = any;

/**
 * 默认工作簿配置
 */
export const DEFAULT_WORKBOOK_DATA: Partial<IWorkbookData> = {
  name: '新建工作簿',
  locale: LocaleType.ZH_CN,
  sheetOrder: ['sheet-01'],
  sheets: {
    'sheet-01': {
      id: 'sheet-01',
      name: 'Sheet1',
      rowCount: 100,
      columnCount: 26,
      cellData: {},
    },
  },
};

/**
 * 默认功能配置
 */
/**
 * 默认基础配置 (Header/Toolbar/Footer 等默认开启)
 */
export const DEFAULT_CONFIG: Partial<IUniverSheetsCorePresetConfig> = {
  header: true,
  toolbar: true,
  footer: {}, // footer cannot be true, must be object or false
  contextMenu: true,
  formulaBar: true,
};

/**
 * YSheet Props 类型定义
 */
export interface YSheetProps {
  /**
   * 工作簿数据
   */
  modelValue?: IWorkbookData | null;
  /**
   * 容器高度
   * @default '100%'
   */
  height?: string | number;
  /**
   * 语言配置
   * @default 继承 YConfigProvider 或全局语言
   */
  locale?: LocaleTypeString;
  /**
   * 是否启用暗黑模式
   * 不传时自动从文档站暗色状态中读取（inject）
   * @default undefined
   */
  darkMode?: boolean;
  /**
   * 功能配置
   */
  /**
   * 只读模式
   * @default false
   */
  readonly?: boolean;
  /**
   * 扩展 Presets
   */
  extraPresets?: any[];
  /**
   * 额外插件
   */
  extraPlugins?: YSheetExtraPlugin[];
  /**
   * 额外语言包，会按当前 locale 与核心语言包合并
   */
  extraLocales?: YSheetExtraLocales;
  /**
   * Univer 核心插件通用配置
   * 支持所有 UniverSheetsCorePresetConfig 配置项
   * (将与默认配置合并，config 优先级最高)
   */
  config?: Partial<IUniverSheetsCorePresetConfig>;
}

/**
 * YSheet Emits 类型定义
 */
export interface YSheetEmits {
  /**
   * 数据变化事件
   */
  (e: 'update:modelValue', value: IWorkbookData): void;
  /**
   * 工作簿创建完成
   */
  (e: 'workbook-created', workbook: any): void;
  /**
   * 错误回调
   */
  (e: 'error', error: Error): void;
}

/**
 * YSheet 暴露方法类型定义
 */
export interface YSheetExpose {
  /**
   * 获取 Univer Facade API 实例
   */
  getUniverAPI: () => any | null;
  /**
   * 获取当前工作簿
   */
  getWorkbook: () => any;
  /**
   * 保存数据
   */
  save: () => IWorkbookData | null;
  /**
   * 重新加载数据
   */
  reload: (data?: IWorkbookData | null) => void;
  /**
   * 销毁实例
   */
  dispose: () => void;
}
