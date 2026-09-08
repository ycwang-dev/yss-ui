import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';

const mediaQueryState = vi.hoisted(() => ({ value: false }));

vi.mock('@vueuse/core', async () => {
  return {
    useMediaQuery: () => mediaQueryState,
    useResizeObserver: (): void => undefined,
    useThrottleFn: <T extends (...args: any[]) => any>(fn: T) => fn,
  };
});

vi.mock('@ant-design/icons-vue', () => ({
  DoubleLeftOutlined: defineComponent({
    name: 'DoubleLeftOutlinedStub',
    setup: () => () => h('span', { class: 'double-left-stub' }),
  }),
  DoubleRightOutlined: defineComponent({
    name: 'DoubleRightOutlinedStub',
    setup: () => () => h('span', { class: 'double-right-stub' }),
  }),
  VerticalAlignTopOutlined: defineComponent({
    name: 'VerticalAlignTopOutlinedStub',
    setup: () => () => h('span'),
  }),
  VerticalAlignMiddleOutlined: defineComponent({
    name: 'VerticalAlignMiddleOutlinedStub',
    setup: () => () => h('span'),
  }),
  VerticalAlignBottomOutlined: defineComponent({
    name: 'VerticalAlignBottomOutlinedStub',
    setup: () => () => h('span'),
  }),
}));

import YSplitPane from '../index.vue';

const wrappers: VueWrapper[] = [];

/** 挂载 SplitPane 并注册统一清理。 */
const mountSplitPane = (props: Record<string, unknown> = {}): VueWrapper => {
  const wrapper = mount(YSplitPane, {
    props: {
      initialWidth: 320,
      minWidth: 200,
      maxWidth: 480,
      ...props,
    },
    slots: {
      left: '<div class="left-content">左侧重内容</div>',
      right: '<div class="right-content">右侧重内容</div>',
      top: '<div class="top-content">上侧重内容</div>',
      bottom: '<div class="bottom-content">下侧重内容</div>',
    },
    attachTo: document.body,
  });
  wrappers.push(wrapper);
  return wrapper;
};

/** 触发指定节点的 transitionend。 */
const triggerTransitionEnd = async (wrapper: VueWrapper, selector: string, propertyName: string): Promise<void> => {
  await wrapper.get(selector).trigger('transitionend', { propertyName });
  await nextTick();
};

