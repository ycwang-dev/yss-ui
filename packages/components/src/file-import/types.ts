/** 文件导入结果。 */
export interface ImportResult {
  successkey?: string;
  failkey?: string;
  success?: number;
  fail?: number;
  total?: number;
}

/** 文件导入文案配置，未传入的字段使用组件默认值。 */
export interface FileImportTexts {
  /** 下载导入模板按钮文案。 */
  downloadTemplate?: string;
  /** 取消按钮文案。 */
  cancel?: string;
  /** 下一步按钮文案。 */
  nextStep?: string;
  /** 上一步按钮文案。 */
  lastStep?: string;
  /** 确认导入按钮文案。 */
  confirmImport?: string;
  /** 下载失败数据按钮文案。 */
  exportErrorData?: string;
  /** 上传区底部提示文案；传空字符串时不展示提示行。 */
  uploadTip?: string;
  /** 未选择文件时的校验提示。 */
  emptyFileMessage?: string;
  /** 单文件模式下选择多个文件时的校验提示。 */
  singleFileMessage?: string;
  /** 文件类型不匹配时的校验提示，`{types}` 会被替换为允许的类型。 */
  invalidFileTypeMessage?: string;
}

/** YFileImport 组件 Props。 */
export interface YFileImportProps {
  /** 弹窗可见性。 */
  modelValue?: boolean;
  /** 弹窗标题。 */
  title?: string;
  /** 弹窗宽度。 */
  width?: string | number;
  /** 文件类型集合（用于拼接 accept）。 */
  fileTypeList?: string[];
  /** 指定 accept，将覆盖 fileTypeList 推导。 */
  accept?: string;
  /** 是否支持多选。 */
  multiple?: boolean;
  /** 拖拽上传兼容开关。 */
  drag?: boolean;
  /** Upload 直传地址。 */
  action?: string;
  /** 是否在选取后立即上传（受控模式仅用于兼容）。 */
  autoUpload?: boolean;
  /** loading 标识集合。 */
  loadings?: string[];
  /** 导入结果。 */
  importResult?: ImportResult;
  /** Modal 扩展属性。 */
  modalProps?: Record<string, any>;
  /** Upload 扩展属性。 */
  uploadProps?: Record<string, any>;
  /** 是否展示“下载导入模板”按钮。 */
  showDownloadTemplate?: boolean;
  /** 是否展示“取消”按钮。 */
  showCancel?: boolean;
  /** 是否展示上传区底部文件类型提示。 */
  showUploadTip?: boolean;
  /** 是否展示“下一步”按钮。 */
  showNextStep?: boolean;
  /** 是否展示“上一步”按钮。 */
  showLastStep?: boolean;
  /** 拖拽区主文案。 */
  draggerText?: string;
  /** 按钮与提示文案配置。 */
  texts?: FileImportTexts;
}
