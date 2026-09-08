/**
 * standard-version 配置文件
 * 用于自动化版本管理和更新日志生成
 *
 * 使用方式：
 * - pnpm release:patch  发布补丁版本 (1.0.0 -> 1.0.1)
 * - pnpm release:minor  发布次版本 (1.0.0 -> 1.1.0)
 * - pnpm release:major  发布主版本 (1.0.0 -> 2.0.0)
 */

module.exports = {
  // 禁用自动 commit（我们会在 postchangelog 中手动处理）
  skip: {
    commit: false,
    tag: false,
  },

  // 自定义 changelog 标题
  header: `---
title: 更新日志
nav:
  title: 更新日志
  path: /changelog
toc: content
---

# 更新日志

\`yss-ui\` 遵循 [Semantic Versioning 2.0.0](https://semver.org/lang/zh-CN/) 语义化版本规范。

## 发布周期

*   **修订版本号**：每周末会进行日常 bugfix 更新。（如果有紧急的 bugfix，则任何时候都可发布）
*   **次版本号**：每月发布一个带有新特性的向下兼容的版本。
*   **主版本号**：含有破坏性更新和新特性，不在发布周期内。

---

`,

  // 定义 commit 类型和对应的更新日志分类
  types: [
    { type: 'feat', section: '✨ Features' },
    { type: 'fix', section: '🐞 Bug Fixes' },
    { type: 'docs', section: '📝 Documentation' },
    { type: 'refactor', section: '🛠 Refactoring' },
    { type: 'style', section: '💅 Style' },
    { type: 'perf', section: '⚡ Performance' },
    { type: 'test', section: '✅ Tests', hidden: true },
    { type: 'build', section: '📦 Build', hidden: true },
    { type: 'ci', section: '🔧 CI', hidden: true },
    { type: 'chore', hidden: true },
  ],

  // 自动更新这些文件的版本号
  bumpFiles: [
    {
      filename: 'package.json',
      type: 'json',
    },
    {
      filename: 'packages/components/package.json',
      type: 'json',
    },
    {
      filename: 'packages/hooks/package.json',
      type: 'json',
    },
    {
      filename: 'packages/utils/package.json',
      type: 'json',
    },
    {
      filename: 'packages/theme/package.json',
      type: 'json',
    },
  ],

  // 自定义 commit message 转换规则
  writerOpts: {
    transform: (commit, context) => {
      const issues = [];

      // 添加包名标签
      if (commit.scope) {
        // 如果 scope 是包名格式 (@yss-ui/xxx)，添加中括号标签
        if (commit.scope.startsWith('@yss-ui/')) {
          commit.scope = `[${commit.scope}]`;
        } else {
          // 否则尝试映射到包名
          const scopeMap = {
            components: '[@yss-ui/components]',
            hooks: '[@yss-ui/hooks]',
            utils: '[@yss-ui/utils]',
            theme: '[@yss-ui/theme]',
          };
          commit.scope = scopeMap[commit.scope] || commit.scope;
        }
      }

      // 过滤掉不需要显示的 commit 类型
      if (commit.type === 'test' || commit.type === 'chore' || commit.type === 'build' || commit.type === 'ci') {
        return;
      }

      // 处理 breaking changes
      if (commit.notes && commit.notes.length > 0) {
        commit.notes.forEach(note => {
          note.title = '⚠️ BREAKING CHANGES';
        });
      }

      // 提取 commit hash
      if (typeof commit.hash === 'string') {
        commit.shortHash = commit.hash.substring(0, 7);
      }

      // 提取关联的 issue
      if (typeof commit.subject === 'string') {
        let url = context.repository ? `${context.host}/${context.owner}/${context.repository}` : context.repoUrl;
        if (url) {
          url = `${url}/-/issues/`;
          // Issue URLs.
          commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
            issues.push(issue);
            return `[#${issue}](${url}${issue})`;
          });
        }
        if (context.host) {
          // User URLs.
          commit.subject = commit.subject.replace(/@([a-zA-Z0-9_]+)/g, `[@$1](${context.host}/$1)`);
        }
      }

      // 关联的 commit 链接
      if (context.commit === 'commit') {
        commit.url = `${context.repoUrl}/-/commit/${commit.hash}`;
      }

      return commit;
    },
  },

  // 钩子脚本
  scripts: {
    // 生成 changelog 后自动运行分包日志生成脚本
    postchangelog: 'node scripts/generate-changelog.js',
  },
};
