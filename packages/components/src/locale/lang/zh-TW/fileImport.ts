import type { YssFileImportLocale } from '../../types';

const fileImport: YssFileImportLocale = {
  title: '匯入',
  downloadTemplate: '下載匯入範本',
  cancel: '取消',
  nextStep: '下一步',
  lastStep: '上一步',
  confirmImport: '確認匯入',
  exportErrorData: '下載失敗資料',
  emptyFileMessage: '請選擇檔案',
  singleFileMessage: '一次只能上傳一個檔案',
  uploadTip: '只能匯入 {types} 檔案',
  invalidFileTypeMessage: '不支援該檔案類型，請選擇{types}檔案',
  invalidFileType: '不支援該檔案類型',
  draggerText: '將檔案拖到此處，或',
  draggerClick: '點擊匯入',
  resultSummary: '總計 {total} 行，可匯入 {success} 行，不可匯入 {fail} 行',
};

export default fileImport;
