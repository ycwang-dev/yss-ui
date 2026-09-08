import { format as sqlFormatterFormat } from 'sql-formatter';
import type {} from 'vue';

const SQL_FORMAT_OPTIONS = {
  language: 'sql',
  tabWidth: 2,
  keywordCase: 'preserve',
} as const;

type HashPlaceholder = {
  placeholder: string;
  original: string;
};

type ScanState =
  | 'code'
  | 'singleQuote'
  | 'doubleQuote'
  | 'backtickQuote'
  | 'bracketQuote'
  | 'lineComment'
  | 'blockComment';

/**
 * 统一 SQL 文本中的换行符，避免不同环境下出现仅 \r 或特殊换行符
 */
const normalizeSqlNewlines = (sql: string): string => sql.replace(/\r\n?/g, '\n').replace(/[\u2028\u2029]/g, '\n');

/**
 * 按 SQL 词法状态拆分语句，避免误拆字符串、注释中的分号
 */
const splitSqlStatements = (sql: string): string[] => {
  const normalized = normalizeSqlNewlines(sql);
  const parts: string[] = [];
  let current = '';
  let state: ScanState = 'code';

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    const next = normalized[i + 1];

    current += ch;

    if (state === 'code') {
      if (ch === "'") {
        state = 'singleQuote';
        continue;
      }
      if (ch === '"') {
        state = 'doubleQuote';
        continue;
      }
      if (ch === '`') {
        state = 'backtickQuote';
        continue;
      }
      if (ch === '[') {
        state = 'bracketQuote';
        continue;
      }
      if (ch === '-' && next === '-') {
        current += next;
        i++;
        state = 'lineComment';
        continue;
      }
      if (ch === '/' && next === '*') {
        current += next;
        i++;
        state = 'blockComment';
        continue;
      }
      if (ch === ';') {
        parts.push(current);
        current = '';
      }
      continue;
    }

    if (state === 'singleQuote') {
      if (ch === "'" && next === "'") {
        current += next;
        i++;
        continue;
      }
      if (ch === "'") state = 'code';
      continue;
    }

    if (state === 'doubleQuote') {
      if (ch === '"' && next === '"') {
        current += next;
        i++;
        continue;
      }
      if (ch === '"') state = 'code';
      continue;
    }

    if (state === 'backtickQuote') {
      if (ch === '`' && next === '`') {
        current += next;
        i++;
        continue;
      }
      if (ch === '`') state = 'code';
      continue;
    }

    if (state === 'bracketQuote') {
      if (ch === ']' && next === ']') {
        current += next;
        i++;
        continue;
      }
      if (ch === ']') state = 'code';
      continue;
    }

    if (state === 'lineComment') {
      if (ch === '\n') state = 'code';
      continue;
    }

    if (ch === '*' && next === '/') {
      current += next;
      i++;
      state = 'code';
    }
  }

  if (current.trim()) {
    parts.push(current);
  }

  return parts;
};

/**
 * 仅对语句边界做整理，不改动关键字大小写
 */
const normalizeSqlLayout = (sql: string): string => {
  const normalized = normalizeSqlNewlines(sql);
  const statements = splitSqlStatements(normalized)
    .map(statement => statement.trim())
    .filter(Boolean);

  if (statements.length <= 1) {
    return normalized;
  }

  return statements.join('\n\n');
};

const HASH_PLACEHOLDER_PREFIX = '__YSS_HASH_';
const HASH_PLACEHOLDER_SUFFIX = '__';

/**
 * 只在代码区替换非标准 # 标注，避免影响字符串和注释
 */
