import type { Ref } from 'vue';
import type { MonacoApi, YMonacoProps } from '../type';

/**
 * useHistoryLogLoader - 历史日志加载器 Hook
 *
 * 核心功能：
 * - 初始化加载最新日志
 * - 向上滚动到顶部时加载历史日志
 * - 在编辑器顶部插入历史日志
 * - 保持滚动位置不变
 * - 管理加载状态和分页
 */
export interface HistoryLogLoaderOptions {
  /** 初始化加载回调 */
  onInit?: () => Promise<string>;
  /** 加载历史日志回调 */
  onLoadHistory?: (page: number, size: number) => Promise<{ content: string; hasMore: boolean }>;
  /** 每页加载条数 */
  pageSize?: number;
  /** 滚动阈值（距离顶部多少行触发加载） */
  scrollTopThreshold?: number;
}

export const useHistoryLogLoader = (
  _containerRef: Ref<HTMLDivElement | null>,
  _props: YMonacoProps,
  emit: (evt: string, ...args: any[]) => void,
  getEditor: () => any | null,
  getMonaco: () => MonacoApi | null,
  options: HistoryLogLoaderOptions = {}
) => {
  const { pageSize = 50, scrollTopThreshold = 10 } = options;

  let scrollDisposable: any = null;
  let currentPage = 1; // 当前页码
  let isLoading = false; // 是否正在加载
  let hasMore = true; // 是否还有更多历史日志
  let isCheckingScroll = false; // 防止递归检查
  let checkScrollTimer: number | null = null; // 防抖定时器
  let totalLoaded = 0; // 已加载的日志总数

  /**
   * 初始化历史日志加载器
   */
  const init = async () => {
    const editor = getEditor();
    if (!editor) return;

    // 加载初始日志
    if (options.onInit) {
      isLoading = true;
      emit('loading-change', true);

      try {
        const content = await options.onInit();
        if (content) {
          editor.setValue(content);
          const lineCount = editor.getModel()?.getLineCount() || 0;
          totalLoaded = lineCount;
          emit('log-count-change', totalLoaded);
          // 滚动到底部显示最新日志
          scrollToBottom();
        }
      } catch (error) {
        console.error('[useHistoryLogLoader] 初始化失败:', error);
        emit('load-error', error);
      } finally {
        isLoading = false;
        emit('loading-change', false);
      }
    }

    // 监听滚动事件，检测是否接近顶部
    scrollDisposable = editor.onDidScrollChange(() => {
      // 使用防抖，避免频繁触发
      if (checkScrollTimer) {
        clearTimeout(checkScrollTimer);
      }
      checkScrollTimer = window.setTimeout(() => {
        checkScrollPosition();
      }, 150);
    });
  };

  /**
   * 检查滚动位置，判断是否接近顶部
   */
  const checkScrollPosition = () => {
    // 防止递归调用或正在加载时重复触发
    if (isCheckingScroll || isLoading || !hasMore) return;
    isCheckingScroll = true;

    try {
      const editor = getEditor();
      if (!editor) return;

      const visibleRanges = editor.getVisibleRanges();
      if (!visibleRanges || visibleRanges.length === 0) return;

      // 获取可见区域的第一行
      const firstVisibleLine = visibleRanges[0].startLineNumber;

      // 判断是否在顶部附近
      if (firstVisibleLine <= scrollTopThreshold) {
        // 触发加载历史日志
        loadHistoryLogs();
      }
    } finally {
      isCheckingScroll = false;
    }
  };

  /**
   * 加载历史日志
   */
  const loadHistoryLogs = async () => {
    if (isLoading || !hasMore || !options.onLoadHistory) return;

    isLoading = true;
    emit('loading-change', true);
    emit('scroll-top'); // 触发滚动到顶部事件

    try {
      // 加载下一页历史日志
      const nextPage = currentPage + 1;
      const result = await options.onLoadHistory(nextPage, pageSize);

      if (result.content) {
        // 在顶部插入历史日志
        await prependContent(result.content);
        currentPage = nextPage;
        hasMore = result.hasMore;

        // 更新已加载总数
        const editor = getEditor();
        const lineCount = editor?.getModel()?.getLineCount() || 0;
        totalLoaded = lineCount;
        emit('log-count-change', totalLoaded);
        emit('page-change', currentPage);

        // 如果没有更多数据，触发事件
        if (!result.hasMore) {
          emit('no-more-data');
        }
      }
    } catch (error) {
      console.error('[useHistoryLogLoader] 加载历史日志失败:', error);
      emit('load-error', error);
    } finally {
      isLoading = false;
      emit('loading-change', false);
    }
  };

  /**
   * 在编辑器顶部插入内容（保持滚动位置）
   */
  const prependContent = async (text: string): Promise<void> => {
    const editor = getEditor();
    const monaco = getMonaco();
    if (!editor || !monaco || !text) {
      // console.warn('[useHistoryLogLoader] prependContent 失败：缺少必要参数');
      return;
    }

    const model = editor.getModel();
    if (!model) {
      // console.warn('[useHistoryLogLoader] prependContent 失败：没有 model');
      return;
    }

    // 保存当前滚动位置
    const scrollTop = editor.getScrollTop();
    const visibleRanges = editor.getVisibleRanges();
    const firstVisibleLine = visibleRanges?.[0]?.startLineNumber || 1;

    // 临时获取只读状态并禁用
    const originalReadOnly = editor.getOption?.((monaco as any).editor.EditorOption.readOnly);
    if (originalReadOnly) {
      editor.updateOptions({ readOnly: false });
    }

    try {
      // 计算要插入的行数
      const newLines = text.split('\n').length;

      // 在文档开头插入内容
      editor.executeEdits('prepend-log', [
        {
          range: new (monaco as any).Range(1, 1, 1, 1),
          text: text + '\n',
          forceMoveMarkers: true,
        },
      ]);

      // 恢复滚动位置（需要加上新插入的行数）
      // 使用 setTimeout 确保 DOM 更新后再滚动
      setTimeout(() => {
        const targetLine = firstVisibleLine + newLines;
        editor.revealLineInCenter(targetLine);
        // 微调滚动位置
        editor.setScrollTop(scrollTop + newLines * 19); // 19 是大致的行高
      }, 50);
    } finally {
      // 恢复只读状态
      if (originalReadOnly) {
        editor.updateOptions({ readOnly: true });
      }
    }
  };

  /**
   * 重新初始化（刷新）
   */
  const refresh = async () => {
    currentPage = 1;
    hasMore = true;
    totalLoaded = 0;

    const editor = getEditor();
    if (editor) {
      editor.setValue('');
    }

    await init();
  };

  /**
   * 清空日志
   */
  const clearContent = () => {
    const editor = getEditor();
    if (editor) {
      editor.setValue('');
      currentPage = 1;
      hasMore = true;
      totalLoaded = 0;
      emit('log-count-change', 0);
    }
  };

  /**
   * 滚动到底部
   */
  const scrollToBottom = () => {
    const editor = getEditor();
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    const lineCount = model.getLineCount();
    editor.revealLine(lineCount);
  };

  /**
   * 获取加载状态
   */
  const getLoadingState = () => ({
    isLoading,
    hasMore,
    currentPage,
    totalLoaded,
  });

  /**
   * 销毁资源
   */
  const dispose = () => {
    scrollDisposable?.dispose?.();
    scrollDisposable = null;

    if (checkScrollTimer) {
      clearTimeout(checkScrollTimer);
      checkScrollTimer = null;
    }
  };

  return {
    init,
    loadHistoryLogs,
    prependContent,
    refresh,
    clearContent,
    scrollToBottom,
    getLoadingState,
    dispose,
  };
};
