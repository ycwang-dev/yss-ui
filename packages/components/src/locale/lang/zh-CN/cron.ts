import type { YssCronLocale } from '../../types';

const cron: YssCronLocale = {
  dimensions: {
    second: '秒',
    minute: '分',
    hour: '时',
    day: '天',
    month: '月',
    year: '年',
  },
  modes: {
    every: '每',
    interval: '间隔',
    specific: '指定',
    range: '范围',
  },
  weeks: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  controls: {
    everyPrefix: '每一',
    everyDay: '每一天',
    everyInterval: '每隔',
    from: '从',
    start: '开始',
    specificPrefix: '指定',
    rangePrefix: '周期从',
    to: '到',
    week: '周',
    day: '天',
    daySuffix: '日',
    dayStartSuffix: '日开始',
    specificWeek: '指定星期',
    specificDay: '指定日期',
    lastDayOfMonth: '本月最后一天',
    lastWeekdayOfMonth: '本月最后一个工作日',
    lastWeekOfMonthPrefix: '本月最后一个',
    beforeEndOfMonth: '月底前',
    nearestWeekdayDistance: '距离',
    nearestWeekdaySuffix: '日最近的工作日',
    nthWeekdayPrefix: '本月第',
    nthWeekdayUnit: '个',
    expression: '表达式：',
    reset: '重置',
    selectPlaceholder: '请选择',
  },
};

export default cron;
