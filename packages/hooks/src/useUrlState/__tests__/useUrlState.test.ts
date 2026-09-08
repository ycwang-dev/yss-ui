import { effectScope, nextTick, reactive } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useUrlState } from '../index';

type MockRoute = {
  path: string;
  hash: string;
  fullPath: string;
  query: Record<string, any>;
};

type MockWindow = {
  location: {
    pathname: string;
    search: string;
    hash: string;
    href: string;
  };
  history: {
    state: any;
    pushState: any;
    replaceState: any;
  };
  addEventListener: (type: string, handler: EventListenerOrEventListenerObject) => void;
  removeEventListener: (type: string, handler: EventListenerOrEventListenerObject) => void;
  dispatchEvent: (event: { type: string }) => boolean;
};

const mockRoute: MockRoute = reactive({
  path: '/task-monitor',
  hash: '#panel',
  fullPath: '/task-monitor#panel',
  query: {},
});
let currentRoute: MockRoute | undefined = mockRoute;

const pushMock = vi.fn();
const replaceMock = vi.fn();

vi.mock('vue-router', () => {
  return {
    useRoute: () => currentRoute as any,
    useRouter: () => ({
      push: pushMock,
      replace: replaceMock,
    }),
  };
});

const createMockWindow = (initialUrl = 'https://example.com/task-monitor#panel'): MockWindow => {
  let currentUrl = new URL(initialUrl);
  const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();

  const applyUrl = (url: string) => {
    currentUrl = new URL(url, currentUrl.origin);
  };

  const history = {
    state: null as any,
    pushState: vi.fn((state: any, _title: string, url?: string | null) => {
      history.state = state;
      if (url) applyUrl(url);
    }),
    replaceState: vi.fn((state: any, _title: string, url?: string | null) => {
      history.state = state;
      if (url) applyUrl(url);
    }),
  };

  return {
    get location() {
      return {
        pathname: currentUrl.pathname,
        search: currentUrl.search,
        hash: currentUrl.hash,
        href: currentUrl.href,
      };
    },
    history,
    addEventListener(type: string, handler: EventListenerOrEventListenerObject) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(handler);
    },
    removeEventListener(type: string, handler: EventListenerOrEventListenerObject) {
      listeners.get(type)?.delete(handler);
    },
    dispatchEvent(event: { type: string }) {
      const handlers = listeners.get(event.type);
      if (!handlers) return true;
      handlers.forEach(handler => {
        if (typeof handler === 'function') {
          handler(event as Event);
        } else {
          handler.handleEvent(event as Event);
        }
      });
      return true;
    },
  };
};

const createUrlState = (options?: Parameters<typeof useUrlState>[0]) => {
  const scope = effectScope();
  const composable = scope.run(() => useUrlState(options))!;
  return {
    ...composable,
    dispose: () => scope.stop(),
  };
};

