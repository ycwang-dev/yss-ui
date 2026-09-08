import { computed, getCurrentScope, onScopeDispose, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { LocationQuery, LocationQueryRaw, LocationQueryValue, LocationQueryValueRaw } from 'vue-router';
import type {
  UrlNavigationMode,
  UrlStateActionOptions,
  UrlStatePatch,
  UrlUpdateStrategy,
  UrlStateValue,
  UseUrlStateOptions,
  UseUrlStateReturn,
} from './types';

const DEFAULT_MODE: UrlNavigationMode = 'replace';
const DEFAULT_STRATEGY: UrlUpdateStrategy = 'history';
const normalizeStrategy = (target: UrlUpdateStrategy, isClient: boolean) =>
  target === 'history' && !isClient ? 'router' : target;

const getNormalizedQueryValue = (
  value: LocationQueryValue | LocationQueryValueRaw[] | LocationQueryValue[]
): string => {
  if (Array.isArray(value)) {
    if (!value.length) return '';
    const lastValue = value[value.length - 1];
    return lastValue === null || lastValue === undefined ? '' : String(lastValue);
  }
  return value === null || value === undefined ? '' : String(value);
};

const toUrlState = (query: LocationQuery): UrlStateValue => {
  const result: UrlStateValue = {};
  Object.entries(query).forEach(([key, value]) => {
    result[key] = getNormalizedQueryValue(value);
  });
  return result;
};

const toComparableQuery = (query: LocationQueryRaw | LocationQuery): string => {
  const serialized: string[] = [];
  Object.keys(query)
    .sort()
    .forEach(key => {
      const value = query[key];
      if (value === undefined) return;

      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item === undefined) return;
          serialized.push(`${key}=${item === null ? '' : String(item)}`);
        });
        return;
      }

      serialized.push(`${key}=${value === null ? '' : String(value)}`);
    });
  return serialized.join('&');
};

const toSearchString = (query: UrlStateValue): string => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    params.set(key, value);
  });
  return params.toString();
};

const toUrlStateBySearch = (search: string): UrlStateValue => {
  const result: UrlStateValue = {};
  const searchParams = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  searchParams.forEach((value, key) => {
    // 与 getUrlData 行为保持一致：重复 key 取最后值
    result[key] = value;
  });
  return result;
};

const shouldDeletePatchValue = (value: UrlStatePatch[string]) => value === null || value === undefined || value === '';

export type {
  UrlNavigationMode,
  UrlStateActionOptions,
  UrlStatePatch,
  UrlUpdateStrategy,
  UrlStateValue,
  UseUrlStateOptions,
  UseUrlStateReturn,
} from './types';

/**
 * URL Query 状态管理 Hook
 *
 * @description 提供 query 参数读取、合并写入、按 key 清理和一键清空能力。
 * 仅操作当前路由 query，保留 path/hash 不变。
 */