const escapeHashTokens = (sql: string): { text: string; placeholders: HashPlaceholder[] } => {
  const placeholders: HashPlaceholder[] = [];
  let idx = 0;
  let state: ScanState = 'code';
  let text = '';

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (state === 'code' && ch === '#' && next && !/[\s,;\n]/.test(next)) {
      let token = '#';
      let j = i + 1;
      while (j < sql.length && !/[\s,;\n]/.test(sql[j])) {
        token += sql[j];
        j++;
      }
      const placeholder = `${HASH_PLACEHOLDER_PREFIX}${idx}${HASH_PLACEHOLDER_SUFFIX}`;
      placeholders.push({ placeholder, original: token });
      text += placeholder;
      idx++;
      i = j - 1;
      continue;
    }

    text += ch;

    if (state === 'code') {
      if (ch === "'") {
        state = 'singleQuote';
        continue;
      }
      if (ch === '"') {
        state = 'doubleQuote';
        continue;
      }
      if (ch === '`') {
        state = 'backtickQuote';
        continue;
      }
      if (ch === '[') {
        state = 'bracketQuote';
        continue;
      }
      if (ch === '-' && next === '-') {
        text += next;
        i++;
        state = 'lineComment';
        continue;
      }
      if (ch === '/' && next === '*') {
        text += next;
        i++;
        state = 'blockComment';
        continue;
      }
      continue;
    }

    if (state === 'singleQuote') {
      if (ch === "'" && next === "'") {
        text += next;
        i++;
        continue;
      }
      if (ch === "'") state = 'code';
      continue;
    }

    if (state === 'doubleQuote') {
      if (ch === '"' && next === '"') {
        text += next;
        i++;
        continue;
      }
      if (ch === '"') state = 'code';
      continue;
    }

    if (state === 'backtickQuote') {
      if (ch === '`' && next === '`') {
        text += next;
        i++;
        continue;
      }
      if (ch === '`') state = 'code';
      continue;
    }

    if (state === 'bracketQuote') {
      if (ch === ']' && next === ']') {
        text += next;
        i++;
        continue;
      }
      if (ch === ']') state = 'code';
      continue;
    }

    if (state === 'lineComment') {
      if (ch === '\n') state = 'code';
      continue;
    }

    if (ch === '*' && next === '/') {
      text += next;
      i++;
      state = 'code';
    }
  }

  return { text, placeholders };
};

const restoreHashTokens = (formatted: string, placeholders: HashPlaceholder[]): string => {
  let result = formatted;
  for (const { placeholder, original } of placeholders) {
    result = result.replace(placeholder, original);
  }
  return result;
};

const formatWithSqlFormatter = (sql: string): string => {
  const { text: escaped, placeholders } = escapeHashTokens(sql);
  const formatted = sqlFormatterFormat(escaped, SQL_FORMAT_OPTIONS as any);
  return restoreHashTokens(formatted, placeholders);
};

/**
 * SQL 文本格式化：优先使用 sql-formatter，失败时退回到保守整理
 * 保守整理只修复换行、语句边界与尾随空白，不改动原有大小写
 */
export const tryFormatSql = async (sql: string): Promise<string> => {
  if (!sql) return sql;

  const preparedSql = normalizeSqlLayout(normalizeSqlNewlines(sql));

  try {
    return formatWithSqlFormatter(preparedSql);
  } catch {
    const result = formatStatementsIndividually(preparedSql);
    if (result) return result;
  }

  return simpleSqlFormat(preparedSql);
};

/**
 * 将 SQL 按语句拆分后逐条使用 sql-formatter 格式化
 * 对于无法格式化的语句保持原样，整体返回拼接结果
 */
const formatStatementsIndividually = (sql: string): string | null => {
  const rawParts = splitSqlStatements(sql);
  const formattedParts: string[] = [];
  let hasSuccess = false;

  for (const part of rawParts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    try {
      formattedParts.push(formatWithSqlFormatter(trimmed));
      hasSuccess = true;
    } catch {
      formattedParts.push(trimmed);
    }
  }

  return hasSuccess ? formattedParts.join('\n\n') : null;
};

/**
 * 保守整理：只修复换行、语句边界、尾随空白与多余空行
 */
export const simpleSqlFormat = (input: string): string => {
  const normalizedInput = normalizeSqlLayout(input);
  return normalizedInput
    .split('\n')
    .map(line => line.replace(/[\t ]+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};
