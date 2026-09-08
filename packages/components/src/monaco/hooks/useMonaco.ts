import { useLocalizedActions } from './useLocalizedActions';
import type { Ref } from 'vue';
import { nextTick, reactive, toRef } from 'vue';
import type { MonacoApi, SqlSchema, YMonacoProps } from '../type';
import { isNginxLanguage, normalizeMonacoLanguage, resolveMonacoTheme } from '../utils/customLanguages';
import { tryFormatNginx } from '../utils/nginxFormat';
import { tryFormatSql } from '../utils/sqlFormat';
import { useActions } from './useActions';
import { useContextMenuBridge } from './useContextMenuBridge';
import { useFullscreen } from './useFullscreen';
import { useMonacoLoader } from './useMonacoLoader';
import { useSqlProviders } from './useSqlProviders';
import { useLogViewer } from './useLogViewer';
import { useDisableFindWidgetTooltips } from './useDisableFindWidgetTooltips';
import { copyToClipboard } from '@yss-ui/utils';

/**
 * useMonaco - 负责按需加载与实例管理
 */
export const useMonaco = (
  containerRef: Ref<HTMLDivElement | null>,
  wrapperRef: Ref<HTMLDivElement | null>,
  props: YMonacoProps,
  emit: (evt: string, ...args: any[]) => void
) => {
  let monaco: MonacoApi | null = null;
  let editor: any = null;
  const addLocalizedAction = useLocalizedActions(() => editor);
  let model: any = null;
  const state = reactive({ isCreating: false, isFullscreen: false });
  let currentSqlSchema: SqlSchema | null = (props as any).sqlSchema ?? null;
  // 全屏控制 - 使用独立 hook
  let fullscreenApi: ReturnType<typeof useFullscreen> | null = null;
  const fullscreenContextKeyRef = { current: null as any };

  const defaultOptions = {
    wordWrap: 'on',
    minimap: { enabled: false },
    folding: true,
    showFoldingControls: 'always',
    foldingStrategy: 'indentation',
    cursorBlinking: 'smooth',
    scrollBeyondLastLine: false,
    theme: resolveMonacoTheme(props.theme, props.language),
    formatOnPaste: true,
    automaticLayout: !!props.autoLayout,
    tabSize: 2,
    readOnly: !!props.readonly,
    contextmenu: true,
    domReadOnly: false,
    quickSuggestions: { other: true, comments: true, strings: true },
    suggestOnTriggerCharacters: true,
    wordBasedSuggestions: 'currentDocument',
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
    fixedOverflowWidgets: true,
  } as Record<string, unknown>;

  // 本地化与 Monaco 加载由 useMonacoLoader 负责

  // 装载器：Monaco 加载、贡献、语言等
  const { ensureMonaco, ensureContributions, ensureLanguageContribution, tryLoadLanguageCompletion, getMonaco } =
    useMonacoLoader(props);

  // 原生右键桥接：将宿主环境的原生右键事件桥接到 Monaco 菜单
  const { bind: bindNativeContextMenuBridge, unbind: unbindNativeContextMenuBridge } = useContextMenuBridge(
    containerRef,
    () => editor,
    ensureContributions
  );

  // 日志查看器：增量追加、滚动检测、行数限制
  const logViewerApi = useLogViewer(
    containerRef,
    props,
    emit,
    () => editor,
    () => getMonaco()
  );

  // 禁用查找框的原生 tooltip
  const findWidgetTooltipApi = useDisableFindWidgetTooltips(containerRef);

  /**
   * 构建选项
   */
  const buildOptions = (): Record<string, unknown> => {
    return { ...defaultOptions, ...(props.options ?? {}) };
  };

  const normalizeLanguage = (lang?: string) => (lang || '').trim().toLowerCase();

  /**
   * 获取当前站点主题。
   */
  const resolveCurrentTheme = (): string => {
    if (props.theme) return props.theme;
    if (typeof document === 'undefined') return 'vs';
    return document.documentElement.getAttribute('data-prefers-color') === 'dark' ? 'vs-dark' : 'vs';
  };

  /**
   * 初始化自动格式化开关判断
   */
  const shouldFormatOnMount = (lang?: string): boolean => {
    if (props.logMode) return false;
    if (props.formatOnMount === false) return false;
    const target = normalizeLanguage(lang);
    if (!target) return false;
    const allowList =
      Array.isArray(props.formatLanguages) && props.formatLanguages.length > 0 ? props.formatLanguages : ['sql'];
    return allowList.some(item => {
      const normalized = normalizeLanguage(item);
      return !!normalized && (target === normalized || target.endsWith(normalized));
    });
  };

  /**
   * 创建完成后自动格式化一次（默认仅 SQL）
   * 若编辑器处于 readonly 模式，会临时解除只读以执行格式化，完成后恢复
   */
  const formatOnMountIfNeeded = async () => {
    if (!editor) return;
    const mdl = editor.getModel?.();
    if (!mdl) return;

    const lang = mdl.getLanguageId?.() || props.language || '';
    if (!shouldFormatOnMount(lang)) return;

    const before = mdl.getValue?.() ?? '';
    if (!before.trim()) return;

    // Monaco 在 readOnly 模式下会禁用格式化动作，需临时解除
    const isReadOnly = editor.getOption?.(monaco?.editor?.EditorOption?.readOnly) ?? !!props.readonly;
    if (isReadOnly) {
      editor.updateOptions({ readOnly: false });
    }

    try {
      // 等待编辑器动作与 provider 稳定后再触发
      await nextTick();
      await triggerFormatDocument();

      const afterByProvider = mdl.getValue?.() ?? '';
      if (afterByProvider !== before) return;

      const formatted = await tryFormatByLanguage(lang, before);
      if (formatted && formatted !== before) {
        editor.executeEdits('format-on-mount-fallback', [
          { range: mdl.getFullModelRange(), text: formatted, forceMoveMarkers: true },
        ]);
      }
    } finally {
      // 恢复只读状态
      if (isReadOnly) {
        editor.updateOptions({ readOnly: true });
      }
    }
  };

  /**
   * 创建 Monaco 实例
   */
  const create = async () => {
    if (state.isCreating) return;
    state.isCreating = true;
    try {
      const m = await ensureMonaco();
      monaco = m;
      // 先注册常用贡献，避免命令未找到
      await ensureContributions();
      await ensureLanguageContribution(m, props.language ?? 'javascript');
      await nextTick();
      const el = containerRef.value;
      if (!el) return;
      const modelLanguage = normalizeMonacoLanguage(props.language ?? 'javascript');
      model = m.editor.createModel(props.modelValue ?? '', modelLanguage);
      const options = { ...buildOptions(), model, theme: resolveMonacoTheme(props.theme, modelLanguage) };
      editor = m.editor.create(el, options);

      // 语言的按需补充提示（非内置语言）
      tryLoadLanguageCompletion(m, modelLanguage);

      // SQL 专属：注册智能提示与格式化
      if (modelLanguage === 'sql') {
        await registerSqlProviders();
      }

      // 值变化
      editor.onDidChangeModelContent(() => {
        const val = editor.getValue();
        emit('update:modelValue', val);
        emit('change', val);
        // 处于全屏时，父级 v-model 更新可能触发 Vue 重新打补丁覆盖内联高度，这里下一帧强制重算
        if (state.isFullscreen) {
          try {
            requestAnimationFrame(() => fullscreenApi?.updateRect?.(resolveFullscreenTarget() ?? undefined));
          } catch {}
        }
      });

      // 选中文本与 blur
      editor.onDidChangeCursorSelection((event: any) => {
        const selection = event.selection;
        const mdl = editor.getModel();
        const selectedText = mdl?.getValueInRange(selection) ?? '';
        emit('selectedText', selectedText, selection);
      });
      editor.onDidBlurEditorWidget(() => {
        emit('blur', { editor, monaco });
      });

      // 右键菜单：应用内全屏 + SQL 常用动作
      // 右键菜单动作与全屏（传入自定义 z-index，确保能覆盖抽屉/弹窗）
      const fsTarget = wrapperRef.value ? wrapperRef : containerRef;
      fullscreenApi = useFullscreen(
        fsTarget,
        () => layout(),
        fs => (state.isFullscreen = fs),
        props.fullscreenZIndex ?? 10000,
        props.fullscreenTransition ?? true
      );
      const { addFullscreenActions, addSqlContextActions } = useActions(
        () => getMonaco() as any,
        () => editor,
        getSelectedTextOrAll,
        wrapSelection,
        copyToClipboard,
        triggerFormatDocument,
        tryFormatByLanguage,
        props,
        addLocalizedAction
      );
      addFullscreenActions(() => toggleFullscreen(), fullscreenContextKeyRef, fullscreenApi);
      addSqlContextActions();
      // 原生右键桥接（兜底触发 Monaco 上下文菜单）
      bindNativeContextMenuBridge();
      // 初始化后自动格式化一次（默认 SQL）
      await formatOnMountIfNeeded();
      // 初次创建后强制一次布局，兜底容器尺寸未就绪导致的 0 高问题
      editor.layout?.();
      // 日志模式：初始化滚动检测与行数控制
      if (props.logMode) {
        logViewerApi.init();
      }
      // 禁用查找框的原生 tooltip（避免样式冲突）
      findWidgetTooltipApi.init();
    } finally {
      state.isCreating = false;
    }
  };

  /**
   * 销毁 Monaco 实例
   */
  const dispose = () => {
    editor?.dispose?.();
    model?.dispose?.();
    editor = null;
    model = null;
    unbindNativeContextMenuBridge();
    logViewerApi.dispose();
    findWidgetTooltipApi.dispose();
  };

  /**
   * 获取 Monaco 实例
   */
  const getInstance = () => {
    return editor;
  };

  /**
   * 设置值
   */
  const setValue = (value: string) => {
    if (!editor?.setValue) return;
    if (editor.getValue?.() === value) return; // 避免循环
    editor.setValue(value ?? '');
  };

  /**
   * 插入文本
   */
  const insertText = (text: string) => {
    if (!editor) return;
    editor.trigger('', 'editor.action.insertSnippet', { name: text });
  };

  /**
   * 插入文本到指定位置
   */
  const insertTextAtPosition = (text: string) => {
    if (!editor || !monaco) return;
    const position = editor.getPosition();
    editor.executeEdits('insert-text', [
      {
        range: new (monaco as any).Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text,
        forceMoveMarkers: true,
      },
    ]);
    editor.setPosition({ lineNumber: position.lineNumber, column: position.column + (text?.length ?? 0) });
  };

  /**
   * 设置语言
   */
  const setLanguage = async (lang: string) => {
    if (!editor || !monaco) return;
    const language = normalizeMonacoLanguage(lang);

    // 关键：先加载语言贡献，再创建 model
    await ensureLanguageContribution(monaco as MonacoApi, language);
    await tryLoadLanguageCompletion(monaco as MonacoApi, language);

    const oldModel = editor.getModel();
    const newModel = (monaco as any).editor.createModel(oldModel.getValue(), language);
    editor.setModel(newModel);
    oldModel?.dispose?.();
    setTheme(resolveCurrentTheme());
    tryLoadLanguageCompletion(monaco as MonacoApi, language);
    ensureLanguageContribution(monaco as MonacoApi, language).then(async () => {
      if (language === 'sql') {
        await registerSqlProviders();
      } else {
        disposeSqlProviders();
      }
      editor?.layout?.();
    });
  };

  /**
   * 设置主题
   */
  const setTheme = (theme: string) => {
    if (!monaco) return;
    const lang = editor?.getModel?.()?.getLanguageId?.() || props.language;
    (monaco as any).editor.setTheme(resolveMonacoTheme(theme, lang));
  };

  /**
   * 切换只读状态
   */
  const toggleReadonly = (readonly?: boolean) => {
    if (!editor) return;
    const ro = typeof readonly === 'boolean' ? readonly : !editor.getOption?.('readOnly');
    editor.updateOptions({ readOnly: ro });
  };

  const layout = () => {
    editor?.layout?.();
  };

  /**
   * 获取选中的文本或全部文本
   */
  const getSelectedTextOrAll = (): { text: string; isAll: boolean } => {
    if (!editor) return { text: '', isAll: true };
    const mdl = editor.getModel();
    const sel = editor.getSelection();
    if (!mdl) return { text: '', isAll: true };
    if (sel && !sel.isEmpty?.()) {
      return { text: mdl.getValueInRange(sel), isAll: false };
    }
    return { text: mdl.getValue?.() ?? '', isAll: true };
  };

  /**
   * 包裹选中的文本
   */
  const wrapSelection = (wrapper: { left: string; right?: string }) => {
    if (!editor || !monaco) return;
    const mdl = editor.getModel();
    const sel = editor.getSelection();
    if (!mdl || !sel) return;
    const right = wrapper.right ?? wrapper.left;
    const selected = mdl.getValueInRange(sel);
    const text = `${wrapper.left}${selected}${right}`;
    editor.executeEdits('wrap-selection', [{ range: sel, text, forceMoveMarkers: true }]);
  };

  /**
   * 解析全屏目标
   */
  const resolveFullscreenTarget = (): HTMLElement | null => {
    if (typeof window === 'undefined') return null;
    const src = props.fullscreenTarget;
    if (!src) return document.documentElement;
    if (typeof src === 'string') {
      return document.querySelector(src) as HTMLElement | null;
    }
    return src as unknown as HTMLElement;
  };

  /**
   * 切换全屏状态
   */

  const toggleFullscreen = async () => {
    fullscreenApi?.toggle({ contextKey: fullscreenContextKeyRef.current, target: resolveFullscreenTarget() });
    state.isFullscreen = !!fullscreenApi?.isFullscreen;
    layout();

    // 关键修正：Vue 的 patch 可能在当前 tick 或 nextTick 覆盖掉 style 属性（例如 height: 300px）
    // 导致全屏样式失效（变为只有一半高度）。
    // 这里强制在 nextTick 后重新应用全屏样式矩形。
    if (state.isFullscreen) {
      await nextTick();
      try {
        fullscreenApi?.updateRect(resolveFullscreenTarget() ?? undefined);
        layout();
      } catch {}
    }
  };

  /**
   * 触发文档格式化（若存在 provider 则返回 true）
   */
  const triggerFormatDocument = async (): Promise<boolean> => {
    if (!editor) return false;
    try {
      const mdl = editor.getModel?.();
      const before = mdl?.getValue?.() ?? '';
      const action = editor.getAction?.('editor.action.formatDocument');
      if (action) {
        await action.run?.();
        const after = mdl?.getValue?.() ?? '';
        return after !== before;
      }
    } catch {
      // ignore
    }
    return false;
  };

  /**
   * 注册 SQL 智能提示与文档格式化
   */
  const { registerSqlProviders, disposeSqlProviders } = useSqlProviders(
    () => getMonaco() as any,
    () => editor,
    () => currentSqlSchema
  );

  /**
   * JSON 兜底格式化
   */
  const tryFormatJson = (text: string): string | null => {
    if (!text) return text as unknown as string;
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return null;
    }
  };

  /**
   * 按语言兜底格式化
   */
  const tryFormatByLanguage = async (language: string, text: string): Promise<string | null> => {
    const lang = (language || '').toLowerCase();
    if (lang === 'sql' || lang.endsWith('sql')) {
      return await tryFormatSql(text);
    }
    if (lang === 'json') {
      return tryFormatJson(text);
    }
    if (isNginxLanguage(lang)) {
      return await tryFormatNginx(text);
    }
    return null;
  };

  /**
   * 外部更新 SQL 模式（用于提示刷新）
   */
  const updateSqlSchema = async (schema: SqlSchema | null) => {
    currentSqlSchema = schema ?? null;
    if (monaco && editor && (editor.getModel?.()?.getLanguageId?.() === 'sql' || (props.language ?? 'sql') === 'sql')) {
      await registerSqlProviders();
    }
  };

  return {
    create,
    dispose,
    getInstance,
    setValue,
    insertText,
    insertTextAtPosition,
    setLanguage,
    setTheme,
    toggleReadonly,
    toggleFullscreen,
    layout,
    updateSqlSchema,
    // 日志查看器方法
    appendContent: logViewerApi.appendContent,
    clearContent: logViewerApi.clearContent,
    scrollToBottom: logViewerApi.scrollToBottom,
    getLineCount: logViewerApi.getLineCount,
    isFullscreen: toRef(state, 'isFullscreen'),
  };
};
