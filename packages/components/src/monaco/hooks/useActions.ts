import type { MonacoApi, YMonacoProps } from '../type';

/**
 * useActions - 注册右键动作（注释/大小写/包裹/复制单行/查找/替换/命令面板/格式化入口）
 */
export const useActions = (
  getMonaco: () => MonacoApi | null,
  getEditor: () => any,
  getSelectedTextOrAll: () => { text: string; isAll: boolean },
  wrapSelection: (wrap: { left: string; right?: string }) => void,
  copyToClipboard: (text: string) => void,
  triggerFormatDocument: () => Promise<boolean>,
  tryFormatByLanguage: (lang: string, text: string) => Promise<string | null>,
  props: YMonacoProps,
  addLocalizedAction: (action: any) => void
) => {
  const addFullscreenActions = (
    toggleFullscreen: () => void,
    fullscreenContextKeyRef: { current: any },
    fullscreenApi: ReturnType<typeof import('./useFullscreen').useFullscreen> | null
  ) => {
    const monaco = getMonaco();
    const editor = getEditor();
    if (!monaco || !editor) return;
    try {
      fullscreenContextKeyRef.current = editor.createContextKey?.('yssIsFullscreen', false) ?? null;
      // 将contextKey同步到fullscreenApi内部，确保ESC键退出时状态同步
      fullscreenApi?.setContextKey?.(fullscreenContextKeyRef.current);
    } catch {
      fullscreenContextKeyRef.current = null;
    }
    const commonOrder = 1.5;
    addLocalizedAction({
      id: 'yss-enter-fullscreen',
      label: 'enterFullscreen',
      precondition: '!yssIsFullscreen',
      contextMenuOrder: commonOrder,
      contextMenuGroupId: 'editor/context',
      keybindings: [(monaco as any).KeyMod.CtrlCmd | (monaco as any).KeyCode.F11],
      run: () => toggleFullscreen(),
    });
    addLocalizedAction({
      id: 'yss-exit-fullscreen',
      label: 'exitFullscreen',
      precondition: 'yssIsFullscreen',
      contextMenuOrder: commonOrder,
      contextMenuGroupId: 'editor/context',
      keybindings: [(monaco as any).KeyMod.CtrlCmd | (monaco as any).KeyCode.F11, (monaco as any).KeyCode.Escape],
      run: () => toggleFullscreen(),
    });
  };

  const addSqlContextActions = () => {
    const monaco = getMonaco();
    const editor = getEditor();
    if (!monaco || !editor) return;
    addLocalizedAction({
      id: 'yss-toggle-comment',
      label: 'comment',
      contextMenuGroupId: '1_modification',
      contextMenuOrder: 1,
      keybindings: [(monaco as any).KeyMod.CtrlCmd | (monaco as any).KeyCode.Slash],
      run: () => editor.trigger('', 'editor.action.commentLine', null),
    });
    addLocalizedAction({
      id: 'yss-to-upper',
      label: 'upper',
      contextMenuGroupId: '1_modification',
      contextMenuOrder: 1.1,
      run: () => editor.trigger('', 'editor.action.transformToUppercase', null),
    });
    addLocalizedAction({
      id: 'yss-to-lower',
      label: 'lower',
      contextMenuGroupId: '1_modification',
      contextMenuOrder: 1.11,
      run: () => editor.trigger('', 'editor.action.transformToLowercase', null),
    });
    addLocalizedAction({
      id: 'yss-wrap-single-quote',
      label: 'singleQuote',
      contextMenuGroupId: '1_modification',
      contextMenuOrder: 1.2,
      run: () => wrapSelection({ left: "'" }),
    });
    addLocalizedAction({
      id: 'yss-wrap-double-quote',
      label: 'doubleQuote',
      contextMenuGroupId: '1_modification',
      contextMenuOrder: 1.21,
      run: () => wrapSelection({ left: '"' }),
    });
    addLocalizedAction({
      id: 'yss-wrap-backticks',
      label: 'backticks',
      contextMenuGroupId: '1_modification',
      contextMenuOrder: 1.22,
      run: () => wrapSelection({ left: '`' }),
    });
    addLocalizedAction({
      id: 'yss-wrap-parentheses',
      label: 'parentheses',
      contextMenuGroupId: '1_modification',
      contextMenuOrder: 1.23,
      run: () => wrapSelection({ left: '(', right: ')' }),
    });
    addLocalizedAction({
      id: 'yss-copy-single-line',
      label: 'copyLine',
      contextMenuGroupId: '9_cutcopypaste',
      contextMenuOrder: 9.1,
      run: () => {
        const { text } = getSelectedTextOrAll();
        const one = (text || '')
          .split(/\r?\n/)
          .map(s => s.trim())
          .filter(Boolean)
          .join(' ');
        copyToClipboard(one);
      },
    });
    addLocalizedAction({
      id: 'yss-find',
      label: 'find',
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 0.95,
      keybindings: [(monaco as any).KeyMod.CtrlCmd | (monaco as any).KeyCode.KeyF],
      run: () => editor.trigger('', 'actions.find', null),
    });
    addLocalizedAction({
      id: 'yss-replace',
      label: 'replace',
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 0.96,
      keybindings: [(monaco as any).KeyMod.Alt | (monaco as any).KeyMod.CtrlCmd | (monaco as any).KeyCode.KeyF],
      run: () => editor.trigger('', 'editor.action.startFindReplaceAction', null),
    });
    addLocalizedAction({
      id: 'yss-command-palette',
      label: 'commands',
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 0.99,
      keybindings: [(monaco as any).KeyCode.F1],
      run: () => editor.trigger('', 'editor.action.quickCommand', null),
    });
    addLocalizedAction({
      id: 'yss-format-document',
      label: 'format',
      contextMenuGroupId: '1_modification',
      contextMenuOrder: 1.5,
      run: async () => {
        if (!getEditor()) return;
        const success = await triggerFormatDocument();
        if (success) return;
        const mdl = getEditor()?.getModel?.();
        const lang = mdl?.getLanguageId?.() || (props.language as string) || '';
        const val = mdl?.getValue?.() ?? '';
        const formatted = await tryFormatByLanguage(lang, val);
        if (formatted && mdl && formatted !== val) {
          getEditor()?.executeEdits('format-fallback', [
            { range: mdl.getFullModelRange(), text: formatted, forceMoveMarkers: true },
          ]);
        }
      },
    });
  };

  return { addFullscreenActions, addSqlContextActions };
};
