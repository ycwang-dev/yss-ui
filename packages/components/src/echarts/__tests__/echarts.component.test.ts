import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';

const mockChartInstance = {
  setOption: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
  getOption: vi.fn(() => ({})),
};

const echartsMocks = vi.hoisted(() => ({
  init: vi.fn(() => mockChartInstance),
  use: vi.fn(),
  registerTheme: vi.fn(),
}));

vi.mock('echarts', () => ({
  init: echartsMocks.init,
  use: echartsMocks.use,
  registerTheme: echartsMocks.registerTheme,
}));

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

const originalResizeObserver = globalThis.ResizeObserver;

import YEcharts from '../index.vue';

const wrappers: VueWrapper[] = [];

const mountEcharts = (options: Parameters<typeof mount>[1] = {}): VueWrapper => {
  const wrapper = mount(YEcharts, {
    attachTo: document.body,
    ...options,
  });
  wrappers.push(wrapper);
  return wrapper;
};

beforeEach(() => {
  globalThis.ResizeObserver = MockResizeObserver as any;
  vi.clearAllMocks();
});

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  globalThis.ResizeObserver = originalResizeObserver;
});

describe('YEcharts 组件测试', () => {
  it('正确渲染容器并标准化宽高尺寸', () => {
    const wrapper = mountEcharts({
      props: {
        width: 500,
        height: 320,
      },
    });

    const el = wrapper.find('.yss-echarts__container');
    expect(el.exists()).toBe(true);
    expect(el.attributes('style')).toContain('width: 500px');
    expect(el.attributes('style')).toContain('height: 320px');
  });

  it('挂载时初始化 ECharts 实例并暴露 Expose 方法', async () => {
    const wrapper = mountEcharts({
      props: {
        options: {
          title: { text: '测试图表' },
        },
      },
    });

    await nextTick();

    expect(echartsMocks.init).toHaveBeenCalled();
    expect(mockChartInstance.setOption).toHaveBeenCalledWith(
      expect.objectContaining({ title: { text: '测试图表' } }),
      expect.anything()
    );

    // 验证 Expose 接口
    const vm = wrapper.vm as any;
    expect(vm.getInstance()).toBe(mockChartInstance);

    vm.resize();
    await nextTick();
    expect(mockChartInstance.resize).toHaveBeenCalled();

    vm.setOption({ series: [] });
    expect(mockChartInstance.setOption).toHaveBeenCalledWith(
      expect.objectContaining({ series: [] }),
      expect.anything()
    );
  });

  it('当 options 属性响应式更新时自动触发 setOption', async () => {
    const wrapper = mountEcharts({
      props: {
        options: { title: { text: '初始' } },
      },
    });

    await nextTick();
    mockChartInstance.setOption.mockClear();

    await wrapper.setProps({
      options: { title: { text: '更新' } },
    });
    await nextTick();

    expect(mockChartInstance.setOption).toHaveBeenCalledWith(
      expect.objectContaining({ title: { text: '更新' } }),
      expect.anything()
    );
  });

  it('当 theme 变更时自动重建 ECharts 实例', async () => {
    const wrapper = mountEcharts({
      props: {
        theme: 'light',
      },
    });

    await nextTick();
    expect(echartsMocks.init).toHaveBeenCalledTimes(1);

    await wrapper.setProps({
      theme: 'dark',
    });
    await nextTick();

    // 重建实例前会先调用 dispose
    expect(mockChartInstance.dispose).toHaveBeenCalled();
    expect(echartsMocks.init).toHaveBeenCalledTimes(2);
  });

  it('组件卸载时正确销毁实例与观察器', async () => {
    const wrapper = mountEcharts();
    await nextTick();

    wrapper.unmount();
    expect(mockChartInstance.dispose).toHaveBeenCalled();
  });
});
