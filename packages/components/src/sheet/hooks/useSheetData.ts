import { toRaw } from 'vue';
import type { Ref } from 'vue';
import type { IWorkbookData } from '@univerjs/presets';
import { DEFAULT_WORKBOOK_DATA } from '../constant';

/**
 * YSheet 数据 Hook 配置
 */
export interface UseSheetDataOptions {
  /**
   * Univer Facade API 实例
   */
  univerAPI: Ref<any>;
  /**
   * 组件事件派发函数
   */
  emit: any;
  /**
   * save 触发 v-model 回写前的同步回调
   */
  beforeEmitModelValue?: (data: IWorkbookData) => void;
}

/**
 * Univer 数据管理 Hook
 */
export const useSheetData = (options: UseSheetDataOptions) => {
  /**
   * 标准化异常对象，避免向外抛出字符串或普通对象。
   *
   * @param error 原始异常
   * @returns 标准 Error 实例
   */
  const normalizeError = (error: unknown): Error => {
    return error instanceof Error ? error : new Error(String(error));
  };

  /**
   * 获取非响应式工作簿数据，避免 Univer 读取 Vue Proxy 时产生额外开销。
   *
   * @param data 外部传入的工作簿数据
   * @returns 可直接传给 Univer 的工作簿数据
   */
  const getRawWorkbookData = (data?: IWorkbookData | null): IWorkbookData => {
    return toRaw(data ?? (DEFAULT_WORKBOOK_DATA as IWorkbookData));
  };

  /**
   * 加载工作簿
   *
   * @param data 工作簿数据，为空时使用默认空白工作簿
   * @returns Univer 工作簿实例
   */
  const loadWorkbook = (data?: IWorkbookData | null) => {
    if (!options.univerAPI.value) return;

    try {
      const workbookData = getRawWorkbookData(data);
      const workbook = options.univerAPI.value.createWorkbook(workbookData);

      if (workbook) {
        options.emit('workbook-created', workbook);
      }

      return workbook;
    } catch (error) {
      const normalizedError = normalizeError(error);
      console.error('[YSheet] Failed to load workbook:', normalizedError);
      options.emit('error', normalizedError);
      throw normalizedError;
    }
  };
  /**
   * 保存工作簿
   *
   * @returns 当前工作簿快照，未初始化或保存失败时返回 null
   */
  const saveWorkbook = () => {
    if (!options.univerAPI.value) return null;

    try {
      const workbook = options.univerAPI.value.getActiveWorkbook();
      if (!workbook) return null;

      const data = workbook.save();
      options.beforeEmitModelValue?.(data);
      options.emit('update:modelValue', data);
      return data;
    } catch (error) {
      const normalizedError = normalizeError(error);
      console.error('[YSheet] Failed to save workbook:', normalizedError);
      options.emit('error', normalizedError);
      return null;
    }
  };
  /**
   * 重新加载数据
   *
   * @param data 新工作簿数据，为空时使用默认空白工作簿
   */
  const reload = (data?: IWorkbookData | null) => {
    if (!options.univerAPI.value) return;

    try {
      // 先销毁现有工作簿
      const workbook = options.univerAPI.value.getActiveWorkbook();
      if (workbook) {
        options.univerAPI.value.disposeUnit(workbook.getId());
      }
    } catch (error) {
      const normalizedError = normalizeError(error);
      console.error('[YSheet] Failed to reload workbook:', normalizedError);
      options.emit('error', normalizedError);
      throw normalizedError;
    }

    // 加载新数据
    return loadWorkbook(data);
  };

  return {
    loadWorkbook,
    saveWorkbook,
    reload,
  };
};
