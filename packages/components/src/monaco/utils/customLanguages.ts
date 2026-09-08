import type { MonacoApi } from '../type';

/** 日志语言别名 */
const LOG_LANGUAGE_IDS = ['log', 'yss-log'];

/** Nginx 语言别名 */
const NGINX_LANGUAGE_IDS = ['nginx'];

/** 已注册的自定义语言 */
const registeredLanguages = new Set<string>();

/** 已注册补全能力的语言 */
const registeredCompletionProviders = new Set<string>();

/** 自定义主题是否已注册 */
let customThemesRegistered = false;

/** Nginx 块级指令 */
const NGINX_BLOCK_DIRECTIVES = [
  'events',
  'http',
  'server',
  'location',
  'upstream',
  'stream',
  'mail',
  'types',
  'map',
  'geo',
  'limit_except',
  'if',
  'split_clients',
];

/** Nginx 常用指令 */
const NGINX_DIRECTIVES = [
  'add_header',
  'access_log',
  'alias',
  'allow',
  'auth_basic',
  'auth_basic_user_file',
  'autoindex',
  'client_body_buffer_size',
  'client_max_body_size',
  'deny',
  'default_type',
  'error_log',
  'fastcgi_param',
  'fastcgi_pass',
  'fastcgi_read_timeout',
  'gzip',
  'gzip_comp_level',
  'gzip_types',
  'include',
  'index',
  'keepalive_timeout',
  'listen',
  'log_format',
  'proxy_buffering',
  'proxy_connect_timeout',
  'proxy_http_version',
  'proxy_pass',
  'proxy_read_timeout',
  'proxy_redirect',
  'proxy_send_timeout',
  'proxy_set_header',
  'return',
  'rewrite',
  'root',
  'server_name',
  'set',
  'ssl_certificate',
  'ssl_certificate_key',
  'ssl_ciphers',
  'ssl_protocols',
  'try_files',
];

/** Nginx 补全候选 */
const NGINX_COMPLETION_WORDS = [...NGINX_BLOCK_DIRECTIVES, ...NGINX_DIRECTIVES, 'on', 'off'];

/**
 * 标准化 Monaco 语言 ID。
 * @param language 原始语言
 * @returns 标准语言 ID
 */
export const normalizeMonacoLanguage = (language?: string): string => {
  const lang = (language || '').trim().toLowerCase();
  const aliasMap: Record<string, string> = {
    yml: 'yaml',
    sh: 'shell',
    bash: 'shell',
    js: 'javascript',
    ts: 'typescript',
    logs: 'log',
    nginxconf: 'nginx',
  };
  return aliasMap[lang] ?? lang;
};

/**
 * 判断是否为日志语言。
 * @param language Monaco 语言 ID
 * @returns 是否为日志语言
 */
export const isLogLanguage = (language?: string): boolean => {
  return LOG_LANGUAGE_IDS.includes(normalizeMonacoLanguage(language));
};

/**
 * 判断是否为 Nginx 语言。
 * @param language Monaco 语言 ID
 * @returns 是否为 Nginx 语言
 */
export const isNginxLanguage = (language?: string): boolean => {
  return NGINX_LANGUAGE_IDS.includes(normalizeMonacoLanguage(language));
};

/**
 * 解析自定义语言适用的主题。
 * @param theme 原始主题
 * @param language 当前语言
 * @returns Monaco 主题名称
 */
export const resolveMonacoTheme = (theme: string | undefined, language?: string): string | undefined => {
  if (!theme || !isLogLanguage(language)) return theme;
  if (theme === 'vs') return 'yss-log-vs';
  if (theme === 'vs-dark') return 'yss-log-vs-dark';
  if (theme === 'hc-black') return 'yss-log-hc-black';
  return theme;
};

/**
 * 注册日志与 Nginx 自定义语言。
 * @param monaco Monaco API
 * @param language 语言 ID
 * @returns 是否已处理该语言
 */
export const ensureCustomLanguageContribution = (monaco: MonacoApi, language: string): boolean => {
  const lang = normalizeMonacoLanguage(language);
  if (isLogLanguage(lang)) {
    registerLogLanguage(monaco, lang);
    return true;
  }
  if (isNginxLanguage(lang)) {
    registerNginxLanguage(monaco, lang);
    return true;
  }
  return false;
};

/**
 * 注册日志主题。
 * @param monaco Monaco API
 */