export const useUrlState = (options: UseUrlStateOptions = {}): UseUrlStateReturn => {
  const isClient = typeof window !== 'undefined';
  const route = (() => {
    try {
      return useRoute() as any;
    } catch {
      return undefined;
    }
  })();
  const router = (() => {
    try {
      return useRouter() as any;
    } catch {
      return undefined;
    }
  })();
  const defaultMode = options.mode ?? DEFAULT_MODE;
  const defaultStrategy = options.strategy ?? DEFAULT_STRATEGY;
  const strategy = normalizeStrategy(defaultStrategy, isClient);

  const historyState = ref<UrlStateValue>(
    strategy === 'history' && isClient ? toUrlStateBySearch(window.location.search) : {}
  );

  const syncHistoryState = () => {
    if (strategy !== 'history') return;
    historyState.value = toUrlStateBySearch(window.location.search);
  };

  if (strategy === 'history' && isClient) {
    const handlePopState = () => {
      syncHistoryState();
    };
    window.addEventListener('popstate', handlePopState);
    const stopWatch =
      route && Object.prototype.hasOwnProperty.call(route, 'fullPath')
        ? watch(
            () => route.fullPath,
            () => {
              syncHistoryState();
            },
            { flush: 'sync' }
          )
        : () => {};

    if (getCurrentScope()) {
      onScopeDispose(() => {
        window.removeEventListener('popstate', handlePopState);
        stopWatch();
      });
    }
  }

  const getCurrentQuery = (currentStrategy: UrlUpdateStrategy): UrlStateValue => {
    if (currentStrategy === 'history') {
      return { ...historyState.value };
    }
    if (route?.query) return toUrlState(route.query);
    if (isClient) return toUrlStateBySearch(window.location.search);
    return {};
  };

  const updateQueryByRouter = async (query: UrlStateValue, mode: UrlNavigationMode) => {
    if (!route || !router?.push || !router?.replace) {
      if (isClient) {
        await updateQueryByHistory(query, mode);
      }
      return;
    }

    const locationQueryRaw: LocationQueryRaw = {};
    Object.entries(query).forEach(([key, value]) => {
      locationQueryRaw[key] = value;
    });

    if (toComparableQuery(route.query) === toComparableQuery(locationQueryRaw)) return;

    const navigate = mode === 'push' ? router.push : router.replace;
    await navigate({
      path: route.path,
      hash: route.hash,
      query: locationQueryRaw,
    });
  };

  const updateQueryByHistory = async (query: UrlStateValue, mode: UrlNavigationMode) => {
    if (toComparableQuery(historyState.value) === toComparableQuery(query)) return;
    const search = toSearchString(query);
    const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
    const updater = mode === 'push' ? window.history.pushState : window.history.replaceState;
    updater.call(window.history, window.history.state, '', nextUrl);
    historyState.value = { ...query };
  };

  const updateQuery = async (query: UrlStateValue, actionOptions: UrlStateActionOptions = {}) => {
    const mode = actionOptions.mode ?? defaultMode;
    const currentStrategy = normalizeStrategy(actionOptions.strategy ?? strategy, isClient);
    if (currentStrategy === 'history') {
      await updateQueryByHistory(query, mode);
      return;
    }
    await updateQueryByRouter(query, mode);
  };

  const state = computed<UrlStateValue>(() => {
    if (strategy === 'history') return historyState.value;
    if (route?.query) return toUrlState(route.query);
    if (isClient) return toUrlStateBySearch(window.location.search);
    return {};
  });

  const setState = async (patch: UrlStatePatch, actionOptions: UrlStateActionOptions = {}) => {
    const currentStrategy = normalizeStrategy(actionOptions.strategy ?? strategy, isClient);
    const nextQuery: UrlStateValue = getCurrentQuery(currentStrategy);

    Object.entries(patch).forEach(([key, value]) => {
      if (shouldDeletePatchValue(value)) {
        delete nextQuery[key];
      } else {
        nextQuery[key] = String(value);
      }
    });

    await updateQuery(nextQuery, actionOptions);
  };

  const clearKeys = async (keys: string[], actionOptions: UrlStateActionOptions = {}) => {
    if (!keys.length) return;

    const currentStrategy = normalizeStrategy(actionOptions.strategy ?? strategy, isClient);
    const nextQuery: UrlStateValue = getCurrentQuery(currentStrategy);
    keys.forEach(key => {
      delete nextQuery[key];
    });

    await updateQuery(nextQuery, actionOptions);
  };

  const clearState = async (actionOptions: UrlStateActionOptions = {}) => {
    const currentStrategy = normalizeStrategy(actionOptions.strategy ?? strategy, isClient);
    if (!Object.keys(getCurrentQuery(currentStrategy)).length) return;
    await updateQuery({}, actionOptions);
  };

  return {
    state,
    setState,
    clearKeys,
    clearState,
  };
};
