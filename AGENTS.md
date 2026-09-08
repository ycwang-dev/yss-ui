# YSS UI 仓库级 AI 约束

## 首页产品定位保护

- `scripts/lib/home-release-positioning.js` 中的 `HOME_PRODUCT_HIGHLIGHTS` 是首页长期产品总体介绍，不是单次发版摘要。
- 常规 changelog、版本号、发布日期、发版说明或生成文件更新，禁止修改 `HOME_PRODUCT_HIGHLIGHTS`。
- 只有用户明确要求“调整首页产品定位/总体介绍”时，才能修改该文件，并同步更新 `scripts/generate-home-releases.test.js` 中的受保护快照。
- 发版数据生成只允许从 changelog 更新 `version` 和 `date`；不得根据本次 diff 自动改写 `highlight`。

## Skills 单一事实源

- `packages/skills/*` 是 YSS Skills 的唯一源码；`docs/skills/*`、项目级目录和用户级 AI IDE 目录都是派生副本或链接。
- 在本仓库修改 Skills 后，必须运行 `pnpm sync:skills-docs`、`pnpm validate:skills`，并补充 `docs/changelog/skills.md` 的目标版本记录。
- 本仓库安装 Skills 必须使用本地源码：运行 `pnpm sync:skills`；需要让本机 Codex、Cursor、Claude、Trae 与通用 Agents 目录始终跟随当前源码时，运行 `pnpm sync:skills:ides`。

## 发版前门禁

- 准备提交或发版时，必须运行 `node scripts/release-changed.js patch --dry`，并为每个待发包补齐目标版本 changelog。
- `packages/skills/**` 的变更必须检查 `docs/changelog/skills.md`，不得只补 components 或 mcp 日志。