beforeEach(() => {
  mediaQueryState.value = false;
  vi.useFakeTimers();
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => window.setTimeout(() => callback(0), 0));
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => window.clearTimeout(id));
});

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  document.body.innerHTML = '';
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('YSplitPane collapse animation', () => {
  it('默认保持 size 尺寸过渡兼容行为', async () => {
    const wrapper = mountSplitPane();

    await wrapper.get('.y-split-pane__toggle').trigger('click');
    await nextTick();

    expect(wrapper.classes()).toContain('is-collapse-size');
    expect(wrapper.classes()).toContain('is-collapsed');
    expect(wrapper.classes()).toContain('is-collapsing');
    expect(wrapper.get('.y-split-pane__left').attributes('style')).toContain('width: 0px');
    expect(wrapper.get('.left-content').isVisible()).toBe(true);

    await triggerTransitionEnd(wrapper, '.y-split-pane__left', 'width');

    expect(wrapper.classes()).not.toContain('is-transitioning');
    expect(wrapper.get('.left-content').isVisible()).toBe(false);
  });

  it('transform 折叠期间保持展开布局并在过渡结束后提交折叠布局', async () => {
    const wrapper = mountSplitPane({ collapseAnimation: 'transform' });

    await wrapper.get('.y-split-pane__toggle').trigger('click');
    await nextTick();

    expect(wrapper.classes()).toContain('is-collapse-transform');
    expect(wrapper.classes()).toContain('is-collapsing');
    expect(wrapper.classes()).not.toContain('is-collapsed');
    expect(wrapper.get('.y-split-pane__left').attributes('style')).toContain('width: 320px');
    expect(wrapper.get('.y-split-pane__toggle').attributes('disabled')).toBeDefined();

    await vi.advanceTimersByTimeAsync(1);
    await nextTick();
    expect(wrapper.classes()).toContain('is-transition-active');

    await triggerTransitionEnd(wrapper, '.y-split-pane__right', 'transform');

    expect(wrapper.classes()).toContain('is-collapsed');
    expect(wrapper.classes()).not.toContain('is-transitioning');
    expect(wrapper.get('.y-split-pane__left').attributes('style')).toContain('width: 0px');
    expect(wrapper.get('.left-content').isVisible()).toBe(false);
  });

  it('transform 展开期间保持折叠布局并提前恢复内容', async () => {
    const wrapper = mountSplitPane({ collapsed: true, collapseAnimation: 'transform' });

    expect(wrapper.classes()).toContain('is-collapsed');
    expect(wrapper.get('.left-content').isVisible()).toBe(false);

    await wrapper.get('.y-split-pane__toggle').trigger('click');
    await nextTick();

    expect(wrapper.classes()).toContain('is-expanding');
    expect(wrapper.classes()).toContain('is-collapsed');
    expect(wrapper.get('.left-content').isVisible()).toBe(true);

    await vi.advanceTimersByTimeAsync(1);
    await triggerTransitionEnd(wrapper, '.y-split-pane__right', 'transform');

    expect(wrapper.classes()).not.toContain('is-collapsed');
    expect(wrapper.get('.y-split-pane__left').attributes('style')).toContain('width: 320px');
  });

  it('none 模式一次性提交最终布局且不进入过渡阶段', async () => {
    const wrapper = mountSplitPane({ collapseAnimation: 'none' });

    await wrapper.get('.y-split-pane__toggle').trigger('click');
    await nextTick();

    expect(wrapper.classes()).toContain('is-collapse-none');
    expect(wrapper.classes()).toContain('is-collapsed');
    expect(wrapper.classes()).not.toContain('is-transitioning');
    expect(wrapper.get('.left-content').isVisible()).toBe(false);
  });

  it('系统启用减少动态效果时自动按 none 模式处理', async () => {
    mediaQueryState.value = true;
    const wrapper = mountSplitPane({ collapseAnimation: 'transform' });

    await wrapper.get('.y-split-pane__toggle').trigger('click');
    await nextTick();

    expect(wrapper.classes()).toContain('is-collapse-none');
    expect(wrapper.classes()).toContain('is-collapsed');
    expect(wrapper.classes()).not.toContain('is-transitioning');
  });

  it('外部状态在 transform 过渡期间变化时排队执行最新目标', async () => {
    const wrapper = mountSplitPane({ collapsed: false, collapseAnimation: 'transform' });

    await wrapper.setProps({ collapsed: true });
    await nextTick();
    expect(wrapper.classes()).toContain('is-collapsing');

    await wrapper.setProps({ collapsed: false });
    await nextTick();
    await triggerTransitionEnd(wrapper, '.y-split-pane__right', 'transform');
    await nextTick();

    expect(wrapper.classes()).toContain('is-expanding');
    expect(wrapper.classes()).toContain('is-collapsed');
  });

  it('destroyOnCollapse 仅在 transform 过渡完成后卸载内容', async () => {
    const wrapper = mountSplitPane({ collapseAnimation: 'transform', destroyOnCollapse: true });

    await wrapper.get('.y-split-pane__toggle').trigger('click');
    await nextTick();
    expect(wrapper.find('.left-content').exists()).toBe(true);

    await vi.advanceTimersByTimeAsync(1);
    await triggerTransitionEnd(wrapper, '.y-split-pane__right', 'transform');
    expect(wrapper.find('.left-content').exists()).toBe(false);
  });

  it('非受控模式折叠时缓存尺寸并在展开后恢复', async () => {
    const wrapper = mountSplitPane({
      initialWidth: 340,
      storageKey: 'split-pane-test-width',
      collapseAnimation: 'transform',
    });

    await wrapper.get('.y-split-pane__toggle').trigger('click');
    await nextTick();
    expect(localStorage.getItem('split-pane-test-width')).toBe('340');

    await vi.advanceTimersByTimeAsync(1);
    await triggerTransitionEnd(wrapper, '.y-split-pane__right', 'transform');
    await wrapper.get('.y-split-pane__toggle').trigger('click');
    await nextTick();
    await vi.advanceTimersByTimeAsync(1);
    await triggerTransitionEnd(wrapper, '.y-split-pane__right', 'transform');

    expect(wrapper.get('.y-split-pane__left').attributes('style')).toContain('width: 340px');
  });

  it('vertical transform 使用高度布局并在结束后折叠为零', async () => {
    const wrapper = mountSplitPane({
      direction: 'vertical',
      initialHeight: 240,
      minHeight: 120,
      maxHeight: 400,
      collapseAnimation: 'transform',
    });

    await wrapper.get('.y-split-pane__toggle').trigger('click');
    await nextTick();

    expect(wrapper.classes()).toContain('is-vertical');
    expect(wrapper.get('.y-split-pane__left').attributes('style')).toContain('height: 240px');

    await vi.advanceTimersByTimeAsync(1);
    await triggerTransitionEnd(wrapper, '.y-split-pane__right', 'transform');
    expect(wrapper.get('.y-split-pane__left').attributes('style')).toContain('height: 0px');
  });
});

