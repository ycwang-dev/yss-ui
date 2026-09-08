import type { MonacoApi, SqlSchema } from '../type';
import { tryFormatSql } from '../utils/sqlFormat';

/** SQL 语言定义缓存 */
let sqlLanguageCache: {
  keywords: string[];
  builtinFunctions: string[];
  operators: string[];
  builtinVariables: string[];
} | null = null;

/**
 * 从 Monaco SQL 语言模块动态加载关键词定义
 * 只加载一次，后续使用缓存
 */
const loadSqlLanguageDefinitions = async (): Promise<typeof sqlLanguageCache> => {
  if (sqlLanguageCache) return sqlLanguageCache;

  try {
    // 动态导入 Monaco SQL 语言定义
    const sqlModule = await import('monaco-editor/esm/vs/basic-languages/sql/sql.js');
    const { language } = sqlModule;

    sqlLanguageCache = {
      keywords: language?.keywords ?? [],
      builtinFunctions: language?.builtinFunctions ?? [],
      operators: language?.operators ?? [],
      builtinVariables: language?.builtinVariables ?? [],
    };
  } catch {
    // 加载失败时使用空数组兜底
    sqlLanguageCache = {
      keywords: [],
      builtinFunctions: [],
      operators: [],
      builtinVariables: [],
    };
  }

  return sqlLanguageCache;
};

/**
 * useSqlProviders - 注册 SQL Completion 与 DocumentFormatting providers
 * 提供完整的 SQL 关键词、函数、操作符补全，以及上下文感知的表名/字段名补全
 */
