import { message as antdMessage } from 'ant-design-vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, shallowMount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import type { UploadFile } from 'ant-design-vue';
import YFileImport from '../index.vue';
import type { FileImportNextStepPayload } from '../constant';

/** 当前测试创建的组件包装器。 */
const wrappers: VueWrapper[] = [];

/** YFileImport 对外暴露的方法。 */
interface FileImportExpose {
  /** 打开弹窗。 */
  open: () => void;
  /** 关闭弹窗。 */
  close: () => void;
  /** 重置内部状态。 */
  reset: () => void;
}

/** 渲染默认区与底部插槽的 Modal 测试替身。 */
const ModalStub = defineComponent({
  name: 'AModal',
  props: { open: Boolean },
  emits: ['cancel'],
  setup:
    (props, { slots }) =>
    () =>
      h('section', props.open ? [slots.default?.(), slots.footer?.()] : []),
});

/** 可发送文件列表变更的 Upload.Dragger 测试替身。 */
const UploadDraggerStub = defineComponent({
  name: 'AUploadDragger',
  emits: ['change'],
  setup:
    (_, { slots }) =>
    () =>
      h('div', { class: 'upload-dragger-stub' }, slots.default?.()),
});

/** 将 YButton 简化为可点击的原生按钮。 */
const ButtonStub = defineComponent({
  name: 'YButton',
  inheritAttrs: false,
  emits: ['click'],
  setup:
    (_, { attrs, emit, slots }) =>
    () =>
      h(
        'button',
        {
          ...attrs,
          onClick: (event: MouseEvent) => emit('click', event),
        },
        slots.default?.()
      ),
});

/** 挂载文件导入组件并记录包装器。 */
const mountFileImport = (props: Record<string, unknown> = {}): VueWrapper => {
  const wrapper = shallowMount(YFileImport, {
    props: { modelValue: true, ...props },
    global: {
      stubs: {
        AModal: ModalStub,
        AUploadDragger: UploadDraggerStub,
        CloudUploadOutlined: true,
        UploadDragger: UploadDraggerStub,
        YButton: ButtonStub,
      },
    },
  });
  wrappers.push(wrapper);
  return wrapper;
};

/** 按文案查找底部按钮。 */
const findButton = (wrapper: VueWrapper, text: string) => {
  const button = wrapper.findAll('button').find(item => item.text() === text);
  if (!button) throw new Error(`未找到按钮：${text}`);
  return button;
};

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.restoreAllMocks();
});

describe('YFileImport 公开交互契约', () => {
  it('公开 open、close 与 reset 方法', async () => {
    const wrapper = mountFileImport();
    const exposed = wrapper.vm as unknown as FileImportExpose;

    exposed.open();
    exposed.close();
    exposed.reset();
    await nextTick();

    expect(wrapper.emitted('update:modelValue')).toEqual([[true], [false]]);
    expect(wrapper.find('.y-file-import__uploader').exists()).toBe(true);
  });

  it('未选择文件时提示错误且不发送下一步事件', async () => {
    const errorSpy = vi
      .spyOn(antdMessage, 'error')
      .mockReturnValue(vi.fn() as unknown as ReturnType<typeof antdMessage.error>);
    const wrapper = mountFileImport({ texts: { emptyFileMessage: '请先添加文件' } });

    await findButton(wrapper, '下一步').trigger('click');
    await flushPromises();

    expect(errorSpy).toHaveBeenCalledWith('请先添加文件');
    expect(wrapper.emitted('nextStep')).toBeUndefined();
  });

  it('单文件模式保留最后一个文件，并由 onSuccess 切换结果步骤', async () => {
    const wrapper = mountFileImport();
    const files = [
      { uid: 'first', name: 'first.csv', originFileObj: new File(['first'], 'first.csv') },
      { uid: 'second', name: 'second.xlsx', originFileObj: new File(['second'], 'second.xlsx') },
    ] as unknown as UploadFile[];
    wrapper.findComponent(UploadDraggerStub).vm.$emit('change', { fileList: files });
    await nextTick();

    await findButton(wrapper, '下一步').trigger('click');
    await flushPromises();
    const payload = wrapper.emitted('nextStep')?.[0]?.[0] as FileImportNextStepPayload;

    expect(payload.loadingName).toBe('nextStep');
    expect(payload.fileList.map(file => file.name)).toEqual(['second.xlsx']);
    expect(wrapper.find('.y-file-import__result').exists()).toBe(false);

    payload.onSuccess();
    await nextTick();
    expect(wrapper.find('.y-file-import__result').exists()).toBe(true);

    (wrapper.vm as unknown as FileImportExpose).reset();
    await nextTick();
    expect(wrapper.find('.y-file-import__uploader').exists()).toBe(true);
  });
});
