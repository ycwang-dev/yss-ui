import { nextTick, type Ref } from 'vue';
import type { Dayjs } from 'dayjs';
import type { YMonthCalendarCellContext } from '../types';

/** 键盘导航依赖。 */
interface CalendarKeyboardOptions {
  rootRef: Ref<HTMLElement | undefined>;
  getContext: (date: Dayjs) => YMonthCalendarCellContext;
  selectDate: (date: Dayjs, source: 'keyboard') => void;
  changeMonth: (month: Dayjs) => void;
  closeContextMenu: () => void;
}

/**
 * 创建月日历键盘导航能力。
 *
 * @param options 导航依赖
 * @returns 键盘事件与聚焦方法
 */
export const useCalendarKeyboard = (options: CalendarKeyboardOptions) => {
  const focusDate = async (date: Dayjs): Promise<void> => {
    await nextTick();
    const key = date.format('YYYY-MM-DD');
    options.rootRef.value?.querySelector<HTMLElement>(`[data-date-key="${key}"]`)?.focus();
  };

  const moveFocus = async (date: Dayjs, offset: number, unit: 'day' | 'week'): Promise<void> => {
    const target = date.add(offset, unit);
    if (!target.isSame(date, 'month')) {
      options.changeMonth(target);
    }
    await focusDate(target);
  };

  const handleKeydown = async (event: KeyboardEvent, context: YMonthCalendarCellContext): Promise<void> => {
    const { date } = context;
    const handlers: Record<string, () => Promise<void> | void> = {
      ArrowLeft: () => moveFocus(date, -1, 'day'),
      ArrowRight: () => moveFocus(date, 1, 'day'),
      ArrowUp: () => moveFocus(date, -1, 'week'),
      ArrowDown: () => moveFocus(date, 1, 'week'),
      Home: () => focusDate(date.subtract((date.day() + 6) % 7, 'day')),
      End: () => focusDate(date.add(6 - ((date.day() + 6) % 7), 'day')),
      PageUp: async () => {
        const target = date.subtract(1, 'month');
        options.changeMonth(target);
        await focusDate(target);
      },
      PageDown: async () => {
        const target = date.add(1, 'month');
        options.changeMonth(target);
        await focusDate(target);
      },
      Enter: () => options.selectDate(date, 'keyboard'),
      ' ': () => options.selectDate(date, 'keyboard'),
      Escape: options.closeContextMenu,
    };
    const handler = handlers[event.key];
    if (!handler) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    await handler();
  };

  return {
    focusDate,
    handleKeydown,
  };
};
