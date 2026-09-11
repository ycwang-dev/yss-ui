import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';

const mockModel = {
  getValue: vi.fn(() => 'SELECT 1;'),
  setValue: vi.fn(),
  getLineCount: vi.fn(() => 5),
  getValueInRange: vi.fn(() => ''),
  getFullModelRange: vi.fn(() => ({ startLineNumber: 1, startColumn: 1, endLineNumber: 5, endColumn: 10 })),
  onDidChangeContent: vi.fn(() => ({ dispose: vi.fn() })),
  updateOptions: vi.fn(),
};

const mockEditorInstance = {
  getModel: vi.fn(() => mockModel),
  getValue: vi.fn(() => 'SELECT 1;'),
  setValue: vi.fn(),
  layout: vi.fn(),
  dispose: vi.fn(),
  updateOptions: vi.fn(),
  onDidChangeModelContent: vi.fn(() => ({ dispose: vi.fn() })),
  onDidBlurEditorWidget: vi.fn(() => ({ dispose: vi.fn() })),
  onDidBlurEditorText: vi.fn(() => ({ dispose: vi.fn() })),
  onDidChangeCursorSelection: vi.fn(() => ({ dispose: vi.fn() })),
  onDidScrollChange: vi.fn(() => ({ dispose: vi.fn() })),
  addAction: vi.fn(),
  addCommand: vi.fn(),
  getPosition: vi.fn(() => ({ lineNumber: 1, column: 1 })),
  executeEdits: vi.fn(),
  pushUndoStop: vi.fn(),
  revealLine: vi.fn(),
};

const monacoApiMock = {
  editor: {
    create: vi.fn(() => mockEditorInstance),
    createModel: vi.fn(() => mockModel),
    setTheme: vi.fn(),
    setModelLanguage: vi.fn(),
  },
  languages: {
    register: vi.fn(),
    setMonarchTokensProvider: vi.fn(),
    registerCompletionItemProvider: vi.fn(() => ({ dispose: vi.fn() })),
    registerDocumentFormattingEditProvider: vi.fn(() => ({ dispose: vi.fn() })),
  },
  KeyMod: { CtrlCmd: 2048, Shift: 1024, Alt: 512, WinCtrl: 256 },
  KeyCode: { Enter: 3, KeyF: 36, KeyS: 49 },
};

vi.mock('monaco-editor/esm/vs/editor/editor.api', () => ({
  default: monacoApiMock,
  ...monacoApiMock,
}));

vi.mock('../hooks/useMonacoLoader', () => ({
  useMonacoLoader: () => ({
    ensureMonaco: async () => monacoApiMock,
    ensureContributions: async () => {},
    ensureLanguageContribution: async () => {},
    tryLoadLanguageCompletion: vi.fn(),
    getMonaco: () => monacoApiMock,
  }),
}));

import YMonaco from '../index.vue';

const wrappers: VueWrapper[] = [];

const mountMonaco = (options: Record<string, any> = {}): VueWrapper => {
  const { props: customProps, ...restOptions } = options;
  const wrapper = mount(YMonaco as any, {
    attachTo: document.body,
    props: {
      modelValue: 'SELECT 1;',
      ...customProps,
    },
    ...restOptions,
  });
  wrappers.push(wrapper);
  return wrapper;
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation((...args) => {
    console.log('LOGGED ERROR:', ...args);
  });
});

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
});

describe('YMonaco 组件测试', () => {
  it('正确渲染容器并标准化宽高尺寸', async () => {
    const wrapper = mountMonaco({
      props: {
        width: 600,
        height: 400,
      },
    });

    await nextTick();
    await new Promise(r => setTimeout(r, 20));

    const root = wrapper.find('.yss-monaco-wrapper');
    expect(root.exists()).toBe(true);
    expect(root.attributes('style')).toContain('width: 600px');
    expect(root.attributes('style')).toContain('height: 400px');
  });

  it('展示工具栏及其操作按钮（复制、全屏、下载）', async () => {
    const wrapper = mountMonaco({
      props: {
        showToolbar: true,
      },
    });

    await nextTick();
    await new Promise(r => setTimeout(r, 20));

    expect(wrapper.find('.yss-monaco-toolbar').exists()).toBe(true);
    expect(wrapper.findAll('.yss-monaco-toolbar-btn').length).toBeGreaterThan(0);
  });

  it('showToolbar 为 false 时隐藏工具栏', async () => {
    const wrapper = mountMonaco({
      props: {
        showToolbar: false,
      },
    });

    await nextTick();
    await new Promise(r => setTimeout(r, 20));

    expect(wrapper.find('.yss-monaco-toolbar').exists()).toBe(false);
  });

  it('初始化创建编辑器并暴露实例与常用方法', async () => {
    const wrapper = mountMonaco({
      props: {
        modelValue: 'SELECT 1;',
        language: 'sql',
      },
    });

    // 等待异步加载和实例创建
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(monacoApiMock.editor.create).toHaveBeenCalled();

    const vm = wrapper.vm as any;
    expect(vm.getInstance()).toBe(mockEditorInstance);

    // 验证 expose 方法调用
    vm.layout();
    expect(mockEditorInstance.layout).toHaveBeenCalled();

    vm.setValue('SELECT 2;');
    expect(mockEditorInstance.setValue).toHaveBeenCalledWith('SELECT 2;');

    expect(vm.getLineCount()).toBe(5);
  });

  it('readonly 属性更新时同步更新编辑器配置', async () => {
    const wrapper = mountMonaco({
      props: {
        readonly: false,
      },
    });

    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));

    await wrapper.setProps({
      readonly: true,
    });
    await nextTick();

    expect(mockEditorInstance.updateOptions).toHaveBeenCalledWith(expect.objectContaining({ readOnly: true }));
  });

  it('组件卸载时调用 dispose 进行资源清理', async () => {
    const wrapper = mountMonaco();
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));

    wrapper.unmount();
    expect(mockEditorInstance.dispose).toHaveBeenCalled();
  });
});
