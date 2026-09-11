import { defineComponent, h } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';

vi.mock('ant-design-vue', async () => {
  const actual = await vi.importActual<Record<string, any>>('ant-design-vue');
  return {
    ...actual,
    Dropdown: defineComponent({
      name: 'ADropdown',
      setup(_props, { slots }) {
        return () => h('div', { class: 'y-tree-dropdown-stub' }, [slots.default?.(), slots.overlay?.()]);
      },
    }),
  };
});

import YTree from '../index.vue';

const wrappers: VueWrapper[] = [];

const mockTreeData = [
  {
    key: 'node-1',
    title: '第一层节点 A',
    children: [
      {
        key: 'node-1-1',
        title: '子节点 A-1',
      },
      {
        key: 'node-1-2',
        title: '子节点 A-2',
      },
    ],
  },
  {
    key: 'node-2',
    title: '第一层节点 B',
  },
];

const mountTree = (options: Parameters<typeof mount>[1] = {}): VueWrapper => {
  const wrapper = mount(YTree, {
    attachTo: document.body,
    ...options,
  });
  wrappers.push(wrapper);
  return wrapper;
};

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
});

describe('YTree 组件测试', () => {
  it('正确渲染基础节点与层级', () => {
    const wrapper = mountTree({
      props: {
        treeData: mockTreeData,
        defaultExpandAll: true,
      },
    });

    expect(wrapper.classes()).toContain('y-tree');
    expect(wrapper.text()).toContain('第一层节点 A');
    expect(wrapper.text()).toContain('第一层节点 B');
  });

  describe('搜索过滤能力', () => {
    it('filterable 为 true 时默认渲染搜索头部与输入框', () => {
      const wrapper = mountTree({
        props: {
          treeData: mockTreeData,
          filterable: true,
        },
      });

      expect(wrapper.find('.y-tree__header').exists()).toBe(true);
      expect(wrapper.find('.y-tree__header input').exists()).toBe(true);
    });

    it('filterable 为 false 时隐藏搜索头部', () => {
      const wrapper = mountTree({
        props: {
          treeData: mockTreeData,
          filterable: false,
        },
      });

      expect(wrapper.find('.y-tree__header').exists()).toBe(false);
    });

    it('输入搜索关键词触发 update:searchValue 与节点过滤', async () => {
      const wrapper = mountTree({
        props: {
          treeData: mockTreeData,
          filterable: true,
        },
      });

      const input = wrapper.find('.y-tree__header input');
      await input.setValue('节点 B');

      expect(wrapper.emitted('update:searchValue')?.at(-1)).toEqual(['节点 B']);
      expect(wrapper.text()).toContain('第一层节点 B');
      expect(wrapper.text()).not.toContain('第一层节点 A');
    });
  });

  describe('节点选择与事件派发', () => {
    it('ATree 触发 select 时同步派发 update:selectedKeys 与 select 事件', async () => {
      const wrapper = mountTree({
        props: {
          treeData: mockTreeData,
        },
      });

      // 找到内部的 ATree 组件并模拟其派发的 select 事件
      const atree = wrapper.findComponent({ name: 'ATree' });
      expect(atree.exists()).toBe(true);

      atree.vm.$emit('select', ['node-1'], {
        node: { dataRef: mockTreeData[0] },
        selected: true,
      });

      expect(wrapper.emitted('select')).toBeDefined();
      expect(wrapper.emitted('select')?.[0]?.[0]).toEqual(['node-1']);
    });

    it('点击操作项按钮时若 selectOnActionClick 为 true 则自动选中该节点', async () => {
      const wrapper = mountTree({
        props: {
          treeData: mockTreeData,
          showActions: true,
          selectOnActionClick: true,
          getNodeActions: () => [{ key: 'view', label: '查看' }],
        },
      });

      // 找到更多操作图标并触发点击
      const moreIcon = wrapper.find('.y-tree__more');
      expect(moreIcon.exists()).toBe(true);
      await moreIcon.trigger('click');

      expect(wrapper.emitted('update:selectedKeys')?.[0]).toEqual([['node-1']]);
    });

    it('受控模式下响应外部传入的 selectedKeys', () => {
      const wrapper = mountTree({
        props: {
          treeData: mockTreeData,
          selectedKeys: ['node-1'],
        },
      });

      const selectedNode = wrapper.find('.ant-tree-node-selected');
      expect(selectedNode.exists()).toBe(true);
    });
  });

  describe('加载状态展示', () => {
    it('loading 为 true 时展示 Spin 遮罩', () => {
      const wrapper = mountTree({
        props: {
          treeData: mockTreeData,
          loading: true,
          loadingTip: '正在同步树数据...',
        },
      });

      const spin = wrapper.find('.ant-spin');
      expect(spin.exists()).toBe(true);
      expect(wrapper.text()).toContain('正在同步树数据...');
    });
  });

  describe('自定义 fieldNames 映射', () => {
    it('支持非默认属性名的树结构渲染', () => {
      const customTreeData = [
        {
          id: 'custom-1',
          name: '自定义属性节点 1',
          items: [
            {
              id: 'custom-1-1',
              name: '自定义子节点 1-1',
            },
          ],
        },
      ];

      const wrapper = mountTree({
        props: {
          treeData: customTreeData,
          fieldNames: {
            key: 'id',
            title: 'name',
            children: 'items',
          },
        },
      });

      expect(wrapper.text()).toContain('自定义属性节点 1');
    });
  });

  describe('操作项与 action 事件', () => {
    it('配置 getNodeActions 时渲染操作项并可点击触发 action', async () => {
      const wrapper = mountTree({
        props: {
          treeData: mockTreeData,
          showActions: true,
          getNodeActions: (node: any) => [
            { key: 'edit', label: `编辑-${node.title}` },
            { key: 'delete', label: '删除' },
          ],
        },
      });

      // 验证渲染了操作项
      expect(wrapper.text()).toContain('编辑-第一层节点 A');

      // 触发操作菜单点击
      const menuItem = wrapper.findAll('.ant-menu-item').find(el => el.text().includes('编辑-第一层节点 A'));
      expect(menuItem).toBeDefined();
      await menuItem?.trigger('click');

      expect(wrapper.emitted('action')).toBeDefined();
      const payload = (wrapper.emitted('action')?.[0] as any[])[0];
      expect(payload.key).toBe('edit');
      expect(payload.node.key).toBe('node-1');
    });
  });
});
