import type { YssFileImportLocale } from '../../types';

const fileImport: YssFileImportLocale = {
  title: '导入',
  downloadTemplate: '下载导入模板',
  cancel: '取消',
  nextStep: '下一步',
  lastStep: '上一步',
  confirmImport: '确认导入',
  exportErrorData: '下载失败数据',
  emptyFileMessage: '请选择文件',
  singleFileMessage: '一次只能上传一个文件',
  uploadTip: '只能导入 {types} 文件',
  invalidFileTypeMessage: '不支持该文件类型，请选择{types}文件',
  invalidFileType: '不支持该文件类型',
  draggerText: '将文件拖到此处，或',
  draggerClick: '点击导入',
  resultSummary: '总计 {total} 行，可导入 {success} 行，不可导入 {fail} 行',
};

export default fileImport;
