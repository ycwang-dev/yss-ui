import { computed, nextTick, ref } from 'vue';
import type { Ref } from 'vue';
import type { IWorkbookData } from '@univerjs/presets';

/**
 * YSheet 加载状态 Hook 配置
 */
export interface UseSheetLoadingOptions {
  /**
   * Univer Facade API 实例
   */
  univerAPI: Ref<any>;
  /**
   * Univer 初始化中状态
   */
  initializing: Ref<boolean>;
  /**
   * Univer 初始化异常
   */
  initError: Ref<Error | null>;
  /**
   * 默认工作簿数据
   */
  defaultData: IWorkbookData;
  /**
   * 工作簿加载函数
   */
  loadWorkbook: (data?: IWorkbookData | null) => void;
  /**
   * 工作簿重载函数
   */
  reloadWorkbookData: (data?: IWorkbookData | null) => void;
}

/**
 * 管理 YSheet 工作簿加载、错误与占位状态。
 *
 * @param options Hook 配置
 * @returns 加载状态、错误状态和工作簿渲染方法
 */
export const useSheetLoading = (options: UseSheetLoadingOptions) => {
  const workbookReady = ref(false);
  const workbookError = ref<Error | null>(null);
  let renderToken = 0;

  /**
   * 当前加载异常
   */
  const currentError = computed(() => options.initError.value || workbookError.value);

  /**
   * 是否展示加载占位
   */
  const showLoading = computed(() => !currentError.value && (options.initializing.value || !workbookReady.value));

  /**
   * 等待一帧，让 Univer 完成首轮 DOM 绘制后再隐藏加载占位。
   *
   * @returns 渲染帧 Promise
   */
  const waitRenderFrame = () => {
    return new Promise<void>(resolve => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }
      window.requestAnimationFrame(() => resolve());
    });
  };

  /**
   * 标准化工作簿加载异常。
   *
   * @param error 原始异常
   * @returns 标准 Error 实例
   */
  const normalizeError = (error: unknown): Error => {
    return error instanceof Error ? error : new Error(String(error));
  };

  /**
   * 执行工作簿渲染并更新就绪状态。
   *
   * @param executor 工作簿操作函数
   */
  const renderWithLoading = async (executor: () => void) => {
    if (!options.univerAPI.value) return;

    const currentToken = (renderToken += 1);
    workbookReady.value = false;
    workbookError.value = null;
    try {
      executor();
      await nextTick();
      await waitRenderFrame();
      if (currentToken !== renderToken) {
        return;
      }
      workbookReady.value = true;
    } catch (error) {
      if (currentToken !== renderToken) {
        return;
      }
      workbookError.value = normalizeError(error);
    }
  };

  /**
   * 加载并标记工作簿就绪状态。
   *
   * @param data 工作簿数据
   */
  const renderWorkbook = async (data?: IWorkbookData | null) => {
    await renderWithLoading(() => {
      options.loadWorkbook(data ?? options.defaultData);
    });
  };

  /**
   * 重新加载并标记工作簿就绪状态。
   *
   * @param data 工作簿数据
   */
  const reloadWorkbook = async (data?: IWorkbookData | null) => {
    await renderWithLoading(() => {
      options.reloadWorkbookData(data);
    });
  };

  return {
    currentError,
    showLoading,
    renderWorkbook,
    reloadWorkbook,
  };
};
