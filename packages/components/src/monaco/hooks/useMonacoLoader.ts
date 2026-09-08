import type { MonacoApi, YMonacoProps } from '../type';
import { ensureCustomLanguageContribution, normalizeMonacoLanguage } from '../utils/customLanguages';

/**
 * 配置 Monaco Editor 的 Web Worker
 * 由于转向主线程 JS-Diff 方案，不再可以在此处配置 Worker，
 * 以避免内网环境下的构建和路径问题。
 */
const setupMonacoEnvironment = (): void => {
  // 检查环境配置是否已存在，确保 HMR 安全
  if ((globalThis as any).MonacoEnvironment) return;

  (globalThis as any).MonacoEnvironment = {
    getWorker(_moduleId: string, label: string): Worker {
      // 针对语言服务 (JSON/TS等)：返回伪 Worker 以静默 "You must define getWorker" 报错
      // 这消除了 HMR 时的红屏报错
      if (label === 'json' || label === 'css' || label === 'html' || label === 'typescript' || label === 'javascript') {
        return new Worker('data:text/javascript;charset=utf-8,self.onmessage=()=>{};');
      }

      // 针对 Core Editor Worker (Diff 计算等)：
      // 我们不返回有效 Worker，也不返回伪 Worker（因为伪 Worker 会导致 Diff 视觉丢失）。
      // 通过显式抛错，让 Monaco 放弃 Worker 并回退到 Main Thread Diff 算法。
      // 这个错通常会被 Monaco 捕获或记录，而不触发全屏红屏。
      throw new Error('Core Worker not configured (falling back to main thread)');
    },
  };

  (globalThis as any).__monacoEnvironmentConfigured = true;
};

// 立即执行 Worker 配置
setupMonacoEnvironment();

/**
 * useMonacoLoader - 负责 Monaco 的动态加载与内置贡献注册
 */
const completionLoaders: Record<string, () => Promise<any>> = {
  sql: () => import('monaco-editor/esm/vs/basic-languages/sql/sql.js'),
  mysql: () => import('monaco-editor/esm/vs/basic-languages/mysql/mysql.js'),
  pgsql: () => import('monaco-editor/esm/vs/basic-languages/pgsql/pgsql.js'),
  html: () => import('monaco-editor/esm/vs/basic-languages/html/html.js'),
  css: () => import('monaco-editor/esm/vs/basic-languages/css/css.js'),
  javascript: () => import('monaco-editor/esm/vs/basic-languages/javascript/javascript.js'),
  typescript: () => import('monaco-editor/esm/vs/basic-languages/typescript/typescript.js'),
  json: () => Promise.resolve({ language: {} }),
  yaml: () => import('monaco-editor/esm/vs/basic-languages/yaml/yaml.js'),
  shell: () => import('monaco-editor/esm/vs/basic-languages/shell/shell.js'),
  xml: () => import('monaco-editor/esm/vs/basic-languages/xml/xml.js'),
  python: () => import('monaco-editor/esm/vs/basic-languages/python/python.js'),
  java: () => import('monaco-editor/esm/vs/basic-languages/java/java.js'),
  go: () => import('monaco-editor/esm/vs/basic-languages/go/go.js'),
};

