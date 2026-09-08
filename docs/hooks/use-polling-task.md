---
title: usePollingTask
description: 管理静默轮询生命周期的 Hook
toc: content
---

# usePollingTask

`usePollingTask` 是一个通用轮询调度 Hook，只负责轮询生命周期，不接管业务数据、页面 loading 或请求状态展示。

它适合这类场景：

- 页面需要“开始轮询 / 停止轮询 / 切换轮询时间”
- 轮询时不希望展示页面级 loading
- 一轮轮询可能包含多个接口或多块 UI 数据
- 手动查询和静默轮询需要并存
- 需要标签页隐藏暂停、恢复后继续
- 需要 generation 失效保护，避免旧结果覆盖新结果

它不适合替代请求状态 Hook。像 `vue-hooks-plus/useRequest` 这种更适合管理单请求的 `loading / data / error`，而 `usePollingTask` 只做调度。

## 核心思路

### 1. 本轮结束后再调度下一轮

Hook 使用“当前任务完成后，再 `setTimeout` 下一轮”的方式调度，而不是 `setInterval`。

这样可以避免：

- 请求耗时大于轮询间隔时出现并发堆积
- 多轮请求重叠导致结果覆盖顺序混乱

### 2. generation 失效保护

每次 `start / stop / restart` 都会推进 `generation`。  
任务执行时会收到一个 `isCurrent()` 方法，业务层在真正写入结果前应先判断一次：

```ts
if (!isCurrent()) return;
```

这样旧轮询链的结果即使晚到，也不会再覆盖最新结果。

### 3. 标签页隐藏暂停 / 恢复

当 `pauseWhenHidden = true` 时：

- 页面隐藏：停止后续轮询调度
- 页面重新可见：按 `resumeMode` 决定立即恢复还是等下一个间隔恢复

默认 `resumeMode = 'immediate'`，回到页面后会立即补跑一轮。

### 4. AbortSignal 透传

每一轮任务都会收到 `signal?: AbortSignal`。

- 如果你的请求库支持 `signal`，可以真正中止请求
- 如果请求库不支持，也至少可以配合 `isCurrent()` 丢弃旧结果

> [!TIP]
> `usePollingTask` 只负责把 `AbortSignal` 传给业务层，是否真的取消网络请求取决于你使用的请求库是否支持。

## 代码演示

### 基础启停

展示 `start / stop / restart / runNow` 以及 `isActive / isRunning / generation / currentInterval`。

<code src="./demos/usePollingTask/demo1-basic.vue"></code>

### 动态切换轮询间隔

展示轮询进行中切换 `1s / 2s / 5s / 0s` 的效果，验证“切到 0 自动停止”。

<code src="./demos/usePollingTask/demo2-interval.vue"></code>

### 错误继续 / 错误停止

模拟轮询过程中随机失败，对比 `continueOnError: true` 和 `false` 两种行为。

<code src="./demos/usePollingTask/demo3-error-control.vue"></code>

### 标签页暂停与失效保护

模拟慢请求、手动重启和 `AbortSignal` 配合，展示 `isCurrent()` 防止旧结果回写。

<code src="./demos/usePollingTask/demo4-visibility-and-stale.vue"></code>

## API

```typescript
const {
  isActive,
  isRunning,
  currentInterval,
  generation,
  start,
  stop,
  restart,
  runNow,
  setInterval,
} = usePollingTask(task, options?);
```

### Params

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| task | 每一轮轮询执行的任务函数 | `(context: PollingContext) => Promise<void> \| void` | - |
| options | 轮询配置项 | `UsePollingTaskOptions` | - |

### PollingContext

每一轮执行时，`task` 会收到如下上下文：

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| generation | 当前轮询链版本号 | `number` |
| signal | 当前轮询任务的 `AbortSignal` | `AbortSignal \| undefined` |
| isCurrent | 判断本轮结果是否仍然有效 | `() => boolean` |

### UsePollingTaskOptions

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| interval | 轮询间隔，单位毫秒。支持 `number` 或 `Ref<number>` | `number \| Ref<number>` | `0` |
| autoStart | 组件挂载后是否自动启动轮询 | `boolean` | `false` |
| immediate | `start()` 时是否立即执行第一轮，而不是等待一个间隔 | `boolean` | `false` |
| pauseWhenHidden | 标签页隐藏时是否暂停后续轮询 | `boolean` | `true` |
| continueOnError | 当前轮询任务抛错后是否继续后续轮询 | `boolean` | `true` |
| resumeMode | 页面重新可见后恢复轮询的方式 | `'immediate' \| 'next-interval'` | `'immediate'` |
| concurrent | 是否允许并发轮询任务。当前仅支持 `false` | `false` | `false` |
| onError | 轮询任务抛错时的回调 | `(error: unknown) => void` | - |

