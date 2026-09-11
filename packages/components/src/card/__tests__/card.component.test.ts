import { afterEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import YCard from '../index.vue';

const wrappers: VueWrapper[] = [];

const mountCard = (options: Parameters<typeof mount>[1] = {}): VueWrapper => {
  const wrapper = mount(YCard, {
    attachTo: document.body,
    ...options,
  });
  wrappers.push(wrapper);
  return wrapper;
};

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
});

describe('YCard 组件测试', () => {
  it('正确渲染基础卡片和默认插槽内容', () => {
    const wrapper = mountCard({
      slots: {
        default: '<div class="custom-card-body">卡片正文</div>',
      },
    });

    expect(wrapper.classes()).toContain('y-card');
    expect(wrapper.classes()).toContain('ant-card');
    expect(wrapper.find('.custom-card-body').text()).toBe('卡片正文');
  });

  it('支持 title 和 extra 具名插槽', () => {
    const wrapper = mountCard({
      slots: {
        title: '<span class="test-title">卡片标题</span>',
        extra: '<button class="test-extra">操作链接</button>',
      },
    });

    expect(wrapper.find('.test-title').text()).toBe('卡片标题');
    expect(wrapper.find('.test-extra').text()).toBe('操作链接');
  });

  describe('padding 与 bodyStyle 计算', () => {
    it('默认将数字 padding 转化为 px 并注入 bodyStyle', () => {
      const wrapper = mountCard({
        props: {
          padding: 24,
        },
        slots: {
          default: '卡片内容',
        },
      });

      const cardBody = wrapper.find('.ant-card-body');
      expect(cardBody.exists()).toBe(true);
      expect(cardBody.attributes('style')).toContain('padding: 24px');
    });

    it('支持字符串形式的 padding（如 1.5rem）', () => {
      const wrapper = mountCard({
        props: {
          padding: '1.5rem',
        },
        slots: {
          default: '卡片内容',
        },
      });

      const cardBody = wrapper.find('.ant-card-body');
      expect(cardBody.exists()).toBe(true);
      expect(cardBody.attributes('style')).toContain('padding: 1.5rem');
    });

    it('bodyStyle.padding 拥有比 props.padding 更高的优先级', () => {
      const wrapper = mountCard({
        props: {
          padding: 20,
          bodyStyle: {
            padding: '32px',
            backgroundColor: 'rgb(240, 240, 240)',
          },
        },
        slots: {
          default: '卡片内容',
        },
      });

      const cardBody = wrapper.find('.ant-card-body');
      expect(cardBody.exists()).toBe(true);
      expect(cardBody.attributes('style')).toContain('padding: 32px');
      expect(cardBody.attributes('style')).toContain('background-color: rgb(240, 240, 240)');
    });
  });

  describe('自定义类名与样式', () => {
    it('支持通过 className 字符串和数组传入自定义类', () => {
      const wrapper = mountCard({
        props: {
          className: ['my-card-a', 'my-card-b'],
        },
      });

      expect(wrapper.classes()).toContain('my-card-a');
      expect(wrapper.classes()).toContain('my-card-b');
    });

    it('支持 customStyle 自定义根元素样式', () => {
      const wrapper = mountCard({
        props: {
          customStyle: {
            minHeight: '200px',
          },
        },
      });

      expect(wrapper.attributes('style')).toContain('min-height: 200px');
    });
  });

  describe('Meta 信息区渲染', () => {
    it('传入 metaTitle 和 metaDescription 时渲染 ACardMeta', () => {
      const wrapper = mountCard({
        props: {
          metaTitle: '用户头像标题',
          metaDescription: '这是副标题描述',
        },
      });

      const meta = wrapper.find('.ant-card-meta');
      expect(meta.exists()).toBe(true);
      expect(meta.text()).toContain('用户头像标题');
      expect(meta.text()).toContain('这是副标题描述');
    });

    it('支持通过 meta-avatar 和 meta-title 具名插槽自定义 Meta 区域', () => {
      const wrapper = mountCard({
        slots: {
          'meta-avatar': '<span class="avatar-slot">头像插槽</span>',
          'meta-title': '<span class="title-slot">标题插槽</span>',
        },
      });

      expect(wrapper.find('.avatar-slot').exists()).toBe(true);
      expect(wrapper.find('.title-slot').exists()).toBe(true);
    });

    it('支持完全通过 meta 具名插槽替换整个 Meta 区域', () => {
      const wrapper = mountCard({
        slots: {
          meta: '<div class="custom-meta-block">自定义整个Meta块</div>',
        },
      });

      expect(wrapper.find('.custom-meta-block').exists()).toBe(true);
    });
  });
});
