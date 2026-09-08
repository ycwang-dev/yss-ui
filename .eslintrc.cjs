module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
    'plugin:vue/vue3-recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
  },
  plugins: ['vue', '@typescript-eslint', 'import'],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      alias: {
        map: [
          ['@yss-ui/components/locale', './packages/components/src/locale'],
          ['@yss-ui/components', './packages/components/src'],
          ['@yss-ui/utils', './packages/utils/src'],
          ['@yss-ui/hooks', './packages/hooks/src'],
          ['@yss-ui/theme', './packages/theme/src'],
        ],
        extensions: ['.ts', '.tsx', '.vue', '.js', '.jsx'],
      },
    },
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx', '.vue'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
      'vue-eslint-parser': ['.vue'],
    },
  },
  rules: {
    // 错误级别
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
    ],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    eqeqeq: ['error', 'always'],
    'no-empty': ['error', { allowEmptyCatch: true }],
    'import/no-unresolved': 'error',
    'import/no-absolute-path': 'error',
    'import/no-self-import': 'error',
    'import/no-cycle': 'warn',
    'import/no-useless-path-segments': 'error',

    // 关闭基础未使用变量，交由 TS 版规则
    'no-unused-vars': 'off',

    // Vue
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-components': 'error',
    'vue/no-unused-vars': 'error',
    'vue/require-v-for-key': 'error',
    'vue/require-prop-types': 'error',
    'vue/valid-v-slot': 'error',

    // TS
    '@typescript-eslint/no-unused-expressions': 'error',
    'prefer-const': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',

    // 放宽
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    indent: 'off',
    '@typescript-eslint/indent': 'off',
    quotes: 'off',
    '@typescript-eslint/quotes': 'off',
    semi: 'off',
    '@typescript-eslint/semi': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'import/default': 'off',
    'import/no-named-as-default': 'warn',
    'import/namespace': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/html-self-closing': 'off',
    'vue/max-attributes-per-line': 'off',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'dist-docs/',
    'coverage/',
    'packages/**/dist/',
    '**/*.d.ts',
    'packages/components/dist/',
    '.dumi/',
    '.dumi/**',
    '**/.dumi/**',
  ],
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        'vue/multi-word-component-names': 'off',
      },
    },
  ],
};
