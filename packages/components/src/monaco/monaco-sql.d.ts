/**
 * Monaco Editor basic-languages 模块类型声明
 * 用于解决动态导入 monaco-editor ESM 语言定义文件时的 TypeScript 类型检查问题。
 */

type MonacoBasicLanguageConfig = Record<string, any>;

interface MonacoBasicLanguageDefinition {
  keywords?: string[];
  builtinFunctions?: string[];
  operators?: string[];
  builtinVariables?: string[];
  [key: string]: any;
}

declare module 'monaco-editor/esm/vs/basic-languages/sql/sql.js' {
  export const language: MonacoBasicLanguageDefinition;
  export const conf: MonacoBasicLanguageConfig;
}

declare module 'monaco-editor/esm/vs/basic-languages/mysql/mysql.js' {
  export const language: MonacoBasicLanguageDefinition;
  export const conf: MonacoBasicLanguageConfig;
}

declare module 'monaco-editor/esm/vs/basic-languages/pgsql/pgsql.js' {
  export const language: MonacoBasicLanguageDefinition;
  export const conf: MonacoBasicLanguageConfig;
}

declare module 'monaco-editor/esm/vs/basic-languages/html/html.js' {
  export const language: MonacoBasicLanguageDefinition;
  export const conf: MonacoBasicLanguageConfig;
}

declare module 'monaco-editor/esm/vs/basic-languages/css/css.js' {
  export const language: MonacoBasicLanguageDefinition;
  export const conf: MonacoBasicLanguageConfig;
}

declare module 'monaco-editor/esm/vs/basic-languages/javascript/javascript.js' {
  export const language: MonacoBasicLanguageDefinition;
  export const conf: MonacoBasicLanguageConfig;
}

declare module 'monaco-editor/esm/vs/basic-languages/typescript/typescript.js' {
  export const language: MonacoBasicLanguageDefinition;
  export const conf: MonacoBasicLanguageConfig;
}

declare module 'monaco-editor/esm/vs/basic-languages/yaml/yaml.js' {
  export const language: MonacoBasicLanguageDefinition;
  export const conf: MonacoBasicLanguageConfig;
}

declare module 'monaco-editor/esm/vs/basic-languages/shell/shell.js' {
  export const language: MonacoBasicLanguageDefinition;
  export const conf: MonacoBasicLanguageConfig;
}

declare module 'monaco-editor/esm/vs/basic-languages/xml/xml.js' {
  export const language: MonacoBasicLanguageDefinition;
  export const conf: MonacoBasicLanguageConfig;
}

declare module 'monaco-editor/esm/vs/basic-languages/python/python.js' {
  export const language: MonacoBasicLanguageDefinition;
  export const conf: MonacoBasicLanguageConfig;
}

declare module 'monaco-editor/esm/vs/basic-languages/java/java.js' {
  export const language: MonacoBasicLanguageDefinition;
  export const conf: MonacoBasicLanguageConfig;
}

declare module 'monaco-editor/esm/vs/basic-languages/go/go.js' {
  export const language: MonacoBasicLanguageDefinition;
  export const conf: MonacoBasicLanguageConfig;
}
