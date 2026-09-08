import type { ECharts, EChartsCoreOption, EChartsInitOpts, SetOptionOpts } from 'echarts';
import { init as echartsInit } from 'echarts';
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, unref, watch, type Ref } from 'vue';
import type { YEchartsProps } from '../type';

/**
 * 组合式 Hook：封装 ECharts 实例的创建、销毁、响应式自适应与 API 暴露
 * - 使用 ResizeObserver 监听容器尺寸
 * - 当 theme/renderer 变更时，自动重建实例
 */
export const useEcharts = (containerRef: Ref<HTMLDivElement | null>, props: Required<YEchartsProps>) => {
  const chartRef = shallowRef<ECharts | null>(null);
  const resizeObserverRef = shallowRef<ResizeObserver | null>(null);

  const normalizeSize = (val?: number | string): string => {
    if (val === undefined || val === null) return '';
    return typeof val === 'number' ? `${val}px` : String(val);
  };

  const rootStyle = computed(() => ({
    width: normalizeSize(props.width) || '100%',
    height: normalizeSize(props.height) || '300px',
  }));

  const createInstance = (): void => {
    const el = unref(containerRef);
    if (!el) return;
    dispose();

    const { theme, renderer, initOptions, options, darkMode } = props;
    const mergedInit: EChartsInitOpts = {
      renderer: renderer as any,
      useDirtyRect: true,
      ...(initOptions as any),
    } as EChartsInitOpts;
    const instance = echartsInit(el, theme, mergedInit);
    chartRef.value = instance;

    const initialOption: EChartsCoreOption | undefined = options
      ? ({ ...options, darkMode } as EChartsCoreOption)
      : (undefined as unknown as EChartsCoreOption);

    if (initialOption) {
      instance.setOption(initialOption, { ...props.setOptionOpts } as SetOptionOpts);
    }

    if (props.autoresize) attachResizeObserver();
  };

  const attachResizeObserver = (): void => {
    const el = unref(containerRef);
    if (!el || resizeObserverRef.value) return;
    const observer = new ResizeObserver(() => {
      resize();
    });
    observer.observe(el);
    resizeObserverRef.value = observer;
  };

  const detachResizeObserver = (): void => {
    if (!resizeObserverRef.value) return;
    try {
      const el = unref(containerRef);
      if (el) resizeObserverRef.value.unobserve(el);
      resizeObserverRef.value.disconnect();
    } finally {
      resizeObserverRef.value = null;
    }
  };

  const getInstance = (): ECharts | null => {
    return chartRef.value;
  };

  const resize = (): void => {
    const instance = chartRef.value;
    if (!instance) return;
    // 使用 nextTick 保证容器尺寸先更新
    nextTick(() => instance.resize());
  };

  const setOption = (option: EChartsCoreOption | undefined, notMerge = false, setOptionOpts?: SetOptionOpts): void => {
    const instance = chartRef.value;
    if (!instance || !option) return;
    const merged = props.darkMode ? { darkMode: true, ...option } : option;
    // 兼容 v6 的 setOption 第二参数：允许传布尔或对象
    const opts = (setOptionOpts ?? props.setOptionOpts) as any;
    if (typeof opts === 'boolean') {
      instance.setOption(merged as any, opts);
    } else {
      instance.setOption(merged as any, { notMerge, ...opts });
    }
  };

  const dispose = (): void => {
    detachResizeObserver();
    if (chartRef.value) {
      try {
        chartRef.value.dispose();
      } catch {
        // ignore
      } finally {
        chartRef.value = null;
      }
    }
  };

  onMounted(() => {
    nextTick(createInstance);
  });

  onBeforeUnmount(() => {
    dispose();
  });

  // 响应式：option 深对比更新，仅调用 setOption，不重建
  watch(
    () => props.options,
    opt => {
      setOption(opt as EChartsCoreOption);
    },
    { deep: true }
  );

  // 主题/渲染器：需要重建实例
  watch(
    () => [props.theme, props.renderer],
    () => {
      nextTick(() => {
        createInstance();
      });
    }
  );

  // 暗黑模式：仅通过 setOption 更新，避免重建导致闪烁
  watch(
    () => props.darkMode,
    () => {
      setOption(props.options as EChartsCoreOption);
    }
  );

  return {
    rootStyle,
    getInstance,
    resize,
    setOption,
    dispose,
  } as const;
};
