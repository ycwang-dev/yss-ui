import { nextTick, ref, watch, type ComputedRef, type Ref } from 'vue';
import type { Dayjs } from 'dayjs';
import type {
  YMonthCalendarCellContext,
  YMonthCalendarPointerPayload,
  YMonthCalendarProps,
  YMonthCalendarSelectPayload,
} from '../types';

/** 右键菜单关闭原因。 */
export type MonthCalendarContextMenuCloseReason = 'outside' | 'escape' | 'scroll' | 'resize' | 'blur';

/** 月日历右键菜单状态。 */
interface MonthCalendarContextMenuState {
  activeContext: Ref<YMonthCalendarCellContext | undefined>;
  contextMenuPosition: Ref<{ x: number; y: number }>;
  closeContextMenu: () => void;
  handleContextMenu: (payload: YMonthCalendarPointerPayload) => void;
  handleContextMenuClose: (reason: MonthCalendarContextMenuCloseReason) => Promise<void>;
}

/** 月日历右键菜单依赖。 */
interface MonthCalendarContextMenuOptions {
  props: YMonthCalendarProps;
  contextMenuEnabled: ComputedRef<boolean>;
  displayMonth: ComputedRef<Dayjs>;
  getCellContext: (date: Dayjs) => YMonthCalendarCellContext;
  selectDate: (date: Dayjs, source: YMonthCalendarSelectPayload['source']) => void;
  emitContextMenu: (payload: YMonthCalendarPointerPayload) => void;
}

/**
 * 管理月日历右键菜单定位、关闭和焦点恢复。
 *
 * @param options 右键菜单依赖
 * @returns 右键菜单状态和处理函数
 */
export const useMonthCalendarContextMenu = (
  options: MonthCalendarContextMenuOptions
): MonthCalendarContextMenuState => {
  const activeContext = ref<YMonthCalendarCellContext>();
  const contextMenuPosition = ref({ x: 0, y: 0 });
  const contextMenuTrigger = ref<HTMLElement>();

  /** 关闭当前右键菜单。 */
  const closeContextMenu = (): void => {
    activeContext.value = undefined;
    contextMenuTrigger.value = undefined;
  };

  /** 根据关闭原因恢复日期焦点。 */
  const handleContextMenuClose = async (reason: MonthCalendarContextMenuCloseReason): Promise<void> => {
    const trigger = contextMenuTrigger.value;
    closeContextMenu();
    if (reason === 'escape') {
      await nextTick();
      trigger?.focus({ preventScroll: true });
    }
  };

  /** 打开目标日期的右键菜单。 */
  const handleContextMenu = (payload: YMonthCalendarPointerPayload): void => {
    if (options.contextMenuEnabled.value && options.props.selectOnContextMenu) {
      options.selectDate(payload.date, 'contextmenu');
    }
    activeContext.value = options.getCellContext(payload.date);
    contextMenuTrigger.value = payload.event.currentTarget as HTMLElement;
    contextMenuPosition.value = { x: payload.event.clientX, y: payload.event.clientY };
    options.emitContextMenu({ ...activeContext.value, event: payload.event });
  };

  watch([() => options.displayMonth.value.valueOf(), () => options.props.loading], () => {
    if (activeContext.value) {
      closeContextMenu();
    }
  });

  return {
    activeContext,
    contextMenuPosition,
    closeContextMenu,
    handleContextMenu,
    handleContextMenuClose,
  };
};
