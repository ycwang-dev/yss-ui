---
title: useUrlState
description: 管理当前路由 query 的读写与清理
toc: content
---

# useUrlState

`useUrlState` 用于管理当前路由的 URL query 参数，提供读取、合并更新、按 key 清理、全部清空能力。

默认使用 `history` 策略无感更新 URL，不触发路由导航重建。
在无 `vue-router` 注入的文档/轻量容器环境下，`history` 策略也可独立运行。

## 代码演示

### 基础用法

<code src="./demos/useUrlState/demo1-basic.vue"></code>

## API

```typescript
const { state, setState, clearKeys, clearState } = useUrlState(options?);
```

### Params

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| options.mode | 默认导航模式 | `'push' \| 'replace'` | `'replace'` |
| options.strategy | 默认更新策略 | `'history' \| 'router'` | `'history'` |

### Return

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| state | 当前 query 的扁平字符串视图 | `ComputedRef<Record<string, string>>` |
| setState | 合并写入 query；`undefined / null / ''` 会删除 key | `(patch, options?: { mode?: 'push' \| 'replace'; strategy?: 'history' \| 'router' }) => Promise<void>` |
| clearKeys | 按 key 删除 query 参数 | `(keys, options?: { mode?: 'push' \| 'replace'; strategy?: 'history' \| 'router' }) => Promise<void>` |
| clearState | 清空当前路由全部 query | `(options?: { mode?: 'push' \| 'replace'; strategy?: 'history' \| 'router' }) => Promise<void>` |

### 类型定义

```typescript
type UrlNavigationMode = 'push' | 'replace';
type UrlUpdateStrategy = 'history' | 'router';

type UrlStatePatch = Record<string, string | number | boolean | null | undefined>;

interface UseUrlStateOptions {
  mode?: UrlNavigationMode;
  strategy?: UrlUpdateStrategy;
}

interface UrlStateActionOptions {
  mode?: UrlNavigationMode;
  strategy?: UrlUpdateStrategy;
}
```

## 使用建议

1. 列表页“重置查询”场景，优先用 `clearState({ mode: 'replace' })`，默认即可无感清空 query。
2. 只想清理部分参数时，用 `clearKeys(['a', 'b'])`，避免误删无关 query。
3. 页面希望保留历史回退时，将 `mode` 改为 `push`。
4. 如果你需要触发 vue-router 的导航语义（如依赖路由守卫），传 `strategy: 'router'`。
