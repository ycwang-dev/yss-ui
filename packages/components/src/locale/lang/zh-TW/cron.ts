import type { YssCronLocale } from '../../types';

const cron: YssCronLocale = {
  dimensions: {
    second: '秒',
    minute: '分',
    hour: '時',
    day: '天',
    month: '月',
    year: '年',
  },
  modes: {
    every: '每',
    interval: '間隔',
    specific: '指定',
    range: '範圍',
  },
  weeks: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  controls: {
    everyPrefix: '每一',
    everyDay: '每一天',
    everyInterval: '每隔',
    from: '從',
    start: '開始',
    specificPrefix: '指定',
    rangePrefix: '週期從',
    to: '到',
    week: '週',
    day: '天',
    daySuffix: '日',
    dayStartSuffix: '日開始',
    specificWeek: '指定星期',
    specificDay: '指定日期',
    lastDayOfMonth: '本月最後一天',
    lastWeekdayOfMonth: '本月最後一個工作日',
    lastWeekOfMonthPrefix: '本月最後一個',
    beforeEndOfMonth: '月底前',
    nearestWeekdayDistance: '距離',
    nearestWeekdaySuffix: '日最近的工作日',
    nthWeekdayPrefix: '本月第',
    nthWeekdayUnit: '個',
    expression: '運算式：',
    reset: '重設',
    selectPlaceholder: '請選擇',
  },
};

export default cron;
