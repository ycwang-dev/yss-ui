import { defineComponent, h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import AuthorityDropdown from '../AuthorityDropdown.vue';

const authState = vi.hoisted(() => ({
  permissions: new Set<string>(),
  btnInfoMap: new Map<string, { btnName: string }>(),
}));

vi.mock('ant-design-vue', async () => {
  const actual = await vi.importActual<Record<string, any>>('ant-design-vue');
  return {
    ...actual,
    Dropdown: defineComponent({
      name: 'ADropdown',
      setup(_props, { slots }) {
        return () => h('div', { class: 'ant-dropdown-stub' }, [slots.default?.(), slots.overlay?.()]);
      },
    }),
  };
});

vi.mock('@yss-ui/utils', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@yss-ui/utils');
  return {
    ...actual,
    hasAuth: (code: string) => authState.permissions.has(code),
    getBtnInfo: (code: string) => authState.btnInfoMap.get(code),
  };
});

const wrappers: VueWrapper[] = [];

const mountDropdown = (options: Parameters<typeof mount>[1] = {}): VueWrapper => {
  const wrapper = mount(AuthorityDropdown, {
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

describe('AuthorityDropdown 组件测试', () => {
  it('无 permissionCode 时默认渲染按钮与 slot 文案', () => {
    const wrapper = mountDropdown({
      slots: {
        default: '批量操作',
      },
    });

    expect(wrapper.text()).toContain('批量操作');
    expect(wrapper.find('button').exists()).toBe(true);
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined();
  });

  describe('按钮级权限拦截', () => {
    it('父按钮无权限且 fallback="hide" 时不渲染任何 DOM', () => {
      const wrapper = mountDropdown({
        props: {
          permissionCode: 'BATCH_ACTION',
          fallback: 'hide',
        },
        slots: {
          default: '批量操作',
        },
      });

      expect(wrapper.find('button').exists()).toBe(false);
    });

    it('父按钮无权限且 fallback="disable" 时渲染禁用态按钮', () => {
      const wrapper = mountDropdown({
        props: {
          permissionCode: 'BATCH_ACTION',
          fallback: 'disable',
        },
        slots: {
          default: '批量操作',
        },
      });

      const btn = wrapper.find('button');
      expect(btn.exists()).toBe(true);
      expect(btn.attributes('disabled')).toBeDefined();
    });

    it('有权限时根据 permissionCode 从 getBtnInfo 渲染默认名称', () => {
      authState.permissions.add('BATCH_EXPORT');
      authState.btnInfoMap.set('BATCH_EXPORT', { btnName: '批量导出' });

      const wrapper = mountDropdown({
        props: {
          permissionCode: 'BATCH_EXPORT',
        },
      });

      expect(wrapper.text()).toContain('批量导出');
    });
  });

  describe('下拉项权限与点击交互', () => {
    it('根据各项的 permissionCode 过滤无权限的菜单项', () => {
      authState.permissions.add('ACTION_EXPORT');

      const items = [
        { id: '1', text: '全部导出', permissionCode: 'ACTION_EXPORT' },
        { id: '2', text: '全部删除', permissionCode: 'ACTION_DELETE' },
        { id: '3', text: '公开详情' }, // 无 permissionCode 始终放行
      ];

      const wrapper = mountDropdown({
        props: {
          dropdownItems: items,
        },
      });

      const menuItems = wrapper.findAll('.ant-menu-item');
      expect(menuItems).toHaveLength(2);
      expect(menuItems[0].text()).toBe('全部导出');
      expect(menuItems[1].text()).toBe('公开详情');
    });

    it('支持自定义 options 字段映射并派发 command 事件', async () => {
      const items = [
        { key: 'download_pdf', title: '导出 PDF' },
        { key: 'download_excel', title: '导出 Excel' },
      ];

      const wrapper = mountDropdown({
        props: {
          dropdownItems: items,
          options: {
            label: 'title',
            value: 'key',
          },
        },
      });

      const menuItems = wrapper.findAll('.ant-menu-item');
      expect(menuItems).toHaveLength(2);
      expect(menuItems[0].text()).toBe('导出 PDF');

      // 触发菜单项点击
      await menuItems[0].trigger('click');

      expect(wrapper.emitted('command')).toHaveLength(1);
      expect(wrapper.emitted('command')?.[0]).toEqual([{ key: 'download_pdf', title: '导出 PDF' }]);
    });
  });
});
