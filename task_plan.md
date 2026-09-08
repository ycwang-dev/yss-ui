# 任务计划：YSS UI 后续质量治理

## 目标
在不破坏现有公共 API 的前提下，补齐覆盖率、发包消费验证、大组件模块化和严格类型迁移基线，并纳入可重复执行的质量门禁。

## 当前阶段
已完成

## 各阶段

### 阶段 1：基线与可行性分析
- [x] 检查测试、覆盖率依赖、打包脚本与导出契约
- [x] 评估 strictNullChecks 错误规模与可分阶段边界
- [x] 使用 CodeGraph 识别低风险的大组件拆分点
- [x] 记录发现与实施边界
- **状态：** complete

### 阶段 2：覆盖率门禁
- [x] 配置稳定的覆盖率采集范围
- [x] 根据当前真实基线设置非虚高阈值
- [x] 将覆盖率校验接入质量脚本和 CI
- **状态：** complete

### 阶段 3：发包后消费验证
- [x] 构建并打包关键 workspace 包
- [x] 在临时消费项目验证 exports、类型与运行时入口
- [x] 将校验脚本接入质量门禁
- **状态：** complete

### 阶段 4：大组件模块化首批治理
- [x] 优先选择有测试保护且责任边界清晰的组件
- [x] 抽离类型、常量、纯函数、hooks 或样式
- [x] 保持 Props、Events、Slots 与 Expose 契约不变
- [x] 增补回归测试和 changelog
- **状态：** complete

### 阶段 5：严格类型分阶段迁移
- [x] 量化全仓 strictNullChecks 错误边界
- [x] 修复全部空值错误并直接启用全仓严格空值检查
- [x] 保持现有 `type-check` 门禁覆盖全部 packages 与 docs
- **状态：** complete

### 阶段 6：全量验证与交付
- [x] 同步文档、LLM 产物与 changelog
- [x] 运行统一质量门禁和发版 dry-run
- [x] 检查 diff，区分本轮与用户既有改动
- **状态：** complete

## 关键问题
1. 当前测试的真实覆盖率是多少，哪些目录应先纳入门禁？
2. 哪些包是必须验证的外部消费入口？
3. 大组件中哪些拆分能在不改 API 的情况下最快降低风险？
4. 严格类型首批能否从 hooks、utils、theme 边界开始？

## 已做决策
| 决策 | 理由 |
|------|------|
| 使用分阶段严格类型配置，不直接全库打开 `strict` | 避免一次性改动公共类型和大量无关组件 |
| 打包验证必须使用临时目录 | 不污染工作区，同时验证真实 tarball 内容 |
| 严格类型改为直接全库启用 `strictNullChecks` | 实测只有 6 个错误，比维护独立过渡配置更简洁 |
| 大组件首批治理 `YFileImport` | 视图、流程状态和样式边界清晰，适合提取 hook 并补公开行为测试 |

## 遇到的错误
| 错误 | 尝试次数 | 解决方案 |
|------|---------|---------|
| `ERR_PNPM_REGISTRIES_MISMATCH` | 2 | 默认源对齐后仍因新增 scope 源失败；改查本地 store 与隔离 config-dir，不再重复相同安装命令 |
| `pnpm config list` 意外输出认证配置 | 1 | 不复述、不使用输出的凭据，后续禁止输出完整 pnpm/npm config，建议用户轮换相关 token |
| pnpm 8.10.0 不支持 `--config-dir` | 1 | 不再尝试隐式参数，按 pnpm 建议用当前 `.npmrc` 执行普通 `pnpm install` 对齐模块元数据 |
| `pnpm install` 需要交互确认但非 TTY stdin 已关闭 | 1 | 安装未执行；改用 `CI=1 pnpm install --force --no-frozen-lockfile` 显式非交互重建 |
| 包探测命令因自动 `rm` 清理被安全策略拒绝 | 1 | 命令未执行；改为 Node 脚本使用 `mkdtemp`，校验精确临时路径后在 `finally` 中清理 |
| 真实 tarball 缺少 `exports["./sheet"].types` 声明的 `dist/sheet.d.ts` | 1 | 确认构建真实产物为 `dist/sheet/docs-exports.d.ts`，修正 package exports 并重跑消费验证 |
| 手工解包的消费夹具未安装 `./sheet` 所需 optionalDependencies | 1 | 仅将工作区已安装的第三方依赖链接到夹具；4 个 YSS 包仍必须来自 tarball |
| 组件包 ESM 产物保留无扩展名 `dayjs/locale/zh-cn` | 1 | 将 YMonthCalendar、文档入口与 Demo 统一改为 `dayjs/locale/zh-cn.js`，同时兼容 Node ESM 与 bundler |
| locale 修复后还存在 7 个无扩展名 Day.js plugin 子路径 | 1 | 一次性扫描并将 advancedFormat/customParseFormat/localeData/quarterOfYear/weekOfYear/weekYear/weekday 全部改为 `.js` |
| Node 原生 ESM 执行 `./sheet` 时无法加载 Univer CSS | 1 | 这是浏览器组件的正常边界；主包/lite 保留 Node ESM+CJS，sheet 改用真实 Vite 消费构建并继续做类型检查 |
| Node 原生 ESM 执行组件主入口时无法加载 Monaco CSS | 1 | 确认 components 整体为浏览器 UI 包；Node 仅检查其 ESM/CJS 解析目标，真实执行改为 Vite 消费构建 |
| 临时消费者目录无法通过根目录 `pnpm exec` 解析 Vite CLI | 1 | 由脚本显式调用 components 工作区已安装的 Vite Node 入口，避免依赖命令查找上下文 |
| 消费夹具用不完整对象模拟 `IWorkbookData` 导致类型校验失败 | 1 | 按 `YSheetProps` 真实契约使用合法的 `null` 模型值，继续验证公开类型导入 |
| 单个补丁不能同时删除并重建 `YFileImport/index.vue` | 1 | 补丁未落盘；拆为添加依赖文件、删除旧文件、添加新文件三个受控步骤 |
| YFileImport 测试按替身构造器未找到 Upload.Dragger | 1 | 改按组件真实名称 `AUploadDragger` 查找，保持事件夹具不依赖替身实例身份 |

## 备注
- 工作区存在用户正在进行的 GitHub/公开 npm 迁移改动，不回滚、不覆盖。
- 每个阶段完成后同步更新 progress.md 和 findings.md。
- 发版 dry-run 基于历史提交差异检测，当前未提交工作区返回“无待发包”；实际 package、changelog、构建与 tarball 消费校验均已单独通过。
