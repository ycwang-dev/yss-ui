import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

/** 假期条颜色类型。 */
type HolidayTone = 'holiday' | 'festival' | 'workday';

/** 假期区间配置。 */
interface HolidayRange {
  /** 唯一标识。 */
  id: string;
  /** 展示文案。 */
  label: string;
  /** 开始日期。 */
  start: string;
  /** 结束日期。 */
  end: string;
  /** 颜色类型。 */
  tone: HolidayTone;
  /** 固定展示行号。 */
  lane: number;
}

/** 单日期内的区间段位置。 */
type HolidaySegmentPosition = 'single' | 'start' | 'middle' | 'end';

/** 日期单元格内渲染的假期条片段。 */
export interface HolidaySegment {
  /** 原始假期配置。 */
  holiday: HolidayRange;
  /** 在事件区域中的固定行号。 */
  row: number;
  /** 当前片段在同周区间中的位置。 */
  position: HolidaySegmentPosition;
  /** 当前片段是否展示文案。 */
  showLabel: boolean;
}

/** 示例假期与调休区间。 */
export const HOLIDAY_RANGES: HolidayRange[] = [
  {
    id: 'national-day',
    label: '国庆节（休）',
    start: '2026-10-01',
    end: '2026-10-08',
    tone: 'holiday',
    lane: 1,
  },
  {
    id: 'mid-autumn',
    label: '中秋节',
    start: '2026-10-06',
    end: '2026-10-06',
    tone: 'festival',
    lane: 2,
  },
  {
    id: 'make-up-before',
    label: '国庆节（班）',
    start: '2026-09-28',
    end: '2026-09-28',
    tone: 'workday',
    lane: 3,
  },
  {
    id: 'make-up-after',
    label: '国庆节（班）',
    start: '2026-10-11',
    end: '2026-10-11',
    tone: 'workday',
    lane: 3,
  },
];

/** 示例事件区域的固定行数。 */
export const HOLIDAY_LANE_COUNT = 3;

/** 星期展示文案。 */
export const WEEK_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] as const;

/**
 * 判断日期是否落在指定区间内。
 * @param date 待判断日期
 * @param holiday 假期区间
 * @returns 是否命中区间
 */
const isDateInRange = (date: Dayjs, holiday: HolidayRange): boolean => {
  const start = dayjs(holiday.start);
  const end = dayjs(holiday.end);
  return !date.isBefore(start, 'day') && !date.isAfter(end, 'day');
};

/**
 * 计算假期条在当前周内的片段位置。
 * @param date 当前日期
 * @param holiday 假期区间
 * @returns 片段位置和文案显隐
 */
const getSegmentState = (date: Dayjs, holiday: HolidayRange): Pick<HolidaySegment, 'position' | 'showLabel'> => {
  const connectsPrevious = date.day() !== 1 && isDateInRange(date.subtract(1, 'day'), holiday);
  const connectsNext = date.day() !== 0 && isDateInRange(date.add(1, 'day'), holiday);

  if (connectsPrevious && connectsNext) return { position: 'middle', showLabel: false };
  if (connectsPrevious) return { position: 'end', showLabel: false };
  if (connectsNext) return { position: 'start', showLabel: true };
  return { position: 'single', showLabel: true };
};

/**
 * 获取指定日期需要渲染的全部假期条片段。
 * @param date 当前日期
 * @returns 按固定行号排列的假期片段
 */
export const getHolidaySegments = (date: Dayjs): HolidaySegment[] =>
  HOLIDAY_RANGES.flatMap(holiday => {
    if (!isDateInRange(date, holiday)) return [];
    return [
      {
        holiday,
        row: holiday.lane,
        ...getSegmentState(date, holiday),
      },
    ];
  });
