import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import dayjs from 'dayjs';
import YMonthCalendar from '../index.vue';
import MonthCalendarContextMenu from '../components/MonthCalendarContextMenu.vue';
import type { YMonthCalendarSelectPayload } from '../types';

const wrappers: VueWrapper[] = [];

/** 挂载月日历并记录清理。 */
const mountCalendar = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) => {
  const wrapper = mount(YMonthCalendar, {
    props: {
      month: dayjs('2026-06-01'),
      showHeader: false,
      ...props,
    },
    slots,
    attachTo: document.body,
  });
  wrappers.push(wrapper);
  return wrapper;
};

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  document.body.innerHTML = '';
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('YMonthCalendar 交互', () => {
  it('选择跨月日期时同步更新日期和月份', async () => {
    const wrapper = mountCalendar();
    await wrapper.get('[data-date-key="2026-07-01"]').trigger('click');

    expect((wrapper.emitted('update:modelValue')?.[0]?.[0] as dayjs.Dayjs).format('YYYY-MM-DD')).toBe('2026-07-01');
    expect((wrapper.emitted('update:month')?.[0]?.[0] as dayjs.Dayjs).format('YYYY-MM-DD')).toBe('2026-07-01');
  });

  it('禁用日期完全阻断鼠标事件', async () => {
    const wrapper = mountCalendar({
      disabledDate: (date: dayjs.Dayjs) => date.isSame(dayjs('2026-06-30'), 'day'),
    });
    const cell = wrapper.get('[data-date-key="2026-06-30"]');
    await cell.trigger('click');
    await cell.trigger('dblclick');
    await cell.trigger('contextmenu');

    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('cell-dblclick')).toBeUndefined();
    expect(wrapper.emitted('cell-contextmenu')).toBeUndefined();
  });

  it('双击前保持单击选择语义', async () => {
    const wrapper = mountCalendar();
    const cell = wrapper.get('[data-date-key="2026-06-30"]');
    await cell.trigger('click');
    await cell.trigger('dblclick');

    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    expect(wrapper.emitted('cell-dblclick')).toHaveLength(1);
  });

  it('右键菜单插槽启用时先选中日期并展示菜单', async () => {
    const wrapper = mountCalendar({}, { 'context-menu': '<button class="menu-action">维护</button>' });
    await wrapper.get('[data-date-key="2026-06-30"]').trigger('contextmenu');
    await nextTick();
    await nextTick();

    expect((wrapper.emitted('update:modelValue')?.[0]?.[0] as dayjs.Dayjs).format('YYYY-MM-DD')).toBe('2026-06-30');
    expect(wrapper.emitted('cell-contextmenu')).toHaveLength(1);
    expect((wrapper.vm as unknown as { activeContext?: { dateKey: string } }).activeContext?.dateKey).toBe(
      '2026-06-30'
    );
    expect((wrapper.vm as unknown as { contextMenuEnabled: boolean }).contextMenuEnabled).toBe(true);
    expect(wrapper.findComponent(MonthCalendarContextMenu).exists()).toBe(true);
    expect(document.body.textContent).toContain('维护');
  });

  it('右键菜单插槽未启用时右键不选中日期且不展示菜单', async () => {
    const wrapper = mountCalendar({ modelValue: dayjs('2026-06-15') });
    await wrapper.get('[data-date-key="2026-06-30"]').trigger('contextmenu');
    await nextTick();

    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('cell-contextmenu')).toHaveLength(1);
    expect(wrapper.findComponent(MonthCalendarContextMenu).exists()).toBe(false);
  });

  it('右键菜单支持 Escape 关闭并恢复日期焦点', async () => {
    const wrapper = mountCalendar({}, { 'context-menu': '<button class="menu-action">维护</button>' });
    const cell = wrapper.get('[data-date-key="2026-06-30"]');
    (cell.element as HTMLElement).focus();
    await cell.trigger('contextmenu');
    await nextTick();
    await nextTick();

    expect(document.activeElement?.classList.contains('menu-action')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();
    await nextTick();

    expect(wrapper.findComponent(MonthCalendarContextMenu).exists()).toBe(false);
    expect((document.activeElement as HTMLElement)?.dataset.dateKey).toBe('2026-06-30');
  });

  it('页面滚动时关闭右键菜单', async () => {
    const wrapper = mountCalendar({}, { 'context-menu': '<button class="menu-action">维护</button>' });
    await wrapper.get('[data-date-key="2026-06-30"]').trigger('contextmenu');
    await nextTick();
    document.dispatchEvent(new Event('scroll'));
    await nextTick();

    expect(wrapper.findComponent(MonthCalendarContextMenu).exists()).toBe(false);
  });

  it('支持通过日期上下文扩展单元格类名', () => {
    const wrapper = mountCalendar({
      cellClassName: (context: { date: dayjs.Dayjs }) =>
        context.date.isSame(dayjs('2026-06-15'), 'day') ? 'is-highlighted' : '',
    });

    expect(wrapper.get('[data-date-key="2026-06-15"]').classes()).toContain('is-highlighted');
  });

  it('短月和跨六周月份都保持完整 42 个日期单元格', async () => {
    const wrapper = mountCalendar({ month: dayjs('2021-02-01') });
    expect(wrapper.findAll('[data-date-key]')).toHaveLength(42);

    await wrapper.setProps({ month: dayjs('2021-08-01') });
    expect(wrapper.findAll('[data-date-key]')).toHaveLength(42);
    expect(wrapper.find('[data-date-key="2021-09-05"]').exists()).toBe(true);
  });

  it('日期网格与周一到周日表头保持一致', () => {
    const wrapper = mountCalendar({ month: dayjs('2026-07-01') });
    const cells = wrapper.findAll('[data-date-key]');

    expect(cells[0].attributes('data-date-key')).toBe('2026-06-29');
    expect(cells[6].attributes('data-date-key')).toBe('2026-07-05');
  });

  it('默认使用 glass 外观并支持切换 plain 外观', async () => {
    const wrapper = mountCalendar();
    expect(wrapper.classes()).toContain('y-month-calendar--glass');

    await wrapper.setProps({ appearance: 'plain' });
    expect(wrapper.classes()).toContain('y-month-calendar--plain');
    expect(wrapper.attributes('data-appearance')).toBe('plain');
  });

  it('默认使用 card 单元格布局并支持切换 grid 布局', async () => {
    const wrapper = mountCalendar();
    expect(wrapper.classes()).toContain('y-month-calendar--cell-card');
    expect(wrapper.attributes('data-cell-layout')).toBe('card');

    await wrapper.setProps({ cellLayout: 'grid' });
    expect(wrapper.classes()).toContain('y-month-calendar--cell-grid');
    expect(wrapper.classes()).not.toContain('y-month-calendar--cell-card');
    expect(wrapper.attributes('data-cell-layout')).toBe('grid');
  });

  it('非法单元格布局回退为 card', () => {
    const wrapper = mountCalendar({ cellLayout: 'unknown' });

    expect(wrapper.classes()).toContain('y-month-calendar--cell-card');
    expect(wrapper.attributes('data-cell-layout')).toBe('card');
  });

  it('默认启用响应式并支持恢复固定宽度模式', async () => {
    const wrapper = mountCalendar();
    expect(wrapper.classes()).toContain('y-month-calendar--responsive');
    expect(wrapper.attributes('data-responsive')).toBe('true');

    await wrapper.setProps({ responsive: false });
    expect(wrapper.classes()).toContain('y-month-calendar--fixed');
    expect(wrapper.classes()).not.toContain('y-month-calendar--responsive');
    expect(wrapper.attributes('data-responsive')).toBe('false');
  });

  it('支持显式开启父容器高度填充模式', () => {
    const wrapper = mountCalendar({ fillHeight: true });

    expect(wrapper.classes()).toContain('y-month-calendar--fill-height');
    expect(wrapper.attributes('data-fill-height')).toBe('true');
  });

  it('默认使用圆形日期表示今天并保留选中边框', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T08:00:00'));
    const wrapper = mountCalendar({
      modelValue: dayjs('2026-06-15'),
      month: dayjs('2026-06-01'),
    });
    const todayCell = wrapper.get('[data-date-key="2026-06-15"]');

    expect(todayCell.classes()).toContain('y-month-calendar__cell--today');
    expect(todayCell.classes()).toContain('y-month-calendar__cell--selected');
    expect(todayCell.find('.y-month-calendar__date--today').exists()).toBe(true);
    expect(todayCell.find('.y-month-calendar__today-badge').exists()).toBe(false);
  });

  it('支持切换今天文字徽标及组合标记', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T08:00:00'));
    const wrapper = mountCalendar({
      month: dayjs('2026-06-01'),
      todayIndicator: 'badge',
    });
    const todayCell = wrapper.get('[data-date-key="2026-06-15"]');

    expect(todayCell.find('.y-month-calendar__date--today').exists()).toBe(false);
    expect(todayCell.get('.y-month-calendar__today-badge').text()).toBe('今天');

    await wrapper.setProps({ todayIndicator: 'both' });
    expect(todayCell.find('.y-month-calendar__date--today').exists()).toBe(true);
    expect(todayCell.find('.y-month-calendar__today-badge').exists()).toBe(true);
  });

  it('非法今天标记模式回退为圆形日期', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T08:00:00'));
    const wrapper = mountCalendar({
      month: dayjs('2026-06-01'),
      todayIndicator: 'unknown',
    });
    const todayCell = wrapper.get('[data-date-key="2026-06-15"]');

    expect(todayCell.find('.y-month-calendar__date--today').exists()).toBe(true);
    expect(todayCell.find('.y-month-calendar__today-badge').exists()).toBe(false);
  });

  it('支持逐项隐藏默认头部操作', () => {
    const wrapper = mountCalendar({
      showHeader: true,
      headerActions: { previous: false, today: false },
    });

    expect(wrapper.find('[aria-label="上一月"]').exists()).toBe(false);
    expect(wrapper.find('[aria-label="回到今天"]').exists()).toBe(false);
    expect(wrapper.find('[aria-label="下一月"]').exists()).toBe(true);
  });

  it('今天超出合法范围时禁用今天按钮', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-01T08:00:00'));
    const wrapper = mountCalendar({
      showHeader: true,
      validRange: [dayjs('2026-06-01'), dayjs('2026-06-30')],
    });

    expect(wrapper.get('[aria-label="回到今天"]').attributes('disabled')).toBeDefined();
  });

  it('重复选择已选日期不重复发送模型更新', async () => {
    const wrapper = mountCalendar({ modelValue: dayjs('2026-06-15') });
    await wrapper.get('[data-date-key="2026-06-15"]').trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('select')).toHaveLength(1);
    expect(wrapper.emitted('cell-click')).toHaveLength(1);
  });

  it('点击日期后立即更新选中类名和无障碍状态', async () => {
    const wrapper = mountCalendar({ cellLayout: 'grid' });
    const cell = wrapper.get('[data-date-key="2026-06-15"]');
    expect(cell.classes()).not.toContain('y-month-calendar__cell--selected');

    await cell.trigger('click');

    expect(cell.classes()).toContain('y-month-calendar__cell--selected');
    expect(cell.attributes('aria-selected')).toBe('true');
  });

  it('受控模式回到今天只发送一次月份更新', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-01T08:00:00'));
    const emittedOrder: string[] = [];
    const wrapper = mountCalendar({
      showHeader: true,
      modelValue: dayjs('2026-06-15'),
      month: dayjs('2026-06-01'),
      'onUpdate:modelValue': () => emittedOrder.push('value'),
      'onUpdate:month': () => emittedOrder.push('month'),
    });

    await wrapper.get('[aria-label="回到今天"]').trigger('click');

    expect(wrapper.emitted('update:month')).toHaveLength(1);
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    expect(emittedOrder).toEqual(['value', 'month']);
    expect(typeof (wrapper.emitted('update:modelValue')?.[0]?.[0] as dayjs.Dayjs).weekday).toBe('function');
    expect((wrapper.emitted('select')?.[0]?.[0] as YMonthCalendarSelectPayload).source).toBe('header');
  });

  it('受控模式连续跨月后回到今天会同步重建面板并可继续选择日期', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-03T08:00:00'));
    const host = defineComponent({
      components: { YMonthCalendar },
      setup() {
        return {
          value: ref(dayjs('2026-07-03')),
          month: ref(dayjs('2026-07-01')),
        };
      },
      template: '<YMonthCalendar v-model="value" v-model:month="month" />',
    });
    const wrapper = mount(host, { attachTo: document.body });
    wrappers.push(wrapper);

    const nextButton = wrapper.get('[aria-label="下一月"]');
    for (let index = 0; index < 5; index += 1) {
      await nextButton.trigger('click');
    }
    expect(wrapper.get('.y-month-calendar__header-left').text()).toContain('2026年12月');

    await wrapper.get('[aria-label="回到今天"]').trigger('click');
    expect(wrapper.get('.y-month-calendar__header-left').text()).toContain('2026年07月');
    expect(wrapper.get('[data-date-key="2026-07-03"]').classes()).toContain('y-month-calendar__cell--selected');
    expect(wrapper.get('[data-date-key="2026-07-15"]').classes()).not.toContain('y-month-calendar__cell--outside');

    await wrapper.get('[data-date-key="2026-07-15"]').trigger('click');
    expect(wrapper.get('[data-date-key="2026-07-15"]').classes()).toContain('y-month-calendar__cell--selected');
  });

  it('反向合法范围会自动规范化', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const wrapper = mountCalendar({
      validRange: [dayjs('2026-06-20'), dayjs('2026-06-05')],
    });

    expect(wrapper.get('[data-date-key="2026-06-10"]').attributes('aria-disabled')).toBe('false');
    expect(wrapper.get('[data-date-key="2026-06-25"]').attributes('aria-disabled')).toBe('true');
  });

  it('方向键可移动焦点', async () => {
    const wrapper = mountCalendar({ modelValue: dayjs('2026-06-15') });
    const cell = wrapper.get('[data-date-key="2026-06-15"]');
    (cell.element as HTMLElement).focus();
    await cell.trigger('keydown', { key: 'ArrowRight' });
    await Promise.resolve();

    expect((document.activeElement as HTMLElement)?.dataset.dateKey).toBe('2026-06-16');
  });
});