const registerLogThemes = (monaco: MonacoApi): void => {
  if (customThemesRegistered) return;
  customThemesRegistered = true;

  monaco.editor.defineTheme('yss-log-vs', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'log.error', foreground: 'dc2626', fontStyle: 'bold' },
      { token: 'log.warning', foreground: 'b45309', fontStyle: 'bold' },
      { token: 'log.success', foreground: '15803d', fontStyle: 'bold' },
      { token: 'log.info', foreground: '2563eb' },
      { token: 'log.debug', foreground: '6b7280' },
    ],
    colors: {},
  });

  monaco.editor.defineTheme('yss-log-vs-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'log.error', foreground: 'f87171', fontStyle: 'bold' },
      { token: 'log.warning', foreground: 'facc15', fontStyle: 'bold' },
      { token: 'log.success', foreground: '4ade80', fontStyle: 'bold' },
      { token: 'log.info', foreground: '60a5fa' },
      { token: 'log.debug', foreground: '9ca3af' },
    ],
    colors: {},
  });

  monaco.editor.defineTheme('yss-log-hc-black', {
    base: 'hc-black',
    inherit: true,
    rules: [
      { token: 'log.error', foreground: 'ff6b6b', fontStyle: 'bold' },
      { token: 'log.warning', foreground: 'ffd166', fontStyle: 'bold' },
      { token: 'log.success', foreground: '6ee7b7', fontStyle: 'bold' },
      { token: 'log.info', foreground: '93c5fd' },
      { token: 'log.debug', foreground: 'd1d5db' },
    ],
    colors: {},
  });
};

/**
 * 注册日志语言。
 * @param monaco Monaco API
 * @param language 语言 ID
 */
const registerLogLanguage = (monaco: MonacoApi, language: string): void => {
  registerLogThemes(monaco);
  const languageIds = language === 'yss-log' ? ['yss-log'] : LOG_LANGUAGE_IDS;
  languageIds.forEach(id => {
    if (!registeredLanguages.has(id)) {
      const exists = monaco.languages.getLanguages?.().some((item: { id: string }) => item.id === id);
      if (!exists) {
        monaco.languages.register({ id, aliases: id === 'log' ? ['Log', 'log'] : ['YSS Log', 'yss-log'] });
      }
      registeredLanguages.add(id);
    }
    monaco.languages.setMonarchTokensProvider(id, {
      defaultToken: '',
      ignoreCase: true,
      tokenizer: {
        root: [
          [
            /^.*(?:\b(FATAL|ERROR|ERR|FAILED|FAILURE|FAIL|EXCEPTION)\b|\[(error|fatal)\]|error during build).*$/,
            'log.error',
          ],
          [/^.*(?:\b(WARN|WARNING)\b|\[(warn|warning)\]).*$/, 'log.warning'],
          [/^.*(?:\b(SUCCESS|DONE|PASSED|COMPLETE|COMPLETED)\b|\[(success|done)\]).*$/, 'log.success'],
          [/^.*(?:\b(INFO|NOTICE)\b|\[(info|notice)\]).*$/, 'log.info'],
          [/^.*(?:\b(DEBUG|TRACE)\b|\[(debug|trace)\]).*$/, 'log.debug'],
          [/.*$/, ''],
        ],
      },
    });
  });
};

/**
 * 注册 Nginx 语言。
 * @param monaco Monaco API
 * @param language 语言 ID
 */
const registerNginxLanguage = (monaco: MonacoApi, language: string): void => {
  if (!registeredLanguages.has(language)) {
    const exists = monaco.languages.getLanguages?.().some((item: { id: string }) => item.id === language);
    if (!exists) {
      monaco.languages.register({
        id: language,
        aliases: ['Nginx', 'nginx'],
        extensions: ['.nginx', '.nginxconf', '.conf'],
        mimetypes: ['text/x-nginx-conf'],
      });
    }
    monaco.languages.setLanguageConfiguration(language, {
      comments: {
        lineComment: '#',
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
    });
    registeredLanguages.add(language);
  }

  monaco.languages.setMonarchTokensProvider(language, {
    defaultToken: '',
    ignoreCase: true,
    blockDirectives: NGINX_BLOCK_DIRECTIVES,
    directives: NGINX_DIRECTIVES,
    tokenizer: {
      root: [
        [/#.*$/, 'comment'],
        [/"/, 'string', '@stringDouble'],
        [/'/, 'string', '@stringSingle'],
        [/[{};]/, 'delimiter.bracket'],
        [/\$\{?[a-zA-Z_][\w]*\}?/, 'variable'],
        [/\b(on|off)\b/, 'constant.language'],
        [/\b\d+(?:\.\d+)?(?:[kmg])?(?:ms|s|m|h|d)?\b/, 'number'],
        [
          /[a-zA-Z_][\w.-]*/,
          {
            cases: {
              '@blockDirectives': 'keyword',
              '@directives': 'type.identifier',
              '@default': 'identifier',
            },
          },
        ],
      ],
      stringDouble: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop'],
      ],
      stringSingle: [
        [/[^\\']+/, 'string'],
        [/\\./, 'string.escape'],
        [/'/, 'string', '@pop'],
      ],
    },
  });

  registerNginxCompletionProvider(monaco, language);
};

/**
 * 注册 Nginx 指令补全。
 * @param monaco Monaco API
 * @param language 语言 ID
 */
const registerNginxCompletionProvider = (monaco: MonacoApi, language: string): void => {
  if (registeredCompletionProviders.has(language)) return;
  registeredCompletionProviders.add(language);

  monaco.languages.registerCompletionItemProvider(language, {
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      return {
        suggestions: NGINX_COMPLETION_WORDS.map(label => ({
          label,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: label,
          range,
        })),
      };
    },
  });
};
