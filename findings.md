# 发现与决策

## 需求
- 继续执行前一阶段遗留建议：覆盖率阈值、发包消费验证、大组件拆分、严格类型迁移。
- 需要保留现有公共 API，不影响用户正在进行的其他工作区改动。

## 研究发现
- 当前 Vitest 共 16 个测试文件、92 个测试，未安装 `@vitest/coverage-v8` 或 `@vitest/coverage-istanbul`。
- 根 `tsconfig.json` 已启用 `strict: true`，仅显式关闭 `strictNullChecks`。临时打开后全库只有 6 个错误：`usePagination.ts` 3 个、`useSafeData.ts` 1 个、`vite.config.umd.ts` 1 个、Formily 远程枚举 Demo 1 个。
- 严格空值错误规模很小，适合直接全库启用，不需要长期双 tsconfig 过渡。
- 可发布前端包为 `components`、`hooks`、`utils`、`theme`；其 `package.json` 均声明 `main/module/types/exports`，组件包额外公开 `./lite`、`./sheet` 和 CSS 入口。
- 大组件行数基线：YEditTable 888、YConditionBuilder 860、YTable 533、YCron 502、YTree 460、YSplitPane 410、YFileImport 402。
- `YFileImport` 的模板约 80 行、状态逻辑约 220 行、内联样式约 97 行，责任边界最清晰，适合作为首批完整拆分对象。
- 本地 pnpm virtual store 中没有缓存 `@vitest/coverage-v8` 或 `@vitest/coverage-istanbul`，需要通过隔离配置完成安装。
- 全量源码覆盖率基线（components/hooks/utils/theme）：Statements 31.76%、Branches 63.90%、Functions 49.68%、Lines 31.76%。
- 覆盖率首期门禁设为 Statements/Lines 30%、Branches 60%、Functions 45%，略低于真实基线，可防退化且不会因小幅的 V8 行号映射波动误阻断。
- 首次真实 tarball 验证发现 `@yss-ui/components/sheet` 将类型指向不存在的 `dist/sheet.d.ts`；实际 vite-plugin-dts 产物是 `dist/sheet/docs-exports.d.ts`。
- 手工解压 tgz 不会像 pnpm/npm 那样自动安装 optionalDependencies；运行时夹具需仅为第三方依赖提供链接，不能让 YSS 包回退到 workspace 源目录。
- 组件包 ESM 产物会保留 external Day.js 子路径 import；locale 和 7 个 plugin 无扩展名路径在 Node 原生 ESM 中均不可解析，需指向 Day.js 包内真实 `.js` 文件。
- `@yss-ui/components` 的入口会触达 Monaco/Univer CSS，整体是浏览器 UI 包，不适合用 Node 原生 ESM 直接执行；正确消费验证应使用 Vite 构建，Node 仅校验 exports 解析目标。
- `YFileImport` 可在不改变公开契约的情况下拆成 150 行主视图、189 行流程 hook、常量与独立样式；测试替身需按模板局部名 `UploadDragger` 注册，不能只依赖第三方组件运行时名称。
- 开启 `strictNullChecks` 后实际只需为 4 处实现补齐空值语义；全仓无需独立过渡 tsconfig，现有 `pnpm type-check` 即为持续门禁。

## 技术决策
| 决策 | 理由 |
|------|------|
| 覆盖率先固定稳定可测目录，再逐步扩大 | 全量 Vue 公共组件当前直接测试不均衡，一次性设高阈值会鼓励排除或伪测试 |
| 直接全库启用 `strictNullChecks` | 实测仅 6 个错误，修复成本可控，无需额外维护过渡配置 |
| 大组件首批选择 `YFileImport` | 其样式、流程状态和视图的拆分边界明确，公共 API 可保持不变 |
| 覆盖率阈值设为 30/60/45/30 | 基于全量源码真实基线保留少量映射波动空间，后续随测试增长逐版提升 |

## 遇到的问题
| 问题 | 解决方案 |
|------|---------|
| 现有 `node_modules` 来自内网 Registry，当前 `.npmrc` 已切换公开镜像，pnpm 拒绝直接添加依赖 | 保留用户 `.npmrc` 迁移改动，单次安装使用与现有模块目录一致的临时 Registry 参数 |
| 诊断命令意外输出本机 Registry 认证配置 | 停止输出完整 config，不在任何文件或后续输出中复述凭据，提醒用户轮换 token |
| `@yss-ui/components/sheet` 类型入口与构建产物不一致 | 修正 exports 指向真实 d.ts，并保留 tarball 契约校验防止回归 |
| 消费夹具第三方依赖缺失 | 链接已安装的外部依赖模拟包管理器，同时禁止链接 `@yss-ui/*` |
| Node ESM 无法解析 Day.js 子路径 | locale 与所有 plugin 导入统一使用显式 `.js` 路径 |
| Node ESM 不支持组件包的 Monaco/Univer CSS 导入 | 按包的运行环境分层：Node 执行 hooks/utils/theme 并检查 components 路径解析，Vite 执行全量浏览器构建，TypeScript 验证全部子路径 |

## 最终验证结论
- 覆盖率从 31.76/63.90/49.68/31.76 提升为 33.67/64.03/50.30/33.67，超过 30/60/45/30 门禁。
- 17 个 Vitest 文件共 95 项测试、16 项 Node 测试、4 个真实 tarball 消费、33 个 Skills、16 个公开组件文档与 Dumi 构建全部通过。
- 现存构建提示为 Vite CJS Node API 过渡提示、第三方 React `use client` 指令提示、7 个月未更新的 caniuse 数据及 2.71 MB 文档异步块体积提示，均未阻断构建。

## 资源
- 项目约束：`AGENTS.md`
- 组件开发规范：`.agents/skills/component-development/SKILL.md`

## 视觉/浏览器发现
- 本任务暂无视觉或浏览器检查。

---
*每执行2次查看/浏览器/搜索操作后更新此文件*
