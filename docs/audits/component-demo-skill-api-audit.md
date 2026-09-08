---
title: 组件 Demo、Skills 与 API 文档全量审计
toc: content
---

# YSS UI 组件 Demo、Skills 与 API 文档全量审计

审计日期：2026-08-10  
审计基线：`dev` 分支当前工作区（保留审计开始前已有的 7 个未提交文件）  
真相源：`packages/components/src` 公开入口、Vue SFC 与 TypeScript 类型声明

## 结论

- 16 个公开组件实现、17 个公开组件名称（含 `YssFormily` 兼容别名）均已建立源码契约和文档映射。
- 当前 199 个 Demo 源文件（142 Vue、32 TypeScript、25 Less）均可从组件 Markdown 入口递归到达；4 个无引用旧文件已删除。
- 29 个 Skills 已通过真实具名导出和组件自有 Props、Events、Slots、Expose 校验，`docs/skills` 继续由 `packages/skills` 单向生成。
- 公开组件文档均具备 Props、Events、Slots、Expose、Types 章节；没有对应能力时明确标注“无公开能力”。
- `llms.txt` 已包含 Skills 索引，`llms-full.txt` 已包含 29 个 Skill 的完整源码，并可确定性校验新鲜度。
- 类型检查、76 个单元测试、Skills/文档校验、Dumi 生产构建、15 个组件路由和 5 个关键交互冒烟均通过。
- 唯一外部阻塞是线上 `https://yss-ui.github.io/llms-full.txt` 持续返回空响应，无法完成线上/本地产物内容比较。

## 公开组件契约

| 公开名称 | 文档 | 身份与边界 | 状态 |
| --- | --- | --- | --- |
| `AuthorityDropdown` | Button | 公开组件；全量安装另注册非具名别名 `YDropdown` | 已补完整 API |
| `YButton` | Button | Ant Design Vue Button 包装层，未知属性通过 `$attrs` 透传 | 已补完整 API |
| `YCard` | Card | Ant Design Vue Card 包装层，未知属性通过 `$attrs` 透传 | 已补完整 API |
| `YConditionBuilder` | ConditionBuilder | YSS 自有条件树契约 | 已补 Props/Events/Slots/Expose/Types |
| `YCron` | Cron | YSS 自有 Cron 状态与表达式契约 | 已补无 Slots/Expose 说明 |
| `YEcharts` | Echarts | ECharts 6 包装层；仅约定 options/init/setOption 透传边界 | 已补 API 与类型导出 |
| `YEditTable` | EditTable | VXE Table 编辑包装层；`tableConfig`/`$attrs` 为透传边界 | 已补完整 API |
| `YFileImport` | FileImport | Ant Design Vue Modal/Upload 包装层；只通过专用配置透传 | 已补 API 与类型导出 |
| `YFormily` | Formily | 标准推荐名称 | 已补完整 API |
| `YssFormily` | Formily | 历史兼容具名别名 | 已从新 Demo/Skills 主路径移除 |
| `YMonaco` | Monaco | Monaco Editor 0.54 包装层 | 已补完整 API 与类型导出 |
| `YMonacoDiff` | Monaco | 继承 `YMonacoProps`（排除 `modelValue`）的联合文档组件 | 已补继承契约、Slots 与类型导出 |
| `YMonthCalendar` | MonthCalendar | YSS 自有月日历契约 | 原文档已完整，校验通过 |
| `YSheet` | Sheet | Univer 扩展点通过 config/presets/plugins/locales 明确传入 | 已补 Slots/Expose/Types 边界 |
| `YSplitPane` | SplitPane | YSS 自有分割面板契约 | 已补无 Expose 与类型说明 |
| `YTable` | Table | VXE Table 4.19.10 包装层，未知属性通过 `$attrs` 透传 | 已补完整 YSS 契约和上游边界 |
| `YTree` | Tree | Ant Design Vue Tree 包装层，未知属性/事件通过 `$attrs` 透传 | 已补受控状态、Slots、Types 与无 Expose 说明 |

### 别名约定

- 新代码统一使用 `YFormily`；`YssFormily` 保留为具名兼容别名，不删除、不改运行时。
- `YDropdown` 仅在组件库全量安装时注册为全局别名，不是 `@yss-ui/components` 具名导出。
- `index.ts`、`docs-entry.ts` 与 `lite.ts` 已统一推荐名称和兼容注释。

## 问题与修复状态