export const useMonacoLoader = (props: YMonacoProps) => {
  let monacoCache: MonacoApi | null = null;
  let contributionsReady = false;

  /** 旧版 NLS 插件不适配当前 ESM 内核；保留英文以保证编辑状态与行为稳定。 */
  let nlsWarningShown = false;
  const ensureNls = async (): Promise<void> => {
    if (props.nls && !nlsWarningShown) {
      nlsWarningShown = true;
      console.warn('[YMonaco] nls 已废弃：当前 Monaco ESM 内核使用英文；组件按钮随 YConfigProvider 切换。');
    }
  };

  /**
   * 加载 Monaco 编辑器实例
   * 确保在 ensureNls 完成后才加载
   */
  const ensureMonaco = async (): Promise<MonacoApi> => {
    if (monacoCache) return monacoCache;

    // 关键：必须先完成 NLS 配置再加载 Monaco
    await ensureNls();

    const mod = await import('monaco-editor/esm/vs/editor/editor.api');
    monacoCache = ((mod as any).default ?? mod) as MonacoApi;

    return monacoCache as MonacoApi;
  };

  const ensureContributions = async (): Promise<void> => {
    if (contributionsReady) return;
    try {
      await Promise.all(
        [
          import('monaco-editor/esm/vs/editor/contrib/contextmenu/browser/contextmenu'),
          import('monaco-editor/esm/vs/editor/contrib/find/browser/findController'),
          import('monaco-editor/esm/vs/editor/contrib/comment/browser/comment'),
          import('monaco-editor/esm/vs/editor/contrib/linesOperations/browser/linesOperations'),
          import('monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess'),
          import('monaco-editor/esm/vs/editor/contrib/snippet/browser/snippetController2'),
          import('monaco-editor/esm/vs/editor/contrib/format/browser/formatActions'),
          import('monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController'),
          import('monaco-editor/esm/vs/editor/contrib/folding/browser/folding'),
        ].map((p: Promise<unknown>): Promise<unknown> => p.catch((_err: unknown): undefined => undefined))
      );
    } finally {
      contributionsReady = true;
    }
  };

  const ensureLanguageContribution = async (_m: MonacoApi, language: string): Promise<void> => {
    try {
      // 统一别名，避免常见缩写导致的加载失败
      const lang = normalizeMonacoLanguage(language);

      // 组件库扩展语言：日志查看与 Nginx 配置
      if (ensureCustomLanguageContribution(_m, lang)) return;

      // JavaScript 和 TypeScript 需要特殊处理（加载 Language Service）
      if (lang === 'javascript' || lang === 'typescript') {
        const basicMap: Record<string, () => Promise<any>> = {
          javascript: () => import('monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'),
          typescript: () => import('monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution'),
        };
        await (basicMap[lang]?.() ?? Promise.resolve());
        try {
          await import('monaco-editor/esm/vs/language/typescript/monaco.contribution');
        } catch {}
        return;
      }

      // 显式导入常用语言（确保打包后可用）
      const langMap: Record<string, () => Promise<any>> = {
        // 数据库
        sql: () => import('monaco-editor/esm/vs/basic-languages/sql/sql.contribution'),
        mysql: () => import('monaco-editor/esm/vs/basic-languages/mysql/mysql.contribution'),
        pgsql: () => import('monaco-editor/esm/vs/basic-languages/pgsql/pgsql.contribution'),
        redis: () => import('monaco-editor/esm/vs/basic-languages/redis/redis.contribution'),
        // Web 开发
        html: () => import('monaco-editor/esm/vs/basic-languages/html/html.contribution'),
        css: () => import('monaco-editor/esm/vs/basic-languages/css/css.contribution'),
        scss: () => import('monaco-editor/esm/vs/basic-languages/scss/scss.contribution'),
        less: () => import('monaco-editor/esm/vs/basic-languages/less/less.contribution'),
        xml: () => import('monaco-editor/esm/vs/basic-languages/xml/xml.contribution'),
        markdown: () => import('monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution'),
        // 数据格式（JSON 使用 language service）
        json: () => import('monaco-editor/esm/vs/language/json/monaco.contribution'),
        // 配置文件
        yaml: () => import('monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution'),
        ini: () => import('monaco-editor/esm/vs/basic-languages/ini/ini.contribution'),
        dockerfile: () => import('monaco-editor/esm/vs/basic-languages/dockerfile/dockerfile.contribution'),
        shell: () => import('monaco-editor/esm/vs/basic-languages/shell/shell.contribution'),
        bat: () => import('monaco-editor/esm/vs/basic-languages/bat/bat.contribution'),
        powershell: () => import('monaco-editor/esm/vs/basic-languages/powershell/powershell.contribution'),
        // 后端语言
        python: () => import('monaco-editor/esm/vs/basic-languages/python/python.contribution'),
        java: () => import('monaco-editor/esm/vs/basic-languages/java/java.contribution'),
        go: () => import('monaco-editor/esm/vs/basic-languages/go/go.contribution'),
        csharp: () => import('monaco-editor/esm/vs/basic-languages/csharp/csharp.contribution'),
        cpp: () => import('monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution'),
        c: () => import('monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution'), // C 使用 cpp 的定义
        php: () => import('monaco-editor/esm/vs/basic-languages/php/php.contribution'),
        ruby: () => import('monaco-editor/esm/vs/basic-languages/ruby/ruby.contribution'),
        rust: () => import('monaco-editor/esm/vs/basic-languages/rust/rust.contribution'),
        scala: () => import('monaco-editor/esm/vs/basic-languages/scala/scala.contribution'),
        swift: () => import('monaco-editor/esm/vs/basic-languages/swift/swift.contribution'),
        kotlin: () => import('monaco-editor/esm/vs/basic-languages/kotlin/kotlin.contribution'),
        lua: () => import('monaco-editor/esm/vs/basic-languages/lua/lua.contribution'),
        perl: () => import('monaco-editor/esm/vs/basic-languages/perl/perl.contribution'),
        r: () => import('monaco-editor/esm/vs/basic-languages/r/r.contribution'),
        // 其他
        graphql: () => import('monaco-editor/esm/vs/basic-languages/graphql/graphql.contribution'),
      };

      const loader = langMap[lang];
      if (loader) {
        await loader();
        return;
      }

      // 对于未明确支持的语言，静默失败（不会影响编辑器功能，只是没有语法高亮）
      console.warn(`[Monaco] Language "${lang}" is not explicitly supported. Syntax highlighting may not work.`);
    } catch (err) {
      console.warn(`[Monaco] Failed to load language "${language}":`, err);
    }
  };

  const tryLoadLanguageCompletion = async (m: MonacoApi, language: string) => {
    const lang = normalizeMonacoLanguage(language);
    const builtin = new Set(['html', 'json', 'css', 'javascript', 'typescript']);
    if (builtin.has(lang)) return;
    try {
      const loader = completionLoaders[lang];
      if (!loader) return;
      const mod = await loader();
      const languageConf = (mod as any)?.language ?? {};
      m.languages.registerCompletionItemProvider(lang, {
        provideCompletionItems: (mdl: any, position: any) => {
          const { lineNumber, column } = position;
          // 注意：Monaco 列从 1 开始，0 会导致在空行/行首时无法正确取值
          const textBeforePointer = mdl.getValueInRange({
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: column,
          });
          const last = (textBeforePointer.trim().split(/\s+/).pop() ?? '').trim();
          const suggestions: any[] = [];
          if (!last) return { suggestions };
          const keys = ['builtinFunctions', 'keywords', 'operators'] as const;
          const kindMaps: Record<string, number> = {
            builtinFunctions: (m as any).languages.CompletionItemKind.Function,
            keywords: (m as any).languages.CompletionItemKind.Keyword,
            operators: (m as any).languages.CompletionItemKind.Operator,
          };
          keys.forEach(key => {
            const arr = (languageConf as any)?.[key] ?? [];
            arr.forEach((label: string) => {
              suggestions.push({ label, insertText: label, kind: kindMaps[key] });
            });
          });
          return { suggestions };
        },
      });
    } catch {
      // ignore
    }
  };

  return {
    ensureMonaco,
    ensureContributions,
    ensureLanguageContribution,
    tryLoadLanguageCompletion,
    getMonaco: (): MonacoApi | null => monacoCache,
  };
};
