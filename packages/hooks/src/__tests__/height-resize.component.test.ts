import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTableHeight } from '../useTableHeight';
import { useTreeHeight } from '../useTreeHeight';

/** useResizeObserver 测试回调。 */
let tableResizeCallback: ResizeObserverCallback | null = null;

vi.mock('@vueuse/core', () => ({
  useResizeObserver: (_target: unknown, callback: ResizeObserverCallback): void => {
    tableResizeCallback = callback;
  },
}));

/** 原生 ResizeObserver 测试回调。 */
let treeResizeCallback: ResizeObserverCallback | null = null;

/** ResizeObserver observe mock。 */
const observeMock = vi.fn();

/** ResizeObserver disconnect mock。 */
const disconnectMock = vi.fn();

/** ResizeObserver 测试替身。 */
class ResizeObserverMock {
  /** 保存被观察目标。 */
  observe = observeMock;

  /** 停止观察目标。 */
  unobserve = vi.fn();

  /** 断开观察器。 */
  disconnect = disconnectMock;

  /** 注册 ResizeObserver 回调。 */
  constructor(callback: ResizeObserverCallback) {
    treeResizeCallback = callback;
  }
}

/** 已挂载的测试组件。 */
const wrappers: VueWrapper[] = [];

/** 创建指定尺寸的 DOMRect。 */
const createRect = (height: number, width = 300): DOMRect =>
  ({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height,
    toJSON: () => ({}),
  }) as DOMRect;

/** 创建 ResizeObserverEntry。 */
const createEntry = (height: number, width = 300): ResizeObserverEntry =>
  ({
    target: document.createElement('div'),
    contentRect: createRect(height, width),
  }) as unknown as ResizeObserverEntry;

/** 触发记录的 ResizeObserver 回调。 */
const triggerResize = (callback: ResizeObserverCallback | null, height: number, width = 300): void => {
  callback?.([createEntry(height, width)], {} as ResizeObserver);
};

beforeEach(() => {
  tableResizeCallback = null;
  treeResizeCallback = null;
  observeMock.mockReset();
  disconnectMock.mockReset();
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => createRect(400));
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => window.setTimeout(() => callback(0), 0));
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => window.clearTimeout(id));
  vi.useFakeTimers();
});

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('height hooks ResizeObserver filtering', () => {
  it('useTreeHeight 忽略纯宽度变化，并只提交最后一次高度 RAF', async () => {
    let treeHeight = ref(0);
    const wrapper = mount(
      defineComponent({
        setup() {
          const areaRef = ref<HTMLDivElement>();
          ({ treeHeight } = useTreeHeight(areaRef, { minHeight: 100, defaultHeight: 200 }));
          return () => h('div', { ref: areaRef });
        },
      })
    );
    wrappers.push(wrapper);
    await nextTick();
    await nextTick();

    expect(treeHeight.value).toBe(400);
    const rafSpy = vi.mocked(window.requestAnimationFrame);
    triggerResize(treeResizeCallback, 400, 800);
    expect(rafSpy).not.toHaveBeenCalled();

    triggerResize(treeResizeCallback, 420, 800);
    triggerResize(treeResizeCallback, 430, 800);
    expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);

    expect(treeHeight.value).toBe(430);
  });

  it('useTableHeight 忽略纯宽度变化，并只提交最后一次高度 RAF', async () => {
    let tableHeight = ref(0);
    const wrapper = mount(
      defineComponent({
        setup() {
          const areaRef = ref<HTMLDivElement>();
          ({ tableHeight } = useTableHeight(areaRef, { minHeight: 100, defaultHeight: 200 }));
          return () => h('div', { ref: areaRef });
        },
      })
    );
    wrappers.push(wrapper);
    await nextTick();

    expect(tableHeight.value).toBe(400);
    const rafSpy = vi.mocked(window.requestAnimationFrame);
    triggerResize(tableResizeCallback, 400, 900);
    expect(rafSpy).not.toHaveBeenCalled();

    triggerResize(tableResizeCallback, 440, 900);
    triggerResize(tableResizeCallback, 460, 900);
    expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);

    expect(tableHeight.value).toBe(460);
  });
});
