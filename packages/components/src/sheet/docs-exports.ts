/**
 * 文档站 Sheet 专用入口：组件与 Univer Preset 运行时代码保持在同一 chunk，
 * 避免 docs-entry 异步加载 YSheet 时出现 @univerjs 重复打包。
 */
export { default as YSheet } from './index.vue';
export {
  LocaleType,
  UniverPresetSheetsDataValidationZhCN,
  UniverPresetSheetsDrawingZhCN,
  UniverPresetSheetsFilterZhCN,
  UniverSheetsDataValidationPreset,
  UniverSheetsDrawingPreset,
  UniverSheetsFilterPreset,
} from './constant';
export type {
  IUniverSheetsCorePresetConfig,
  IWorkbookData,
  LocaleTypeString,
  YSheetEmits,
  YSheetExpose,
  YSheetExtraLocales,
  YSheetExtraPlugin,
  YSheetProps,
} from './constant';