describe('useUrlState', () => {
  let mockWindow: MockWindow;

  beforeEach(() => {
    pushMock.mockReset();
    replaceMock.mockReset();

    currentRoute = mockRoute;
    mockRoute.path = '/task-monitor';
    mockRoute.hash = '#panel';
    mockRoute.fullPath = '/task-monitor#panel';
    mockRoute.query = {};

    mockWindow = createMockWindow();
    vi.stubGlobal('window', mockWindow as unknown as Window & typeof globalThis);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should read query from window.search by default history strategy', async () => {
    mockWindow.history.replaceState(
      {},
      '',
      '/task-monitor?count=5&empty=&keyword=%E4%B8%AD%E6%96%87&duplicated=first&duplicated=last#panel'
    );

    const { state, dispose } = createUrlState();
    await nextTick();

    expect(state.value).toEqual({
      count: '5',
      empty: '',
      keyword: '中文',
      duplicated: 'last',
    });

    dispose();
  });

  it('should update query silently with history replace mode by default', async () => {
    mockWindow.history.replaceState({}, '', '/task-monitor?page=1&status=running#panel');

    const { setState, state, dispose } = createUrlState();
    await setState({
      status: 'success',
      pageSize: 20,
      enabled: true,
      keyword: '',
      extra: null,
      temp: undefined,
    });

    const params = new URLSearchParams(mockWindow.location.search);
    expect(params.get('page')).toBe('1');
    expect(params.get('status')).toBe('success');
    expect(params.get('pageSize')).toBe('20');
    expect(params.get('enabled')).toBe('true');
    expect(params.has('keyword')).toBe(false);
    expect(params.has('extra')).toBe(false);
    expect(params.has('temp')).toBe(false);
    expect(state.value.status).toBe('success');
    expect(replaceMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();

    dispose();
  });

  it('should support history push mode without router navigation', async () => {
    mockWindow.history.replaceState({}, '', '/task-monitor?page=2&state=failed&bizDate=2026-04-08#panel');

    const { clearKeys, dispose } = createUrlState();
    await clearKeys(['state', 'unknown'], { mode: 'push' });

    const params = new URLSearchParams(mockWindow.location.search);
    expect(params.get('page')).toBe('2');
    expect(params.get('bizDate')).toBe('2026-04-08');
    expect(params.has('state')).toBe(false);
    expect(mockWindow.history.pushState).toHaveBeenCalledTimes(1);
    expect(replaceMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();

    dispose();
  });

  it('should clear all query and keep path/hash in history strategy', async () => {
    mockWindow.history.replaceState({}, '', '/task-monitor?bizDate=2026-04-08&pfIds=A001,A002#panel');

    const { clearState, dispose } = createUrlState();
    await clearState();

    expect(mockWindow.location.pathname).toBe('/task-monitor');
    expect(mockWindow.location.search).toBe('');
    expect(mockWindow.location.hash).toBe('#panel');
    expect(replaceMock).not.toHaveBeenCalled();

    dispose();
  });

  it('should keep router behavior when strategy is router', async () => {
    mockRoute.query = {
      page: '1',
      status: 'running',
    };

    const { setState, clearState, dispose } = createUrlState({ strategy: 'router', mode: 'replace' });
    await setState({ status: 'success' });
    await clearState();

    expect(replaceMock).toHaveBeenCalledTimes(2);
    expect(replaceMock).toHaveBeenNthCalledWith(1, {
      path: '/task-monitor',
      hash: '#panel',
      query: { page: '1', status: 'success' },
    });
    expect(replaceMock).toHaveBeenNthCalledWith(2, {
      path: '/task-monitor',
      hash: '#panel',
      query: {},
    });

    dispose();
  });

  it('should sync state when URL changes by popstate or route.fullPath', async () => {
    const { state, dispose } = createUrlState();

    mockWindow.history.pushState({}, '', '/task-monitor?fromPop=1#panel');
    mockWindow.dispatchEvent({ type: 'popstate' });
    await nextTick();
    expect(state.value.fromPop).toBe('1');

    mockWindow.history.replaceState({}, '', '/task-monitor?fromRoute=1#panel');
    mockRoute.fullPath = '/task-monitor?fromRoute=1#panel';
    await nextTick();
    expect(state.value.fromRoute).toBe('1');

    dispose();
  });

  it('should work in history strategy without route context', async () => {
    currentRoute = undefined;
    mockWindow.history.replaceState({}, '', '/task-monitor?count=1#panel');

    const { state, setState, clearState, dispose } = createUrlState();
    await nextTick();
    expect(state.value.count).toBe('1');

    await setState({ count: 2, keyword: 'demo' });
    let params = new URLSearchParams(mockWindow.location.search);
    expect(params.get('count')).toBe('2');
    expect(params.get('keyword')).toBe('demo');

    await clearState();
    params = new URLSearchParams(mockWindow.location.search);
    expect(params.toString()).toBe('');
    expect(replaceMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();

    dispose();
  });
});
