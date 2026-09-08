import type { UploadChangeParam, UploadFile } from 'ant-design-vue';
import { message as antdMessage } from 'ant-design-vue';
import { computed, ref, watch } from 'vue';
import type { Slots } from 'vue';
import { useLocale } from '../../locale/useLocale';
import {
  DEFAULT_FILE_IMPORT_TEXTS,
  FILE_IMPORT_LOADING_NAME,
  FILE_IMPORT_STEP,
  type FileImportStep,
  type YFileImportEmit,
} from '../constant';
import type { ImportResult, YFileImportProps } from '../types';

/** 创建 YFileImport 的流程状态、校验与事件处理。 */
export const useFileImport = (props: Readonly<YFileImportProps>, emit: YFileImportEmit, slots: Slots) => {
  const { t } = useLocale('fileImport');
  /** 当前弹窗可见性。 */
  const visible = computed({
    get: () => props.modelValue ?? false,
    set: (value: boolean) => emit('update:modelValue', value),
  });
  /** 当前流程步骤。 */
  const step = ref<FileImportStep>(FILE_IMPORT_STEP.SELECT_FILE);
  /** 当前受控文件列表。 */
  const fileList = ref<UploadFile[]>([]);
  /** 允许的文件扩展名。 */
  const fileListExtensions = computed(() => (props.fileTypeList ?? []).map(extension => `.${extension}`));
  /** Upload 使用的 accept 字符串。 */
  const finalAccept = computed(() => props.accept || fileListExtensions.value.join(','));
  /** 是否处于选择文件步骤。 */
  const isSelectFileStep = computed(() => step.value === FILE_IMPORT_STEP.SELECT_FILE);
  /** 是否处于结果步骤。 */
  const isUploadStep = computed(() => step.value === FILE_IMPORT_STEP.UPLOAD);
  /** 允许文件类型的展示文案。 */
  const fileTypeListText = computed(() => (props.fileTypeList ?? []).join('/'));
  /** 合并后的按钮及校验文案。 */
  const mergedTexts = computed(() => {
    const types = fileTypeListText.value;
    const dynamicDefaults = {
      downloadTemplate: t('downloadTemplate'),
      cancel: t('cancel'),
      nextStep: t('nextStep'),
      lastStep: t('lastStep'),
      confirmImport: t('confirmImport'),
      exportErrorData: t('exportErrorData'),
      emptyFileMessage: t('emptyFileMessage'),
      singleFileMessage: t('singleFileMessage'),
    };
    return {
      ...DEFAULT_FILE_IMPORT_TEXTS,
      ...dynamicDefaults,
      uploadTip: types ? t('uploadTip', { types }) : '',
      invalidFileTypeMessage: types ? t('invalidFileTypeMessage', { types }) : t('invalidFileType'),
      ...(props.texts ?? {}),
    };
  });
  /** 上传提示文案。 */
  const uploadTipText = computed(() => mergedTexts.value.uploadTip);
  /** 底部左侧是否存在内容。 */
  const hasFooterLeft = computed(() => (props.showDownloadTemplate ?? true) || Boolean(slots.footerLeft));
  /** Modal 透传属性。 */
  const modalPassThrough = computed(() => ({
    maskClosable: false,
    wrapClassName: 'y-file-import-modal',
    ...(props.modalProps ?? {}),
  }));
  /** Upload.Dragger 透传属性。 */
  const draggerProps = computed(() => ({
    action: props.action,
    multiple: props.multiple,
    fileList: fileList.value,
    ...(props.uploadProps ?? {}),
  }));
  /** 是否展示导入成功按钮。 */
  const showSuccessBtn = computed(() => Boolean(props.importResult?.successkey) && isUploadStep.value);
  /** 是否展示失败数据按钮。 */
  const showFailBtn = computed(() => Boolean(props.importResult?.failkey) && isUploadStep.value);

  /** 获取浮层容器。 */
  const getContainer = (): HTMLElement => document.body;
  /** 判断指定按钮是否处于 loading。 */
  const isLoading = (key: string): boolean => props.loadings?.includes(key) ?? false;
  /** 获取导入结果字段。 */
  const getImportResult = (key: keyof ImportResult): ImportResult[typeof key] => props.importResult?.[key];
  /** 关闭弹窗。 */
  const close = (): void => emit('update:modelValue', false);
  /** 打开弹窗。 */
  const open = (): void => emit('update:modelValue', true);
  /** 重置内部步骤与文件列表。 */
  const reset = (): void => {
    fileList.value = [];
    step.value = FILE_IMPORT_STEP.SELECT_FILE;
  };
  /** 更新受控文件列表。 */
  const updateFileList = (next: UploadFile[]): void => {
    fileList.value = props.multiple ? next : next.slice(-1);
  };
  /** 校验文件扩展名。 */
  const validFileExtension = (file?: UploadFile | File | null): boolean => {
    const name = file?.name?.toLowerCase() ?? '';
    return Boolean(name) && fileListExtensions.value.some(extension => name.endsWith(extension));
  };
  /** 阻止 Upload 默认上传，文件由业务层处理。 */
  const beforeUploadIntercept = (): false => false;
  /** 同步 Upload 变更到内部受控文件列表。 */
  const handleFileChange = (info: UploadChangeParam<UploadFile>): void => {
    updateFileList((info.fileList ?? []).map(file => ({ ...file })));
  };
  /** 校验进入下一步所需的文件条件。 */
  const beforeUploadValid = async (): Promise<boolean> => {
    if (!fileList.value.length) {
      antdMessage.error(mergedTexts.value.emptyFileMessage);
      return false;
    }
    if (!props.multiple && fileList.value.length > 1) {
      antdMessage.error(mergedTexts.value.singleFileMessage);
      return false;
    }
    const hasInvalidFile = fileList.value.some(item => {
      const rawFile = item.originFileObj as File | undefined;
      return rawFile && !props.accept && !validFileExtension(rawFile);
    });
    if (hasInvalidFile) {
      antdMessage.error(mergedTexts.value.invalidFileTypeMessage);
      return false;
    }
    return true;
  };
  /** 处理下一步并交由业务回调决定何时展示结果。 */
  const handleNextStep = async (): Promise<void> => {
    if (!(await beforeUploadValid())) return;
    emit('nextStep', {
      loadingName: FILE_IMPORT_LOADING_NAME.NEXT_STEP,
      fileList: fileList.value,
      close,
      onSuccess: () => {
        step.value = FILE_IMPORT_STEP.UPLOAD;
      },
    });
  };
  /** 返回选择文件步骤。 */
  const handleLastStep = (): void => {
    step.value = FILE_IMPORT_STEP.SELECT_FILE;
    emit('lastStep', { close });
  };
  /** 发送确认导入事件。 */
  const emitFinalImport = (): void =>
    emit('finalImport', { loadingName: FILE_IMPORT_LOADING_NAME.FINAL_IMPORT, fileList: fileList.value, close });
  /** 发送下载模板事件。 */
  const emitDownloadTemplate = (): void =>
    emit('downloadTemplate', {
      loadingName: FILE_IMPORT_LOADING_NAME.DOWNLOAD_TEMPLATE,
      fileList: fileList.value,
      close,
    });
  /** 发送导出失败数据事件。 */
  const emitExportErrorData = (): void =>
    emit('exportErrorData', {
      loadingName: FILE_IMPORT_LOADING_NAME.EXPORT_ERROR_DATA,
      fileList: fileList.value,
      close,
    });
  /** 处理弹窗取消。 */
  const handleCancel = (): void => close();

  watch(
    () => props.modelValue,
    value => {
      if (value) reset();
    }
  );

  return {
    beforeUploadIntercept,
    draggerProps,
    emitDownloadTemplate,
    emitExportErrorData,
    emitFinalImport,
    fileList,
    finalAccept,
    getContainer,
    getImportResult,
    handleCancel,
    handleFileChange,
    handleLastStep,
    handleNextStep,
    hasFooterLeft,
    isLoading,
    isSelectFileStep,
    isUploadStep,
    mergedTexts,
    modalPassThrough,
    open,
    close,
    reset,
    showFailBtn,
    showSuccessBtn,
    uploadTipText,
    visible,
  };
};
