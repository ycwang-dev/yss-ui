import type { Ref } from 'vue';
import type { MonacoApi, YMonacoProps } from '../type';

/**
 * useLogViewer - 日志查看器模式专用 Hook
 *
 * 功能：
 * - 增量追加日志内容
 * - 滚动触底检测
 * - 行数限制与自动清理
 * - 自动滚动到底部
 */
export const useLogViewer = (
  _containerRef: Ref<HTMLDivElement | null>,
  props: YMonacoProps,
  emit: (evt: string, ...args: any[]) => void,
  getEditor: () => any | null,
  getMonaco: () => MonacoApi | null
) => {
  let scrollDisposable: any = null;
  let isNearBottom = true; // 标记用户是否在底部附近
  let isCheckingScroll = false; // 防止递归检查
  let checkScrollTimer: number | null = null; // 防抖定时器

  /**
   * 初始化日志查看器
   */
  const init = () => {
    const editor = getEditor();
    if (!editor || !props.logMode) return;

    // 监听滚动事件，检测是否接近底部
    scrollDisposable = editor.onDidScrollChange(() => {
      // 使用防抖，避免频繁触发
      if (checkScrollTimer) {
        clearTimeout(checkScrollTimer);
      }
      checkScrollTimer = window.setTimeout(() => {
        checkScrollPosition();
      }, 100);
    });
  };

  /**
   * 检查滚动位置，判断是否接近底部
   */
  const checkScrollPosition = () => {
    // 防止递归调用
    if (isCheckingScroll) return;
    isCheckingScroll = true;

    try {
      const editor = getEditor();
      if (!editor) return;

      const model = editor.getModel();
      if (!model) return;

      const totalLines = model.getLineCount();
      const visibleRanges = editor.getVisibleRanges();

      if (!visibleRanges || visibleRanges.length === 0) return;

      // 获取可见区域的最后一行
      const lastVisibleLine = visibleRanges[visibleRanges.length - 1].endLineNumber;
      const threshold = props.scrollThreshold ?? 50;

      // 判断是否在底部附近
      const distanceFromBottom = totalLines - lastVisibleLine;
      const wasNearBottom = isNearBottom;
      isNearBottom = distanceFromBottom <= threshold;

      // 如果刚进入底部区域，触发 scroll-end 事件
      if (isNearBottom && !wasNearBottom) {
        emit('scroll-end');
      }
    } finally {
      isCheckingScroll = false;
    }
  };

  /**
   * 追加日志内容
   */
  const appendContent = (text: string) => {
    const editor = getEditor();
    const monaco = getMonaco();
    if (!editor || !monaco || !text) {
      // console.warn('[useLogViewer] appendContent 失败：', {
      //   hasEditor: !!editor,
      //   hasMonaco: !!monaco,
      //   hasText: !!text,
      // });
      return;
    }

    const model = editor.getModel();
    if (!model) {
      // console.warn('[useLogViewer] appendContent 失败：没有 model');
      return;
    }

    // 在文档末尾追加内容
    const lineCount = model.getLineCount();
    const lastLineLength = model.getLineMaxColumn(lineCount);

    // 如果当前内容不为空且最后一行不是空行，先添加换行符
    const currentValue = model.getValue();
    const prefix = currentValue && !currentValue.endsWith('\n') ? '\n' : '';
    const contentToAppend = prefix + text;

    // 临时获取只读状态并禁用（以便在只读模式下也能追加内容）
    const originalReadOnly = editor.getOption?.((monaco as any).editor.EditorOption.readOnly);
    if (originalReadOnly) {
      editor.updateOptions({ readOnly: false });
    }

    try {
      // 使用 executeEdits 在末尾插入，性能优于 setValue
      editor.executeEdits('append-log', [
        {
          range: new (monaco as any).Range(lineCount, lastLineLength, lineCount, lastLineLength),
          text: contentToAppend,
          forceMoveMarkers: true,
        },
      ]);

      // 检查并清理超出行数限制的内容
      trimExcessLines();

      // 如果启用自动滚动且用户在底部附近，滚动到底部
      if (props.autoScroll !== false && isNearBottom) {
        scrollToBottom();
      }
    } finally {
      // 恢复只读状态
      if (originalReadOnly) {
        editor.updateOptions({ readOnly: true });
      }
    }
  };

  /**
   * 清理超出行数限制的内容
   */
  const trimExcessLines = () => {
    const editor = getEditor();
    const monaco = getMonaco();
    if (!editor || !monaco) return;

    const model = editor.getModel();
    if (!model) return;

    const maxLines = props.maxLines ?? 10000;
    const currentLines = model.getLineCount();

    if (currentLines <= maxLines) return;

    // 计算需要删除的行数
    const linesToDelete = currentLines - maxLines;

    // 删除头部超出的行
    const range = new (monaco as any).Range(1, 1, linesToDelete + 1, 1);
    editor.executeEdits('trim-log', [
      {
        range,
        text: '',
        forceMoveMarkers: false,
      },
    ]);

    // 触发超出限制事件
    emit('line-exceed', currentLines);
  };

  /**
   * 清空日志内容
   */
  const clearContent = () => {
    const editor = getEditor();
    if (!editor) return;
    editor.setValue('');
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
   * 获取当前行数
   */
  const getLineCount = (): number => {
    const editor = getEditor();
    if (!editor) return 0;

    const model = editor.getModel();
    if (!model) return 0;

    return model.getLineCount();
  };

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
    appendContent,
    clearContent,
    scrollToBottom,
    getLineCount,
    dispose,
  };
};
