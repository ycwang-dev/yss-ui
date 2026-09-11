import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import YButton from '../index.vue';

const authState = vi.hoisted(() => ({
  permissions: new Set<string>(),
  btnInfoMap: new Map<string, { btnName: string }>(),
}));

vi.mock('@yss-ui/utils', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@yss-ui/utils');
  return {
    ...actual,
    hasAuth: (code: string) => authState.permissions.has(code),
    getBtnInfo: (code: string) => authState.btnInfoMap.get(code),
  };
});

/** 当前测试实例列表 */
const wrappers: VueWrapper[] = [];

/** 挂载辅助方法 */
const mountButton = (options: Parameters<typeof mount>[1] = {}): VueWrapper => {
  const wrapper = mount(YButton, {
    attachTo: document.body,
    ...options,
  });
  wrappers.push(wrapper);
  return wrapper;
};

beforeEach(() => {
  authState.permissions.clear();
  authState.btnInfoMap.clear();
});

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
});

describe('YButton 组件测试', () => {
  it('正确渲染默认按钮与 slot 内容', () => {
    const wrapper = mountButton({
      slots: {
        default: '提交按钮',
      },
    });

    expect(wrapper.text()).toContain('提交按钮');
    expect(wrapper.classes()).toContain('yss-button');
    expect(wrapper.classes()).toContain('yss-button--theme-primary');
  });

  it('支持切换不同的 theme 与 type 样式类名', () => {
    const wrapper = mountButton({
      props: {
        theme: 'success',
        type: 'dashed',
      },
      slots: {
        default: '成功操作',
      },
    });

    expect(wrapper.classes()).toContain('yss-button--theme-success');
    expect(wrapper.find('.ant-btn-dashed').exists()).toBe(true);
  });

  it('点击按钮派发 click 事件', async () => {
    const wrapper = mountButton({
      slots: {
        default: '可点击',
      },
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('disabled 状态下不派发 click 事件', async () => {
    const wrapper = mountButton({
      props: {
        disabled: true,
      },
      slots: {
        default: '禁用按钮',
      },
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  describe('权限控制逻辑', () => {
    it('无权限且 fallback 为 hide 时不渲染按钮', () => {
      const wrapper = mountButton({
        props: {
          permissionCode: 'USER_DELETE',
          fallback: 'hide',
        },
        slots: {
          default: '删除用户',
        },
      });

      expect(wrapper.find('button').exists()).toBe(false);
    });

    it('无权限且 fallback 为 disable 时渲染禁用按钮且点击不触发', async () => {
      const wrapper = mountButton({
        props: {
          permissionCode: 'USER_DELETE',
          fallback: 'disable',
        },
        slots: {
          default: '删除用户',
        },
      });

      const btn = wrapper.find('button');
      expect(btn.exists()).toBe(true);
      expect(btn.attributes('disabled')).toBeDefined();

      await wrapper.trigger('click');
      expect(wrapper.emitted('click')).toBeUndefined();
    });

    it('拥有权限时正常渲染并支持读取 getBtnInfo 默认名称', () => {
      authState.permissions.add('USER_ADD');
      authState.btnInfoMap.set('USER_ADD', { btnName: '新增用户默认名' });

      const wrapper = mountButton({
        props: {
          permissionCode: 'USER_ADD',
        },
      });

      expect(wrapper.text()).toContain('新增用户默认名');
    });
  });

  describe('事件修饰符', () => {
    it('支持 modifiers 包含 stop 时阻止事件冒泡', async () => {
      const wrapper = mountButton({
        props: {
          modifiers: ['stop'],
        },
        slots: {
          default: '阻止冒泡',
        },
      });

      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      const stopSpy = vi.spyOn(event, 'stopPropagation');
      wrapper.element.dispatchEvent(event);

      expect(stopSpy).toHaveBeenCalled();
    });

    it('支持 modifiers 包含 prevent 时阻止默认行为', async () => {
      const wrapper = mountButton({
        props: {
          modifiers: ['prevent'],
        },
        slots: {
          default: '阻止默认行为',
        },
      });

      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventSpy = vi.spyOn(event, 'preventDefault');
      wrapper.element.dispatchEvent(event);

      expect(preventSpy).toHaveBeenCalled();
    });
  });
});
