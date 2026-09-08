/**
 * YSS UI 国际化语言包强类型定义
 */

export type YssLocaleName = 'zh-CN' | 'en-US' | 'zh-TW';

export interface YssCommonLocale {
  confirm: string;
  cancel: string;
  operation: string;
  more: string;
  collapse: string;
  expand: string;
  empty: string;
  search: string;
  reset: string;
  loading: string;
}

export interface YssTableLocale {
  actionTitle: string;
  more: string;
  confirmTitle: string;
  total: string;
}

export interface YssFormilyLocale {
  yes: string;
  no: string;
  arraySeparator: string;

  collapse: string;
  expand: string;
}

export interface YssFileImportLocale {
  title: string;
  downloadTemplate: string;
  cancel: string;
  nextStep: string;
  lastStep: string;
  confirmImport: string;
  exportErrorData: string;
  emptyFileMessage: string;
  singleFileMessage: string;
  uploadTip: string;
  invalidFileTypeMessage: string;
  invalidFileType: string;
  draggerText: string;
  draggerClick: string;
  resultSummary: string;
}

export interface YssCronLocale {
  dimensions: {
    second: string;
    minute: string;
    hour: string;
    day: string;
    month: string;
    year: string;
  };
  modes: {
    every: string;
    interval: string;
    specific: string;
    range: string;
  };
  weeks: string[];
  controls: {
    everyPrefix: string;
    everyDay: string;
    everyInterval: string;
    from: string;
    start: string;
    specificPrefix: string;
    rangePrefix: string;
    to: string;
    week: string;
    day: string;
    daySuffix: string;
    dayStartSuffix: string;
    specificWeek: string;
    specificDay: string;
    lastDayOfMonth: string;
    lastWeekdayOfMonth: string;
    lastWeekOfMonthPrefix: string;
    beforeEndOfMonth: string;
    nearestWeekdayDistance: string;
    nearestWeekdaySuffix: string;
    nthWeekdayPrefix: string;
    nthWeekdayUnit: string;
    expression: string;
    reset: string;
    selectPlaceholder: string;
  };
}

export interface YssConditionBuilderLocale {
  removeGroup: string;

  and: string;
  or: string;
  operators: Record<string, string>;
  fieldPlaceholder: string;
  operatorPlaceholder: string;
  startPlaceholder: string;
  endPlaceholder: string;
  betweenSeparator: string;
  selectPlaceholder: string;
  inputPlaceholder: string;
  addSibling: string;
  remove: string;
  addChild: string;
  childGroup: string;
}

export interface YssTreeLocale {
  searchPlaceholder: string;
  loadingTip: string;
}

export interface YssMonthCalendarLocale {
  today: string;
  loadingTip: string;
  previousMonth: string;
  nextMonth: string;
  backToToday: string;
  weekdays: string[];
}

export interface YssMonacoLocale {
  comment: string;
  upper: string;
  lower: string;
  singleQuote: string;
  doubleQuote: string;
  backticks: string;
  parentheses: string;
  copyLine: string;
  find: string;
  replace: string;
  commands: string;
  format: string;

  copy: string;
  copied: string;
  enterFullscreen: string;
  exitFullscreen: string;
  download: string;
  diffCopy: string;
  diffDownload: string;
  exitFullscreenHint: string;
}

export interface YssSplitPaneLocale {
  hideTop: string;
  hideBottom: string;
  resetHeight: string;
  expandTop: string;
  collapseTop: string;
  expandLeft: string;
  collapseLeft: string;
}

export interface YssSheetLocale {
  newWorkbook: string;
  loading: string;
  loadFailed: string;
}

export interface YssLocale {
  name: YssLocaleName;
  common: YssCommonLocale;
  table: YssTableLocale;
  formily: YssFormilyLocale;
  fileImport: YssFileImportLocale;
  cron: YssCronLocale;
  conditionBuilder: YssConditionBuilderLocale;
  tree: YssTreeLocale;
  monthCalendar: YssMonthCalendarLocale;
  monaco: YssMonacoLocale;
  splitPane: YssSplitPaneLocale;
  sheet: YssSheetLocale;
}
