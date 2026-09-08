import type { Ref } from 'vue';

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
