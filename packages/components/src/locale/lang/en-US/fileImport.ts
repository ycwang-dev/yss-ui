import type { YssFileImportLocale } from '../../types';

const fileImport: YssFileImportLocale = {
  title: 'Import',
  downloadTemplate: 'Download Template',
  cancel: 'Cancel',
  nextStep: 'Next',
  lastStep: 'Back',
  confirmImport: 'Confirm Import',
  exportErrorData: 'Export Error Data',
  emptyFileMessage: 'Please select a file',
  singleFileMessage: 'Only one file can be uploaded at a time',
  uploadTip: 'Only {types} files can be imported',
  invalidFileTypeMessage: 'Unsupported file type, please select {types} files',
  invalidFileType: 'Unsupported file type',
  draggerText: 'Drag file here, or',
  draggerClick: 'click to import',
  resultSummary: 'Total {total} rows, {success} importable, {fail} unimportable',
};

export default fileImport;