| 级别 | 问题证据 | 处理结果 |
| --- | --- | --- |
| 阻断错误 | 线上 `llms-full.txt` 三次请求均为 `Empty reply from server` | 暂缓；记录为发布服务阻塞，不以线上旧文件覆盖源码结论 |
| 错误 API | YTable 文档曾列出 `toolbarTools`，但组件未声明该 Prop | 已从文档移除并加入回归校验；源码仍读取未声明字段，因本轮不改运行时而暂缓 |
| 错误 API | 3 个 Formily Demo 仍传入已删除的 `detail-as` | 已移除；明确 `mode=2` 自动进入 Descriptions |
| 错误 API | 元数据工具未展开 `YMonacoDiffProps extends Omit<...>`，会漏掉 `language`、`height` 等继承 Props | AST 回退已支持接口继承与 `Omit/Pick`，Demo 校验通过 |
| 过时推荐 | 分步表单主 Demo 使用旧 `@formily/antdv FormStep` 路径 | 已迁移为 Ant Design Vue Steps + 多 YFormily 独立校验与数据聚合 |
| 过时推荐 | 入口注释和示例一度把 `YssFormily` 当推荐名 | 已按组件统一 Y 前缀约定改回 `YFormily`，只在兼容说明中保留旧名 |
| 文档缺失 | AuthorityDropdown、ConditionBuilder Expose、YTree 受控状态、YTable 自有 Props 等未完整体现 | 已按源码契约补齐，并强制每页五类 API 章节 |
| 类型缺失 | 文档公开的 AuthorityDropdown、YFileImport、YEcharts、Monaco 类型无法从总入口导入 | 已补 type-only 导出与编译型入口测试；无运行时影响 |
| 无效 Demo | `metrics-cards.vue` 无引用且向 YCard 传入不存在的栅格 Props | 已删除 |
| 重复 Demo | Formily `actions.vue` 已被现有表单/操作区 Demo 覆盖且无引用 | 已删除 |
| 重复 Demo | ConditionBuilder validation-custom 下两份 helper 实际改用 validation 目录同名实现 | 已删除重复 helper |
| 文档运行错误 | Contributors 头像固定请求不可达内网地址，Playwright 出现资源错误 | 已改用仓库本地品牌图，生产预览不再产生该请求错误 |
| 生成链路缺失 | `llms-full.txt` 不含 Skills，且构建前无新鲜度检查 | 已纳入 Skills 索引/全文，构建前同步、生成并校验 |

## Skills 审计

- 唯一源目录：`packages/skills`，共 29 个 Skill；`docs/skills` 不直接维护。
- 已检查全部 Skill 的 `@yss-ui/components` 具名导入，当前不存在未导出符号。
- 已用 Vue 模板 AST 检查代码示例中的自有 Props、Events、Slots 与模板 ref 方法。
- 已固化以下禁止模式：
  - YTable `request`、`search-params`。
  - `actionConfig.actions`（应使用 `buttons`）。
  - 推荐代码直接导入 `@formily/antdv FormStep`。
  - 推荐代码继续使用 YTable `scroll-x`、`scroll-y`。
- 审计前工作区中已有的 Page List、Business Page Generation、YTable Usage 修正全部保留，并以当前内容通过校验。

## Demo 审计

- Markdown `<code src>` 均指向存在文件。
- 依赖图会从每个 Markdown Demo 入口递归解析 Vue/TS/JS/CSS/Less/Scss 相对依赖；当前无不可达源文件。
- 推荐 Demo 不再出现 `detail-as`、FormStep 主路径、YTable 虚构请求 Props 或 `actionConfig.actions`。
- Formily 分步 Demo 已拆分为 `steps.vue`、`steps.constant.ts`、`steps.less`，避免把 schema、状态、样式继续堆在单一组件中。

## 校验链路

新增 `pnpm validate:docs`，覆盖：

1. 公开安装组件、具名导出和文档映射一致性。
2. Props、Events、Slots、Expose 的源码到文档覆盖。
3. 每个公开组件页的 Props、Events、Slots、Expose、Types 章节。
4. Demo/Skill 的组件包具名导入与自有 API 真实性。
5. 禁用/废弃推荐模式与已知无效文档 API。
6. Demo 引用存在性和递归依赖可达性。
7. `llms.txt`、`llms-full.txt` 与当前文档/Skills 的确定性一致性。

构建前顺序为：同步 Skills 文档 → 生成 LLM 文档 → `validate:skills` → `validate:docs`。

### 自动验收结果

| 命令 | 结果 |
| --- | --- |
| `pnpm type-check` | 通过 |
| `pnpm test -- --run` | 11 个测试文件、76 个测试全部通过 |
| `pnpm validate:skills` | 29 个 Skill 结构与 API 引用通过 |
| `pnpm validate:docs` | 16 个公开组件实现契约通过 |
| `pnpm build` | Webpack 编译成功，生成 index 后正常退出并返回 0 |

契约抽取对 `YConditionBuilder`、`YEditTable`、`YTable` 固定使用 TypeScript AST 回退，因为它们的递归/VXE 类型会使 `@dumijs/vue-meta` 栈溢出；这是受控警告，不影响校验结果。

### 浏览器验收结果

- Playwright 遍历 `/components` 与 14 个组件正文路由，全部返回 200、渲染正文且无本地资源失败、console error 或 page error。
- Card Demo 使用 Dumi 视口懒加载；滚动首个 Demo 后 7 个预览容器正常挂载。
- 关键交互通过：
  - YTable：远程分页从第 1 页切换到下一页。
  - YEditTable：新增空行并出现必填 Tooltip 校验。
  - YFormily：当前步校验、跨步保留、确认页聚合和最终提交。
  - YTree：关键字搜索后只保留匹配节点。
  - YSplitPane：上侧面板折叠与恢复。

## 未公开目录

| 目录 | 现状 | 结论 |
| --- | --- | --- |
| `packages/components/src/form` | 含旧 `index.vue` 与 `types.ts`，未从组件入口导出，也无当前文档/Skill 引用 | 内部孤儿候选；本轮不擅自导出或建公开文档 |
| `packages/components/src/trade-calendar-board` | 空目录，未导出、未引用 | 内部残留目录；本轮不改变公共面 |

## 遗留项与改进项

1. 修复线上 LLM 文档服务的空响应后，再比较线上内容与本地确定性产物。
2. 若未来允许调整运行时，可决定为 YTable 正式声明 `toolbarTools`，或删除源码中对未声明字段的读取；在此之前它不是公共 API。
3. Dumi 生产包仍提示主 chunk 偏大，Formily/Table/Monaco 首次加载明显；可另立性能任务做 Demo 按需挂载与代码分包。
4. Browserslist 数据提示已过期，可在独立依赖维护任务中升级，避免与本次文档契约改动混合。
