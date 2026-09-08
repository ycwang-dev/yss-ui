---
title: AI 工具集成（LLMs.txt）
description: 通过 llms.txt / llms-full.txt 把 YSS UI 全量文档喂给 AI 编程工具
toc: content
---

# LLMs.txt 全量文档

通过 <a href="https://llmstxt.org/" target="_blank">LLMs.txt</a> 标准把 YSS UI 全量文档一次性喂给 AI 工具。**这是三种集成方式中的兜底方案**：配置最简单、兼容面最广，任何能读 URL 的 AI 工具都能用。

## 三种集成方式怎么选

| 方式 | 一句话定位 | 何时使用 |
| --- | --- | --- |
| [Skills 技能同步](/guide/ai-skills) | 把开发规范装进项目，AI 生成代码时按需触发标准骨架与硬约束 | 必装，所有 AI 辅助开发的业务项目 |
| [MCP Server 查询](/guide/mcp) | AI 编码时按需精准查询组件 API、Demo 源码 | 推荐搭配，工具支持 MCP 时启用 |
| **LLMs.txt 全量文档**（本页） | 把全量文档一次性喂给 AI | 兜底，工具不支持 MCP / 临时会话 |

工具支持 MCP 时优先用 [MCP](/guide/mcp)（按需查询更准、不稀释上下文）；LLMs.txt 适合不支持 MCP 的工具、无法安装依赖的环境，以及"临时问一个问题"的轻量场景。

## 可用资源

| 文件 | 大小 | 内容 | 适用 |
| --- | --- | --- | --- |
| <a href="/llms-full.txt" target="_blank">llms-full.txt</a> ⭐ | ~70KB | 全部组件 API、示例与代码生成规范 | 默认选择，现代 AI 工具均可承载 |
| <a href="/llms.txt" target="_blank">llms.txt</a> | ~2KB | 仅组件清单与文档链接 | 上下文受限的旧工具、快速组件发现 |

> **建议**：优先使用 `llms-full.txt`，只有在遇到上下文限制时才降级使用 `llms.txt`。

## 在 AI 工具中的使用

### Cursor

在 Cursor 聊天窗口用 `@Docs` 引入文档站：

```
@Docs https://yss-ui.github.io
```

Cursor 会自动加载 llms.txt。之后可直接询问"如何使用 YTable 组件实现远程分页？"等问题。

<a href="https://docs.cursor.com/context/@-symbols/@-docs" target="_blank">详细了解 Cursor 中的 @Docs 功能</a>

---

### Windsurf

**临时引用**：

```
@ https://yss-ui.github.io/llms-full.txt
```

**持久化配置**：在项目根目录创建 `.windsurf/rules` 文件：

```markdown
# YSS UI Documentation

Always reference the YSS UI documentation when working with components:
- https://yss-ui.github.io/llms-full.txt
```

<a href="https://docs.windsurf.com/windsurf/cascade/memories" target="_blank">详细了解 Windsurf Memories 功能</a>

---

### Claude Code

打开 Claude Code 设置，在 "Docs / Context Files" 配置中添加：

```
https://yss-ui.github.io/llms-full.txt
```

<a href="https://code.claude.com/docs" target="_blank">详细了解 Claude Code 文档上下文配置</a>

---

### Gemini CLI

**命令行参数**：

```bash
gemini --context https://yss-ui.github.io/llms-full.txt "如何使用 YTable 组件？"
```

**配置文件**：在项目根目录创建 `.gemini/config.json`：

```json
{
  "context": ["https://yss-ui.github.io/llms-full.txt"]
}
```

<a href="https://ai.google.dev/gemini-api/docs" target="_blank">详细了解 Gemini CLI 上下文配置</a>

---

### Antigravity

**方式 1：全局规则配置（推荐）** 🚀 —— 配置 `~/.gemini/GEMINI.md`，从根本上教会 AI"文档优先"：

```markdown
## 核心原则：文档优先
在回答关于 YSS UI 问题时，必须优先读取以下文档：
https://yss-ui.github.io/llms-full.txt
```

**方式 2：项目 README 配置** —— 在项目 `README.md` 中添加文档链接，Antigravity 读取项目概况时会自动发现：

```markdown
## 相关文档
- YSS UI: https://yss-ui.github.io/llms-full.txt
```

**方式 3：对话直接引用**：

```
参考文档 https://yss-ui.github.io/llms-full.txt，帮我写一个表格。
```

> **提示**：Antigravity 同时支持 [MCP 接入](/guide/mcp)，长期使用建议优先配置 MCP。

---

### Trae

打开 Trae 项目设置，在 "Knowledge Sources" 中添加并启用：

```
https://yss-ui.github.io/llms-full.txt
```

<a href="https://trae.ai/docs" target="_blank">详细了解 Trae 的知识源功能</a>

---

### Qoder

**配置文件**：在项目根目录创建 `.qoder/config.yml`：

```yaml
knowledge:
  external_docs:
    - url: https://yss-ui.github.io/llms-full.txt
      name: YSS UI Documentation
```

**临时引用**：

```
@docs https://yss-ui.github.io/llms-full.txt
```

<a href="https://docs.qoder.com/" target="_blank">详细了解 Qoder 配置方法</a>

---

### 其他 AI 工具

任何支持 LLMs.txt 的 AI 工具均可使用以上路径来更好地理解 YSS UI。

## 如何验证文档已加载

询问 AI 一些只有读过文档才能答对的问题：

```
Q: YTable 组件的 pagination 属性支持哪些配置项？
Q: YFormily 的 mode 属性有哪些可选值？各代表什么含义？
Q: 如何使用 YTree 组件的搜索功能？
```

如果 AI 能准确回答并给出符合实际 API 的代码示例，说明文档已成功加载。需要更强的验证手段（工具调用卡片、版本号比对），见 [MCP 的三层验证方法](/guide/mcp#如何验证-mcp-调用成功)。

## 自动更新

LLMs.txt 文件在每次 CI/CD 构建时自动生成，始终与文档站同步。手动重新生成：

```bash
pnpm run generate:llms
```

## 常见问题

### Q: llms.txt 和 llms-full.txt 有什么区别？应该用哪个？

**A:** `llms-full.txt`（~70KB）包含完整 API 文档与示例，现代 AI 工具（Claude、GPT-4、Gemini 等）完全可承载，优先使用；`llms.txt`（~2KB）仅含组件清单与链接，留给上下文受限的场景。

### Q: 文档更新后 AI 工具没有获取到最新内容？

**A:** 某些 AI 工具会缓存文档内容。尝试：重新加载文档引用、清除工具缓存、开新会话。如果对时效性要求高，改用 [MCP 接入](/guide/mcp)——索引随包版本发布，不受工具缓存影响。

## 反馈与建议

如果你在使用 AI 工具集成时遇到问题，或有改进建议，欢迎提交 Issue 到项目仓库或联系技术支持团队。
