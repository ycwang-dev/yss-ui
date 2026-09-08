import type { UploadFile } from 'ant-design-vue';
import type { FileImportTexts } from './types';

/** 文件导入流程步骤。 */
export const FILE_IMPORT_STEP = {
  SELECT_FILE: 1,
  UPLOAD: 2,
} as const;

/** 文件导入流程步骤值。 */
export type FileImportStep = (typeof FILE_IMPORT_STEP)[keyof typeof FILE_IMPORT_STEP];

/** 文件导入按钮的 loading 标识。 */
export const FILE_IMPORT_LOADING_NAME = {
  DOWNLOAD_TEMPLATE: 'downloadTemplate',
  NEXT_STEP: 'nextStep',
  FINAL_IMPORT: 'finalImport',
  EXPORT_ERROR_DATA: 'exportErrorData',
} as const;

/** 不依赖文件类型动态生成的默认文案。 */
export const DEFAULT_FILE_IMPORT_TEXTS: Omit<FileImportTexts, 'uploadTip' | 'invalidFileTypeMessage'> = {
  downloadTemplate: '下载导入模板',
  cancel: '取消',
  nextStep: '下一步',
  lastStep: '上一步',
  confirmImport: '确认导入',
  exportErrorData: '下载失败数据',
  emptyFileMessage: '请选择文件',
  singleFileMessage: '一次只能上传一个文件',
};

/** YFileImport 内部事件发送器。 */
export interface YFileImportEmit {
  /** 更新弹窗可见性。 */
  (event: 'update:modelValue', value: boolean): void;
  /** 确认导入。 */
  (event: 'finalImport', payload: FileImportActionPayload): void;
  /** 下载导入模板。 */
  (event: 'downloadTemplate', payload: FileImportActionPayload): void;
  /** 导出失败数据。 */
  (event: 'exportErrorData', payload: FileImportActionPayload): void;
  /** 返回上一步。 */
  (event: 'lastStep', payload: FileImportClosePayload): void;
  /** 进入下一步。 */
  (event: 'nextStep', payload: FileImportNextStepPayload): void;
}

/** 文件导入通用操作事件参数。 */
export interface FileImportActionPayload {
  /** 外部 loading 标识。 */
  loadingName: string;
  /** 当前文件列表。 */
  fileList: UploadFile[];
  /** 关闭弹窗。 */
  close: () => void;
}

/** 返回上一步事件参数。 */
export interface FileImportClosePayload {
  /** 关闭弹窗。 */
  close: () => void;
}

/** 下一步事件参数。 */
export interface FileImportNextStepPayload extends FileImportActionPayload {
  /** 业务校验成功后切换到结果步骤。 */
  onSuccess: () => void;
}