### PollingStartOptions

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| immediate | 覆盖全局 `immediate` 配置，决定这次启动是否立即执行 | `boolean` | 继承 `UsePollingTaskOptions.immediate` |

### UsePollingTaskReturn

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| isActive | 当前轮询链是否处于激活状态 | `Ref<boolean>` |
| isRunning | 当前是否正在执行某一轮任务 | `Ref<boolean>` |
| currentInterval | 当前生效的轮询间隔（毫秒） | `Ref<number>` |
| generation | 当前轮询链版本号 | `Ref<number>` |
| start | 启动轮询 | `(options?: PollingStartOptions) => Promise<void>` |
| stop | 停止轮询 | `() => void` |
| restart | 停止后重新启动轮询 | `(options?: PollingStartOptions) => Promise<void>` |
| runNow | 立即执行一轮任务；未启动时会先启动 | `() => Promise<void>` |
| setInterval | 动态修改轮询间隔。传 `0` 会停止轮询 | `(ms: number) => void` |

## 推荐接入模式

对于真实业务页面，建议把“真实刷新函数”和“UI 触发函数”分开：

```ts
const refreshSilently = async ({ isCurrent, signal }: PollingContext) => {
  const res = await fetchList({ signal });
  if (!isCurrent()) return;
  data.value = res;
};

const { start, stop, restart } = usePollingTask(refreshSilently, {
  interval: pollingInterval,
  pauseWhenHidden: true,
});

const handleSearch = async () => {
  stop();
  await fetchListWithLoading();
  await restart({ immediate: false });
};
```

这种分层方式有几个好处：

- 轮询逻辑和页面 loading 解耦
- 手动查询可以保留原本的 loading 语义
- 静默轮询不会误触发页面级 loading
- 展开行、卡片、列表等多块数据可以自由组合

## 注意事项

1. **`isRunning` 不等于页面 loading**  
   它只表示当前轮询任务正在执行，不表示页面一定要展示 loading。静默轮询场景下，通常不应该直接绑定到页面主 loading。

2. **`start()` / `restart()` / `runNow()` 的区别**  
   - `start()`：启动新轮询链  
   - `restart()`：先停止旧轮询链，再启动新链  
   - `runNow()`：立即执行一轮；如果尚未启动，则会先启动

3. **`setInterval(0)` 与 `stop()`**  
   - `setInterval(0)`：把轮询间隔设为 0，并停止轮询  
   - `stop()`：停止当前轮询，但不改 `currentInterval`

4. **`continueOnError = false` 会停止轮询**  
   如果轮询任务抛错，并且配置为 `false`，Hook 会终止当前轮询链。

5. **`pauseWhenHidden` 只影响后续调度**  
   标签页隐藏时会暂停后续轮询；已经开始的一轮，如果调用方不处理 `signal`，仍可能继续执行到结束。

6. **真正取消请求取决于调用方**  
   `signal` 已经提供，但只有当你的请求库支持 `AbortSignal` 时，才能真正中止网络请求。否则仍需用 `isCurrent()` 做结果失效保护。

## 适用与不适用

### 适用

- 页面级静默轮询
- 多接口组合轮询
- 手动查询与轮询并存
- 需要标签页隐藏暂停
- 需要避免旧结果回写

### 不适用

- 只想管理单个请求的 `loading / data / error`
- 需要缓存、重试、去抖、节流等完整请求能力
- 想把轮询直接绑定成“请求状态 Hook”

这类场景更适合用 `vue-hooks-plus/useRequest` 或其他请求管理方案。

## 类型定义

```typescript
export type PollingResumeMode = 'immediate' | 'next-interval';

export interface UsePollingTaskOptions {
  interval?: number | Ref<number>;
  autoStart?: boolean;
  immediate?: boolean;
  pauseWhenHidden?: boolean;
  continueOnError?: boolean;
  resumeMode?: PollingResumeMode;
  concurrent?: false;
  onError?: (error: unknown) => void;
}

export interface PollingContext {
  generation: number;
  signal?: AbortSignal;
  isCurrent: () => boolean;
}

export interface PollingStartOptions {
  immediate?: boolean;
}

export interface UsePollingTaskReturn {
  isActive: Ref<boolean>;
  isRunning: Ref<boolean>;
  currentInterval: Ref<number>;
  generation: Ref<number>;
  start: (options?: PollingStartOptions) => Promise<void>;
  stop: () => void;
  restart: (options?: PollingStartOptions) => Promise<void>;
  runNow: () => Promise<void>;
  setInterval: (ms: number) => void;
}
```
