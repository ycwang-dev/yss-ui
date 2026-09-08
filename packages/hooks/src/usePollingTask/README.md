# usePollingTask

通用轮询调度 Hook，只负责启停、间隔、可见性暂停、结果失效和 `AbortSignal` 透传，不接管业务数据和页面 `loading`。

## 典型用法

```ts
import { ref, computed } from 'vue';
import { usePollingTask } from '@yss-ui/hooks';

const pollingSeconds = ref(2);

const { start, stop, restart, isActive, isRunning } = usePollingTask(
  async ({ signal, isCurrent }) => {
    const response = await fetch('/api/list', { signal });
    const data = await response.json();

    if (!isCurrent()) return;
    console.log(data);
  },
  {
    interval: computed(() => pollingSeconds.value * 1000),
    pauseWhenHidden: true,
  }
);
```

## 适用边界

- 适合页面级静默轮询、多接口组合轮询、手动查询与轮询并存的场景
- 不适合作为请求状态管理 Hook 的替代品
- 与 `vue-hooks-plus/useRequest` 的区别是：`usePollingTask` 只做调度，不管理请求 `loading/data/error`

## 文档入口

- 站点文档：`docs/hooks/use-polling-task.md`
