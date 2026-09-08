module.exports = {
  // 说明：为避免 stylelint 15 与部分配置集（recommended-vue）引入的 v16 新规则不兼容，
  // 这里仅使用 standard 基础规则集，并按需关闭不符合当前项目约定的规则。
  extends: ['stylelint-config-standard'],
  overrides: [
    {
      files: ['**/*.{vue,html}'],
      customSyntax: 'postcss-html',
    },
    {
      files: ['**/*.less'],
      customSyntax: 'postcss-less',
    },
  ],
  rules: {
    // 允许 BEM 风格（__、--）等，不强制 kebab-case
    'selector-class-pattern': null,
    // 允许自定义属性使用下划线等前缀私有变量，不强制 kebab-case
    'custom-property-pattern': null,
    // Demo 与文档常出现空 <style>，跳过
    'no-empty-source': null,
    // 为了减少跨文件顺序要求导致的报错，先关闭
    'no-descending-specificity': null,
    // 强制使用前缀写法 (max-width) 而非 range 写法 (width <=)，兼容 Less
    'media-feature-range-notation': 'prefix',
    // Vue SFC 的 scoped style 合法深度选择器。
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['deep', 'global'] }],
    'selector-pseudo-element-no-unknown': [true, { ignorePseudoElements: ['deep', 'v-deep'] }],
  },
  ignoreFiles: ['node_modules/**', 'dist/**', 'dist-docs/**', 'packages/**/dist/**', 'packages/**/dist-umd/**'],
};
