import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import { isDateOutsideValidRange } from '../hooks/useMonthCalendarState';

describe('YMonthCalendar 日期边界', () => {
  const range: [dayjs.Dayjs, dayjs.Dayjs] = [dayjs('2024-02-01'), dayjs('2024-02-29')];

  it('支持闰年二月边界', () => {
    expect(isDateOutsideValidRange(dayjs('2024-02-01'), range)).toBe(false);
    expect(isDateOutsideValidRange(dayjs('2024-02-29'), range)).toBe(false);
    expect(isDateOutsideValidRange(dayjs('2024-03-01'), range)).toBe(true);
  });

  it('支持跨年范围', () => {
    const crossYearRange: [dayjs.Dayjs, dayjs.Dayjs] = [dayjs('2025-12-20'), dayjs('2026-01-10')];
    expect(isDateOutsideValidRange(dayjs('2025-12-31'), crossYearRange)).toBe(false);
    expect(isDateOutsideValidRange(dayjs('2026-01-11'), crossYearRange)).toBe(true);
  });
});
