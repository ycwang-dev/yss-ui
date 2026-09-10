---
title: Hooks 概览
description: 统一存放常用业务 Hooks 的 API 列表
toc: content
---

# Hooks 概览

YSS UI Hooks 库提供了一系列常用的 Vue 3 Composition API Hooks，帮助您更高效地开发应用。

## 频道导航

- DOM 场景：[`useFullscreen`](/hooks/use-fullscreen)、[`useTreeHeight`](/hooks/use-tree-height)、[`useTableHeight`](/hooks/use-table-height)
- 状态场景：[`useLoading`](/hooks/use-loading)、[`usePollingTask`](/hooks/use-polling-task)、[`useUrlState`](/hooks/use-url-state)

## 特性

- 🎯 **统一规范**：沉淀中后台高频布局与状态编排最佳实践，提供完备的 TypeScript 类型
- 🔧 **开箱即用**：提供类型完善、可组合的响应式接口
- 📦 **按需引入**：支持 Tree Shaking，只打包使用的 Hooks
- 🌟 **优先评估**：VueUse / Vue Hook Plus 能力，能用则不重复造轮子

## 安装

```bash
pnpm add @yss-ui/hooks
```

## 快速开始

```typescript
import { useFullscreen } from '@yss-ui/hooks';
```