export const useSqlProviders = (
  getMonaco: () => MonacoApi | null,
  getEditor: () => any,
  getSchema: () => SqlSchema | null
) => {
  let sqlCompletionDisposable: { dispose: () => void } | null = null;
  let sqlFormattingDisposable: { dispose: () => void } | null = null;

  /**
   * 销毁已注册的 SQL providers
   */
  const disposeSqlProviders = () => {
    try {
      sqlCompletionDisposable?.dispose?.();
    } catch {}
    try {
      sqlFormattingDisposable?.dispose?.();
    } catch {}
    sqlCompletionDisposable = null;
    sqlFormattingDisposable = null;
  };

  /**
   * 构建 SQL 补全 Provider
   * @param m Monaco API 实例
   * @param langDef SQL 语言定义（关键词、函数等）
   */
  const buildSqlCompletionProvider = (m: MonacoApi, langDef: NonNullable<typeof sqlLanguageCache>) => {
    /**
     * 计算补全项的替换范围
     */
    const toRange = (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);
      return {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word?.startColumn ?? position.column,
        endColumn: word?.endColumn ?? position.column,
      } as any;
    };

    /** 需要表名补全的关键词 */
    const KW_TABLE = new Set(['from', 'join', 'update', 'into', 'delete', 'table']);

    /**
     * 获取表名补全建议
     */
    const suggestTables = (schema: SqlSchema | null, range: any) => {
      const items: any[] = [];
      (schema?.tables ?? []).forEach(tbl => {
        items.push({
          label: tbl.name,
          kind: (m as any).languages.CompletionItemKind.Class,
          insertText: tbl.name,
          detail: 'Table',
          range,
        });
      });
      return items;
    };

    /**
     * 从 SQL 文本中解析别名映射
     */
    const getAliasMap = (text: string): Record<string, string> => {
      const map: Record<string, string> = {};
      const fromJoin = /(from|join)\s+([\w.]+)\s+(as\s+)?([\w]+)/gi;
      let mRes: RegExpExecArray | null;
      while ((mRes = fromJoin.exec(text))) {
        map[mRes[4]] = mRes[2];
      }
      return map;
    };

    /**
     * 通过别名或表名查找真实表名
     */
    const findTableByAlias = (aliasOrName: string, schema: SqlSchema | null): string | null => {
      if (!aliasOrName) return null;
      const allTables = new Set((schema?.tables ?? []).map(t => t.name));
      if (allTables.has(aliasOrName)) return aliasOrName;
      try {
        const mdlText = getEditor()?.getModel?.()?.getValue?.() ?? '';
        const map = getAliasMap(mdlText);
        return map[aliasOrName] ?? null;
      } catch {
        return null;
      }
    };

    /**
     * 获取指定表的字段补全建议
     */
    const columnsOf = (tableName: string, schema: SqlSchema | null, range: any): any[] => {
      if (!tableName) return [];
      const tbl = (schema?.tables ?? []).find(t => t.name === tableName);
      if (!tbl) return [];
      return (tbl.columns ?? []).map(col => ({
        label: col.name,
        insertText: col.name,
        detail: col.type || 'Column',
        kind: (m as any).languages.CompletionItemKind.Field,
        range,
      }));
    };

    /**
     * 构建基础 SQL 关键词补全建议（从 Monaco 语言定义动态获取）
     */
    const buildBaseKeywordSuggestions = (range: any): any[] => {
      const suggestions: any[] = [];

      // SQL 关键词
      langDef.keywords.forEach(kw => {
        suggestions.push({
          label: kw,
          kind: (m as any).languages.CompletionItemKind.Keyword,
          insertText: kw,
          detail: 'SQL Keyword',
          range,
        });
      });

      // SQL 内置函数
      langDef.builtinFunctions.forEach(fn => {
        suggestions.push({
          label: fn,
          kind: (m as any).languages.CompletionItemKind.Function,
          insertText: fn,
          detail: 'SQL Function',
          range,
        });
      });

      // SQL 操作符
      langDef.operators.forEach(op => {
        suggestions.push({
          label: op,
          kind: (m as any).languages.CompletionItemKind.Operator,
          insertText: op,
          detail: 'SQL Operator',
          range,
        });
      });

      // SQL 内置变量
      langDef.builtinVariables.forEach(v => {
        suggestions.push({
          label: v,
          kind: (m as any).languages.CompletionItemKind.Variable,
          insertText: v,
          detail: 'SQL Variable',
          range,
        });
      });

      return suggestions;
    };

    return {
      // 不设置 triggerCharacters，让 Monaco 使用默认触发机制（任意字符输入均可触发）
      provideCompletionItems: (model: any, position: any) => {
        const range = toRange(model, position);
        const schema = getSchema();

        // 1. 始终包含基础 SQL 关键词/函数/操作符补全
        const suggestions = buildBaseKeywordSuggestions(range);

        // 2. 上下文感知：获取光标前的文本用于判断
        const textBefore = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });
        const trimmedRight = textBefore.replace(/\s+$/, '');

        // 3. 别名.字段 补全场景（如 t.id）
        const dotAlias = /(\b[\w]+)\.$/.exec(trimmedRight);
        if (dotAlias) {
          const alias = dotAlias[1];
          const table = findTableByAlias(alias, schema);
          const colSuggestions = columnsOf(table ?? alias, schema, range);
          // 如果找到字段，优先返回字段补全
          if (colSuggestions.length > 0) {
            return { suggestions: colSuggestions } as any;
          }
        }

        // 4. FROM/JOIN 等关键词后补表名
        const tokens = textBefore.split(/\s+/);
        const lastToken = (tokens[tokens.length - 2] || '').toLowerCase();
        if (KW_TABLE.has(lastToken) && schema?.tables?.length) {
          const tableSuggestions = suggestTables(schema, range);
          // 合并表名和基础关键词补全
          return { suggestions: [...tableSuggestions, ...suggestions] } as any;
        }

        // 5. SELECT 列表中补字段名
        const isSelectList = /select\s+[\w\s,]*$/i.test(textBefore);
        if (isSelectList && schema?.tables?.length) {
          const colSet = new Map<string, any>();
          (schema.tables ?? []).forEach(t => {
            (t.columns || []).forEach(c => {
              if (!colSet.has(c.name)) {
                colSet.set(c.name, {
                  label: c.name,
                  insertText: c.name,
                  kind: (m as any).languages.CompletionItemKind.Field,
                  detail: c.type || 'Column',
                  range,
                });
              }
            });
          });
          const colSuggestions = Array.from(colSet.values());
          // 合并字段和基础关键词补全
          return { suggestions: [...colSuggestions, ...suggestions] } as any;
        }

        // 6. 默认返回基础关键词补全
        return { suggestions } as any;
      },
    } as any;
  };

  /**
   * 构建 SQL 文档格式化 Provider
   */
  const buildSqlFormattingProvider = (_m: MonacoApi) => ({
    provideDocumentFormattingEdits: async (model: any) => {
      const text = model.getValue?.() ?? '';
      const formatted = await tryFormatSql(text);
      if (!formatted || formatted === text) return [] as any[];
      return [
        {
          range: model.getFullModelRange(),
          text: formatted,
        },
      ] as any[];
    },
  });

  /**
   * 注册 SQL providers（补全 + 格式化）
   */
  const registerSqlProviders = async () => {
    const monaco = getMonaco();
    if (!monaco) return;

    // 先加载 SQL 语言定义
    const langDef = await loadSqlLanguageDefinitions();
    if (!langDef) return;

    disposeSqlProviders();
    sqlCompletionDisposable = monaco.languages.registerCompletionItemProvider(
      'sql',
      buildSqlCompletionProvider(monaco, langDef)
    );
    sqlFormattingDisposable = monaco.languages.registerDocumentFormattingEditProvider(
      'sql',
      buildSqlFormattingProvider(monaco)
    );
  };

  return { registerSqlProviders, disposeSqlProviders };
};
