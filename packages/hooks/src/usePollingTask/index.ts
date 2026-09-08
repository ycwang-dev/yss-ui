import { onMounted, onUnmounted, ref, unref, watch } from 'vue';
import type { PollingContext, PollingStartOptions, UsePollingTaskOptions, UsePollingTaskReturn } from './types';

export type {
  PollingContext,
  PollingResumeMode,
  PollingStartOptions,
  UsePollingTaskOptions,
  UsePollingTaskReturn,
} from './types';

const DEFAULT_INTERVAL = 0;

/**
 * 通用轮询调度 Hook
 *
 * @description 仅负责轮询生命周期管理，不接管业务数据与 UI loading。
 * 支持启停、动态间隔、标签页隐藏暂停、结果失效与 AbortSignal 透传。
 */
export function usePollingTask(
  task: (context: PollingContext) => Promise<void> | void,
  options: UsePollingTaskOptions = {}
): UsePollingTaskReturn {
  const {
    interval = DEFAULT_INTERVAL,
    autoStart = false,
    immediate = false,
    pauseWhenHidden = true,
    continueOnError = true,
    resumeMode = 'immediate',
    onError,
  } = options;

  const isActive = ref(false);
  const isRunning = ref(false);
  const currentInterval = ref(Math.max(0, Number(unref(interval) || 0)));
  const generation = ref(0);

  let timer: ReturnType<typeof setTimeout> | null = null;
  let abortController: AbortController | null = null;
  let resumeOnVisible = false;

  const isDocumentVisible = () => typeof document === 'undefined' || !document.hidden;

  const syncCurrentInterval = () => {
    const normalized = Math.max(0, Number(unref(interval) || 0));
    currentInterval.value = normalized;
    return normalized;
  };

  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const abortRunningTask = () => {
    abortController?.abort();
    abortController = null;
  };

  const nextGeneration = () => {
    generation.value += 1;
    return generation.value;
  };

  const shouldContinuePolling = (targetGeneration: number) => {
    return (
      isActive.value &&
      currentInterval.value > 0 &&
      targetGeneration === generation.value &&
      (!pauseWhenHidden || isDocumentVisible())
    );
  };

  const scheduleNext = (targetGeneration: number) => {
    clearTimer();
    if (!shouldContinuePolling(targetGeneration)) return;

    timer = setTimeout(() => {
      void execute(targetGeneration);
    }, currentInterval.value);
  };

  const stopInternal = (shouldResume = false) => {
    resumeOnVisible = shouldResume;
    clearTimer();
    abortRunningTask();
    isActive.value = false;
    isRunning.value = false;
    nextGeneration();
  };

  const execute = async (targetGeneration = generation.value) => {
    if (!shouldContinuePolling(targetGeneration)) {
      return;
    }
    if (isRunning.value) {
      return;
    }

    clearTimer();
    isRunning.value = true;
    abortRunningTask();
    abortController = typeof AbortController !== 'undefined' ? new AbortController() : null;

    const isCurrent = () => targetGeneration === generation.value;

    try {
      await task({
        generation: targetGeneration,
        signal: abortController?.signal,
        isCurrent,
      });
    } catch (error) {
      onError?.(error);
      if (!continueOnError && isCurrent()) {
        stopInternal(false);
        return;
      }
    } finally {
      const stillCurrent = isCurrent();
      abortController = null;
      if (!stillCurrent) {
        isRunning.value = false;
      } else {
        isRunning.value = false;
        scheduleNext(targetGeneration);
      }
    }
  };

  const start = async ({ immediate: shouldRunImmediately = immediate }: PollingStartOptions = {}) => {
    const latestInterval = syncCurrentInterval();
    if (latestInterval <= 0 || !isDocumentVisible()) {
      return;
    }
    if (isActive.value || isRunning.value) {
      return;
    }

    const targetGeneration = nextGeneration();
    resumeOnVisible = false;
    isActive.value = true;

    if (shouldRunImmediately) {
      await execute(targetGeneration);
      return;
    }

    scheduleNext(targetGeneration);
  };

  const stop = () => {
    stopInternal(false);
  };

  const restart = async (startOptions: PollingStartOptions = {}) => {
    stopInternal(false);
    await start(startOptions);
  };

  const runNow = async () => {
    if (!isActive.value && !isRunning.value) {
      await start({ immediate: true });
      return;
    }

    clearTimer();
    const latestInterval = syncCurrentInterval();
    if (latestInterval <= 0 || !isDocumentVisible()) {
      return;
    }

    isActive.value = true;
    await execute(generation.value);
  };

  const setInterval = (ms: number) => {
    const normalized = Math.max(0, Number(ms || 0));
    if (normalized === currentInterval.value) return;

    currentInterval.value = normalized;
    if (normalized <= 0) {
      stop();
      return;
    }

    if (isActive.value || isRunning.value) {
      void restart({ immediate: false });
    }
  };

  const handleVisibilityChange = () => {
    if (!pauseWhenHidden) return;

    if (!isDocumentVisible()) {
      stopInternal(isActive.value || isRunning.value);
      return;
    }

    if (!resumeOnVisible || currentInterval.value <= 0) {
      resumeOnVisible = false;
      return;
    }

    const shouldRunImmediately = resumeMode === 'immediate';
    resumeOnVisible = false;
    void start({ immediate: shouldRunImmediately });
  };

  watch(
    () => Number(unref(interval) || 0),
    newInterval => {
      setInterval(newInterval);
    },
    { flush: 'sync' }
  );

  onMounted(() => {
    if (pauseWhenHidden && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    if (autoStart && currentInterval.value > 0) {
      void start();
    }
  });

  onUnmounted(() => {
    if (pauseWhenHidden && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
    stopInternal(false);
  });

  return {
    isActive,
    isRunning,
    currentInterval,
    generation,
    start,
    stop,
    restart,
    runNow,
    setInterval,
  };
}
