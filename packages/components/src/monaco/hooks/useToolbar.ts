import { computed, ref } from 'vue';
import { copyToClipboard } from '@yss-ui/utils';
import type { YMonacoProps, YMonacoDiffProps } from '../type';

interface UseToolbarOptions {
  props: YMonacoProps | YMonacoDiffProps;
  getEditor: () => any; // Monaco Editor or DiffEditor
  toggleFullscreen: () => void;
  isFullscreen?: boolean; // 响应式状态
}

export const useToolbar = ({ props, getEditor, toggleFullscreen }: UseToolbarOptions) => {
  const isCopied = ref(false);

  /**
   * 下载文件
   */
  const handleDownload = () => {
    const editor = getEditor();
    if (!editor) return;

    // 区分 DiffEditor 和普通 Editor
    // DiffEditor 的 model 获取比较特殊
    let content = '';
    let language = 'text';

    // 简单判断是否为 DiffEditor (有 getModifiedEditor 方法)
    if (editor.getModifiedEditor) {
      const modified = editor.getModifiedEditor();
      content = modified.getValue() || '';
      language = modified.getModel()?.getLanguageId() || 'text';
    } else {
      content = editor.getValue() || '';
      language = editor.getModel()?.getLanguageId() || 'text';
    }

    if (!content) return;

    // 映射扩展名
    const extMap: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      json: 'json',
      sql: 'sql',
      html: 'html',
      css: 'css',
      less: 'less',
      xml: 'xml',
      yaml: 'yaml',
      markdown: 'md',
    };
    const ext = extMap[language] || 'txt';
    const filename = `code_${Date.now()}.${ext}`;

    // 创建 Blob 下载
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * 复制内容
   */
  const handleCopy = async () => {
    const editor = getEditor();
    if (!editor) return;

    let content = '';
    if (editor.getModifiedEditor) {
      content = editor.getModifiedEditor().getValue() || '';
    } else {
      content = editor.getValue() || '';
    }

    if (!content) return;

    try {
      await copyToClipboard(content);
      // 反馈
      isCopied.value = true;
      setTimeout(() => {
        isCopied.value = false;
      }, 1500);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  /**
   * 计算按钮显示状态
   */
  const showBtn = computed(() => {
    const opts = props.toolbarOptions || {};
    return {
      copy: opts.copy !== false,
      fullscreen: opts.fullscreen !== false,
      download: !!opts.download, // 默认不展示下载
    };
  });

  return {
    handleDownload,
    handleCopy,
    handleFullscreen: toggleFullscreen,
    showBtn,
    isCopied,
  };
};
