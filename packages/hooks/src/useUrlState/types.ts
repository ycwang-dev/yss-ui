import type { ComputedRef } from 'vue';

export type UrlNavigationMode = 'push' | 'replace';
export type UrlUpdateStrategy = 'history' | 'router';

export type UrlStateValue = Record<string, string>;

export type UrlStatePatch = Record<string, string | number | boolean | null | undefined>;

export interface UrlStateActionOptions {
  mode?: UrlNavigationMode;
  strategy?: UrlUpdateStrategy;
}

export interface UseUrlStateOptions {
  mode?: UrlNavigationMode;
  strategy?: UrlUpdateStrategy;
}

export interface UseUrlStateReturn {
  state: ComputedRef<UrlStateValue>;
  setState: (patch: UrlStatePatch, options?: UrlStateActionOptions) => Promise<void>;
  clearKeys: (keys: string[], options?: UrlStateActionOptions) => Promise<void>;
  clearState: (options?: UrlStateActionOptions) => Promise<void>;
}
