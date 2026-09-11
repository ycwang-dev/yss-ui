import { afterEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import YCron from '../index.vue';

const wrappers: VueWrapper[] = [];

const mountCron = (options: Parameters<typeof mount>[1] = {}): VueWrapper => {
  const wrapper = mount(YCron, {
    attachTo: document.body,
    ...options,
  });
  wrappers.push(wrapper);
  return wrapper;
};

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
});

describe('YCron 组件测试', () => {
  it('正确渲染基础结构并派发初始表达式', () => {
    const wrapper = mountCron({
      props: {
        modelValue: '0 0 12 * * ?',
      },
    });

    expect(wrapper.classes()).toContain('y-cron');
    // 验证初始状态派发（默认包含年维度）
    expect(wrapper.emitted('update:modelValue')).toBeDefined();
    expect(wrapper.emitted('change')).toBeDefined();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['0 0 12 * * ? *']);
  });

  describe('维度导航渲染与显隐控制', () => {
    it('默认显示 6 个时间维度项（秒/分/时/天/月/年）', () => {
      const wrapper = mountCron({
        props: {
          modelValue: '0 0 12 * * ?',
        },
      });

      const navItems = wrapper.findAll('.y-cron__nav-item');
      expect(navItems.length).toBe(6);
      expect(wrapper.text()).toContain('秒');
      expect(wrapper.text()).toContain('分');
      expect(wrapper.text()).toContain('时');
      expect(wrapper.text()).toContain('天');
      expect(wrapper.text()).toContain('月');
      expect(wrapper.text()).toContain('年');
    });

    it('配置 showSecond: false 时隐藏秒维度', () => {
      const wrapper = mountCron({
        props: {
          showSecond: false,
        },
      });

      const navItems = wrapper.findAll('.y-cron__nav-item');
      expect(navItems.length).toBe(5);
      expect(navItems.map(i => i.text()).join(',')).not.toContain('秒');
    });

    it('配置 showYear: false 时隐藏年维度', () => {
      const wrapper = mountCron({
        props: {
          showYear: false,
        },
      });

      const navItems = wrapper.findAll('.y-cron__nav-item');
      expect(navItems.length).toBe(5);
      expect(navItems.map(i => i.text()).join(',')).not.toContain('年');
    });
  });

  describe('维度切换与单选交互', () => {
    it('点击导航项切换激活维度', async () => {
      const wrapper = mountCron({
        props: {
          modelValue: '0 0 12 * * ?',
        },
      });

      const navItems = wrapper.findAll('.y-cron__nav-item');
      // 切换到“分”维度（索引 1）
      await navItems[1].trigger('click');

      expect(navItems[1].classes()).toContain('y-cron__nav-item--active');
    });

    it('响应外部 modelValue 属性变更并重新解析', async () => {
      const wrapper = mountCron({
        props: {
          modelValue: '0 0 12 * * ?',
        },
      });

      // 外部更新表达式为每天 8 点
      await wrapper.setProps({
        modelValue: '0 0 8 * * ?',
      });

      expect(wrapper.text()).toContain('0 0 8 * * ?');
    });
  });
});
