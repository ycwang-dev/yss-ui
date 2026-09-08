import { shallowRef, watch } from 'vue';

type AnyConfig = Record<string, any> | undefined;

interface StableFunctionEntry {
  latest: Function;
  proxy: Function;
}

interface StableNode {
  children: Map<string, StableNode>;
  functionEntry?: StableFunctionEntry;
}

const createNode = (): StableNode => ({
  children: new Map(),
});

const isPlainObject = (value: unknown): value is Record<string, any> => {
  return Object.prototype.toString.call(value) === '[object Object]';
};

const syncStableValue = (value: any, prevValue: any, node: StableNode): { value: any; changed: boolean } => {
  if (typeof value === 'function') {
    if (!node.functionEntry) {
      node.functionEntry = {
        latest: value,
        proxy: (...args: any[]) => node.functionEntry!.latest(...args),
      };
    } else {
      node.functionEntry.latest = value;
    }

    return {
      value: node.functionEntry.proxy,
      changed: prevValue !== node.functionEntry.proxy,
    };
  }

  node.functionEntry = undefined;

  if (Array.isArray(value)) {
    const prevArray = Array.isArray(prevValue) ? prevValue : undefined;
    let changed = !prevArray || prevArray.length !== value.length;
    const nextArray = value.map((item, index) => {
      const childKey = String(index);
      const childNode = node.children.get(childKey) || createNode();
      node.children.set(childKey, childNode);
      const result = syncStableValue(item, prevArray?.[index], childNode);
      changed = changed || result.changed;
      return result.value;
    });

    Array.from(node.children.keys()).forEach(key => {
      if (Number(key) >= value.length) {
        node.children.delete(key);
      }
    });

    return {
      value: changed ? nextArray : prevArray!,
      changed,
    };
  }

  if (isPlainObject(value)) {
    const prevObject = isPlainObject(prevValue) ? prevValue : undefined;
    const nextObject: Record<string, any> = {};
    const keys = Object.keys(value);
    let changed = !prevObject || Object.keys(prevObject).length !== keys.length;

    keys.forEach(key => {
      const childNode = node.children.get(key) || createNode();
      node.children.set(key, childNode);
      const result = syncStableValue(value[key], prevObject?.[key], childNode);
      nextObject[key] = result.value;
      changed = changed || result.changed;
    });

    Array.from(node.children.keys()).forEach(key => {
      if (!(key in value)) {
        node.children.delete(key);
      }
    });

    return {
      value: changed ? nextObject : prevObject!,
      changed,
    };
  }

  node.children.clear();

  return {
    value,
    changed: prevValue !== value,
  };
};

const cleanupNode = (key: string, node: StableNode) => {
  node.children.delete(key);
};

/**
 * 仅稳定顶层的 plain object 配置，避免内联对象在每次渲染时生成新引用。
 * 非 plain object（例如 data 数组、函数、Date、Map、Set、组件实例）保持原样透传。
 */
export function useStableConfig<T extends AnyConfig>(source: () => T) {
  const stableConfig = shallowRef<Record<string, any>>({});
  const rootNode = createNode();

  watch(
    source,
    value => {
      const nextConfig: Record<string, any> = value || {};
      const prevConfig = stableConfig.value;
      const nextValue: Record<string, any> = {};
      const keys = Object.keys(nextConfig);
      let changed = Object.keys(prevConfig).length !== keys.length;

      keys.forEach(key => {
        const current = nextConfig[key];
        const prev = prevConfig[key];

        if (isPlainObject(current)) {
          const childNode = rootNode.children.get(key) || createNode();
          rootNode.children.set(key, childNode);
          const result = syncStableValue(current, prev, childNode);
          nextValue[key] = result.value;
          changed = changed || result.changed;
          return;
        }

        cleanupNode(key, rootNode);
        nextValue[key] = current;
        changed = changed || prev !== current;
      });

      Array.from(rootNode.children.keys()).forEach(key => {
        if (!(key in nextConfig)) {
          cleanupNode(key, rootNode);
        }
      });

      stableConfig.value = changed ? nextValue : prevConfig;
    },
    { immediate: true }
  );

  return stableConfig;
}
