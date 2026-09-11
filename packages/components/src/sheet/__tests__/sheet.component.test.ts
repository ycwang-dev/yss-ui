import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  if (typeof (globalThis as any).Path2D === 'undefined') {
    (globalThis as any).Path2D = class Path2D {};
  }
});

import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick, ref, shallowRef } from 'vue';

const mockActiveWorkbook = {
  save: vi.fn(() => ({ id: 'wb-1', name: '工作簿', sheets: {} })),
  dispose: vi.fn(),
  getId: vi.fn(() => 'wb-1'),
};

const mockUniverAPI = {
  getActiveWorkbook: vi.fn(() => mockActiveWorkbook),
  createWorkbook: vi.fn(() => mockActiveWorkbook),
  dispose: vi.fn(),
  setLocale: vi.fn(),
  onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
};

vi.mock('../hooks/useSheetInstance', () => ({
  useSheetInstance: () => ({
    univerAPI: shallowRef(mockUniverAPI),
    initializing: ref(false),
    initError: shallowRef(null),
    dispose: vi.fn(),
  }),
}));

import YSheet from '../index.vue';

const wrappers: VueWrapper[] = [];

const mountSheet = (options: Parameters<typeof mount>[1] = {}): VueWrapper => {
  const wrapper = mount(YSheet, {
    attachTo: document.body,
    ...options,
  });
  wrappers.push(wrapper);
  return wrapper;
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
});

describe('YSheet 组件测试', () => {
  it('正确挂载容器并应用自定义高度样式', () => {
    const wrapper = mountSheet({
      props: {
        height: 650,
      },
    });

    const root = wrapper.find('.y-sheet-container');
    expect(root.exists()).toBe(true);
    expect(root.attributes('style')).toContain('height: 650px');
  });

  it('暴露 Expose 实例接口能力（getUniverAPI, getWorkbook, save, reload, dispose）', async () => {
    const wrapper = mountSheet();
    await nextTick();

    const vm = wrapper.vm as any;
    expect(vm.getUniverAPI).toBeDefined();
    expect(vm.getUniverAPI()).toBe(mockUniverAPI);
    expect(vm.getWorkbook).toBeDefined();

    // 触发保存并验证 update:modelValue 事件与返回值
    const savedData = await vm.save();
    expect(mockActiveWorkbook.save).toHaveBeenCalled();
    expect(savedData).toEqual(expect.objectContaining({ id: 'wb-1' }));
    expect(wrapper.emitted('update:modelValue')).toBeDefined();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([expect.objectContaining({ id: 'wb-1' })]);

    // 验证 reload 方法
    expect(vm.reload).toBeDefined();
    expect(vm.dispose).toBeDefined();
  });

  it('支持 readonly 只读模式', () => {
    const wrapper = mountSheet({
      props: {
        readonly: true,
      },
    });

    const root = wrapper.find('.y-sheet-container');
    expect(root.attributes('aria-readonly')).toBe('true');
  });

  it('组件卸载时安全调用 dispose', () => {
    const wrapper = mountSheet();
    const vm = wrapper.vm as any;

    wrapper.unmount();
    expect(vm.dispose).toBeDefined();
  });
});
