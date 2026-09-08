import { computed, shallowRef, toRaw } from 'vue';
import type { ConditionGroup, ConditionLeaf, ConditionNode, OperatorOption, OperatorInputKind } from '../types';

let idCounter = 0;
const genId = (): string => {
  idCounter += 1;
  return `ycb_${Date.now()}_${idCounter}`;
};

export interface TreeApiOptions {
  maxDepth: number;
  operatorResolver: (field: unknown | undefined) => Promise<OperatorOption[]>;
  defaultOperator?: string;
}

export const useConditionTree = (initial: ConditionGroup, opts: TreeApiOptions) => {
  const root = shallowRef<ConditionGroup>(ensureIds(initial));

  const depthOfPath = (path: number[]): number => path.length + 1;

  const getByPath = (path: number[]): { parent: ConditionGroup; index: number; node?: ConditionNode } => {
    let parent: ConditionGroup = root.value;
    for (let i = 0; i < path.length - 1; i += 1) {
      const idx = path[i];
      const child = parent.children[idx];
      if (!child || child.type !== 'GROUP') {
        throw new Error(`Invalid path at index ${i}`);
      }
      parent = child as ConditionGroup;
    }
    const index = path[path.length - 1] ?? -1;
    const node = index >= 0 ? parent.children[index] : undefined;
    return { parent, index, node };
  };

  const toggleGroupOp = (path: number[]) => {
    const { node } = getByPath(path);
    if (!node || node.type !== 'GROUP') return;
    node.logicalOp = node.logicalOp === 'AND' ? 'OR' : 'AND';
    root.value = { ...root.value };
  };

  const addLeaf = (path?: number[], index?: number) => {
    const targetPath = path ? [...path] : [];
    const { parent } = getByPath(targetPath);
    const leaf: ConditionLeaf = {
      id: genId(),
      type: 'LEAF',
      field: '',
      operator: opts.defaultOperator ?? '=',
      value: '',
      betweenValue1: '',
      betweenValue2: '',
    };
    const at = typeof index === 'number' ? index : parent.children.length;
    parent.children.splice(at, 0, leaf);
    root.value = { ...root.value };
  };

  const addGroup = (path?: number[], index?: number) => {
    const targetPath = path ? [...path] : [];
    if (depthOfPath(targetPath) >= opts.maxDepth) return;
    const { parent } = getByPath(targetPath);
    const group: ConditionGroup = {
      id: genId(),
      type: 'GROUP',
      logicalOp: 'AND',
      children: [
        {
          id: genId(),
          type: 'LEAF',
          field: '',
          operator: opts.defaultOperator ?? '=',
          value: '',
          betweenValue1: '',
          betweenValue2: '',
        },
      ],
    };
    const at = typeof index === 'number' ? index : parent.children.length;
    parent.children.splice(at, 0, group);
    root.value = { ...root.value };
  };

  const remove = (path: number[]) => {
    const { parent, index } = getByPath(path);
    if (index < 0) return;
    parent.children.splice(index, 1);
    root.value = { ...root.value };
  };

  const setLeafField = (path: number[], key: keyof ConditionLeaf, value: unknown) => {
    const { node } = getByPath(path);
    if (!node || node.type !== 'LEAF') return;
    const leaf = node as ConditionLeaf;
    (leaf as any)[key] = value;
    root.value = { ...root.value };
  };

  const resolveOperatorKind = async (path: number[]): Promise<OperatorInputKind> => {
    const { node } = getByPath(path);
    if (!node || node.type !== 'LEAF') return 'single';
    const field = (node as ConditionLeaf).field;
    const operator = (node as ConditionLeaf).operator as string | undefined;
    const ops = await opts.operatorResolver(field);
    const found = ops.find(o => o.value === operator);
    return found?.kind ?? 'single';
  };

  const listChildren = computed(() => root.value.children);

  return {
    root,
    listChildren,
    getByPath,
    toggleGroupOp,
    addLeaf,
    addGroup,
    remove,
    setLeafField,
    resolveOperatorKind,
  };
};

/**
 * 安全的深拷贝函数，使用 structuredClone，失败时回退到 JSON 序列化
 */
function safeClone<T>(data: T): T {
  try {
    return structuredClone(data) as T;
  } catch (error) {
    // structuredClone 失败时（如包含函数、DOM 节点等不可序列化内容），使用 JSON 序列化作为 fallback
    try {
      return JSON.parse(JSON.stringify(data)) as T;
    } catch (jsonError) {
      // 如果 JSON 序列化也失败，返回原始数据的浅拷贝
      return { ...data } as T;
    }
  }
}

function ensureIds(group: ConditionGroup): ConditionGroup {
  const clone = safeClone(toRaw(group)) as ConditionGroup;
  const walk = (g: ConditionGroup) => {
    if (!g.id) g.id = genId();
    g.children = g.children.map(child => {
      if (child.type === 'GROUP') {
        const c = child as ConditionGroup;
        if (!c.id) c.id = genId();
        walk(c);
        return c;
      } else {
        const l = child as ConditionLeaf;
        if (!l.id) l.id = genId();
        if (!l.field) l.field = '';
        if (!l.operator) l.operator = '=';
        if (l.value === undefined) l.value = '';
        if (!l.betweenValue1) l.betweenValue1 = '';
        if (!l.betweenValue2) l.betweenValue2 = '';
        return l;
      }
    });
  };
  walk(clone);
  return clone;
}
