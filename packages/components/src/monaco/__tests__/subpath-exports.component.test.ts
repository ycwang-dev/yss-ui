import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { YMonaco, YMonacoDiff, ensureMonacoCss } from '../index';
import { YEcharts } from '../../echarts/index';
import { YMonaco as AsyncMonaco, YMonacoDiff as AsyncMonacoDiff } from '../main-exports';
import { YEcharts as AsyncEcharts } from '../../echarts/main-exports';

describe('Monaco & ECharts subpath and async exports', () => {
  it('子路径入口应当正确导出独立组件和辅助函数', () => {
    expect(YMonaco).toBeDefined();
    expect(YMonacoDiff).toBeDefined();
    expect(typeof ensureMonacoCss).toBe('function');
    expect(YEcharts).toBeDefined();
  });

  it('main-exports 异步导出组件可以作为合法 Vue 组件被挂载', async () => {
    expect(AsyncMonaco).toBeDefined();
    expect(AsyncMonacoDiff).toBeDefined();
    expect(AsyncEcharts).toBeDefined();

    const TestHost = defineComponent({
      render() {
        return h('div', [h(AsyncMonaco, { modelValue: 'test' })]);
      },
    });

    const wrapper = mount(TestHost);
    expect(wrapper.exists()).toBe(true);
    wrapper.unmount();
  });
});