describe('YSplitPane drag resize', () => {
  it('deferred 模式拖动期间只移动代理线，释放后提交一次真实宽度', async () => {
    const wrapper = mountSplitPane({ resizeMode: 'deferred' });
    const divider = wrapper.get('.y-split-pane__divider');

    await divider.trigger('mousedown', { button: 0, clientX: 320 });
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 400 }));
    await vi.advanceTimersByTimeAsync(1);
    await nextTick();

    expect(wrapper.classes()).toContain('is-resize-deferred');
    expect(wrapper.get('.y-split-pane__left').attributes('style')).toContain('width: 320px');
    expect(wrapper.get('.y-split-pane__drag-preview').attributes('style')).toContain('translate3d(403px, 0, 0)');
    expect(divider.attributes('style')).toContain('translate3d(80px, 0, 0)');
    expect(wrapper.emitted('update:leftWidth')).toBeUndefined();

    window.dispatchEvent(new MouseEvent('mouseup'));
    await nextTick();

    expect(wrapper.find('.y-split-pane__drag-preview').exists()).toBe(false);
    expect(wrapper.get('.y-split-pane__left').attributes('style')).toContain('width: 400px');
    expect(wrapper.emitted('update:leftWidth')).toEqual([[400]]);
    expect(wrapper.emitted('resize')).toEqual([[{ size: 400, width: 400 }]]);
  });

  it('deferred 模式释放时不会丢失尚未执行 RAF 的最后位置', async () => {
    const wrapper = mountSplitPane({ resizeMode: 'deferred' });
    const divider = wrapper.get('.y-split-pane__divider');

    await divider.trigger('mousedown', { button: 0, clientX: 320 });
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 410 }));
    window.dispatchEvent(new MouseEvent('mouseup'));
    await nextTick();

    expect(wrapper.get('.y-split-pane__left').attributes('style')).toContain('width: 410px');
    expect(wrapper.emitted('update:leftWidth')).toEqual([[410]]);
  });

  it('realtime 默认模式继续在拖动期间更新真实宽度', async () => {
    const wrapper = mountSplitPane();
    const divider = wrapper.get('.y-split-pane__divider');

    await divider.trigger('mousedown', { button: 0, clientX: 320 });
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 360 }));
    await vi.advanceTimersByTimeAsync(1);
    await nextTick();

    expect(wrapper.classes()).toContain('is-resize-realtime');
    expect(wrapper.find('.y-split-pane__drag-preview').exists()).toBe(false);
    expect(wrapper.get('.y-split-pane__left').attributes('style')).toContain('width: 360px');
    expect(wrapper.emitted('update:leftWidth')).toEqual([[360]]);

    window.dispatchEvent(new MouseEvent('mouseup'));
  });

  it('vertical deferred 模式仅在释放后提交真实高度', async () => {
    const wrapper = mountSplitPane({
      direction: 'vertical',
      initialHeight: 240,
      minHeight: 120,
      maxHeight: 400,
      resizeMode: 'deferred',
    });
    const divider = wrapper.get('.y-split-pane__divider');

    await divider.trigger('mousedown', { button: 0, clientY: 240 });
    window.dispatchEvent(new MouseEvent('mousemove', { clientY: 300 }));
    await vi.advanceTimersByTimeAsync(1);
    await nextTick();

    expect(wrapper.get('.y-split-pane__left').attributes('style')).toContain('height: 240px');
    expect(wrapper.get('.y-split-pane__drag-preview').attributes('style')).toContain('translate3d(0, 303px, 0)');

    window.dispatchEvent(new MouseEvent('mouseup'));
    await nextTick();

    expect(wrapper.get('.y-split-pane__left').attributes('style')).toContain('height: 300px');
    expect(wrapper.emitted('update:topHeight')).toEqual([[300]]);
  });

  it('拖拽边界只在开始时读取一次，移动阶段不触发布局读取', async () => {
    const wrapper = mountSplitPane({ resizeMode: 'deferred' });
    const root = wrapper.get('.y-split-pane').element as HTMLElement;
    const clientWidthGetter = vi.fn(() => 1000);
    Object.defineProperty(root, 'clientWidth', { configurable: true, get: clientWidthGetter });

    await wrapper.get('.y-split-pane__divider').trigger('mousedown', { button: 0, clientX: 320 });
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 350 }));
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 380 }));
    await vi.advanceTimersByTimeAsync(1);
    window.dispatchEvent(new MouseEvent('mouseup'));

    expect(clientWidthGetter).toHaveBeenCalledTimes(1);
  });
});
