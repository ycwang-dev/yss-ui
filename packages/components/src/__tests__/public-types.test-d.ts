import type {
  AuthorityDropdownItem,
  AuthorityDropdownProps,
  SqlSchema,
  FileImportTexts,
  ImportResult,
  YEchartsExpose,
  YEchartsProps,
  YMonacoDiffExpose,
  YMonacoDiffProps,
  YMonacoExpose,
  YMonacoProps,
  YFileImportProps,
} from '../index';

/** 组件包入口必须持续导出权限下拉文档公开的类型。 */
export type PublicAuthorityTypes = [AuthorityDropdownProps, AuthorityDropdownItem];

/** 组件包入口必须持续导出文档公开的 ECharts 类型。 */
export type PublicEchartsTypes = [YEchartsProps, YEchartsExpose];

/** 组件包入口必须持续导出文档公开的文件导入类型。 */
export type PublicFileImportTypes = [YFileImportProps, FileImportTexts, ImportResult];

/** 组件包入口必须持续导出文档公开的 Monaco 类型。 */
export type PublicMonacoTypes = [YMonacoProps, YMonacoExpose, YMonacoDiffProps, YMonacoDiffExpose, SqlSchema];
