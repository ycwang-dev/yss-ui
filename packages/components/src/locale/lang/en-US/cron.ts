import type { YssCronLocale } from '../../types';

const cron: YssCronLocale = {
  dimensions: {
    second: 'Second',
    minute: 'Minute',
    hour: 'Hour',
    day: 'Day',
    month: 'Month',
    year: 'Year',
  },
  modes: {
    every: 'Every',
    interval: 'Interval',
    specific: 'Specific',
    range: 'Range',
  },
  weeks: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  controls: {
    everyPrefix: 'Every ',
    everyDay: 'Every day',
    everyInterval: 'Every ',
    from: 'from ',
    start: 'start',
    specificPrefix: 'Specific ',
    rangePrefix: 'Period from ',
    to: 'to ',
    week: 'week(s) ',
    day: 'day(s) ',
    daySuffix: 'th',
    dayStartSuffix: 'th start',
    specificWeek: 'Specific Weekday',
    specificDay: 'Specific Day',
    lastDayOfMonth: 'Last day of the month',
    lastWeekdayOfMonth: 'Last weekday of the month',
    lastWeekOfMonthPrefix: 'Last ',
    beforeEndOfMonth: 'Days before end of month: ',
    nearestWeekdayDistance: 'Nearest weekday to day ',
    nearestWeekdaySuffix: '',
    nthWeekdayPrefix: 'The ',
    nthWeekdayUnit: '',
    expression: 'Expression: ',
    reset: 'Reset',
    selectPlaceholder: 'Please select',
  },
};

export default cron;
