import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue';
import {
  type AnyObject,
  type CollapseNode,
  type DescriptionsViewProps,
  type FlatNode,
  type Group,
  type HeaderNode,
  type ItemNode,
  type Section,
  isHeaderNode,
  shouldPreserve,
} from '../constant';

export function useDescriptionsData(props: DescriptionsViewProps, rootRef: Ref<HTMLElement | null>) {
  const containerWidth = ref(0);
  let ro: ResizeObserver | null = null;

  const values = computed(() => props.form?.value?.values ?? props.form?.values ?? {});

  const formStateRevision = ref(0);
  let formSubId: any = null;

  // 容器宽度监听，驱动列数响应式
  onMounted(() => {
    const el = rootRef.value;
    if (el) {
      const update = () => {
        containerWidth.value = el.clientWidth;
      };
      ro = new ResizeObserver(() => update());
      ro.observe(el);
      update();
    }

    const f = props.form?.value || props.form;
    if (f && typeof f.subscribe === 'function') {
      formSubId = f.subscribe(({ type }: any) => {
        if (
          type === 'onFieldVisibleChange' ||
          type === 'onFieldDisplayChange' ||
          type === 'onFormValuesChange' ||
          type === 'onFormInitialValuesChange' ||
          type === 'onFieldInitialValueChange' ||
          type === 'onFieldDataSourceChange' ||
          type === 'onFieldComponentPropsChange'
        ) {
          formStateRevision.value++;
        }
      });
    }
  });

  onBeforeUnmount(() => {
    ro?.disconnect();
    ro = null;
    const f = props.form?.value || props.form;
    if (f && formSubId !== null && typeof f.unsubscribe === 'function') {
      f.unsubscribe(formSubId);
    }
  });

  const finalColumns = computed(() => {
    if (!props.responsive) return props.columns ?? 3;
    const possible = Math.floor((containerWidth.value || 0) / (props.minWidth || 1));
    const bounded = Math.min(props.maxColumns || 3, Math.max(props.minColumns || 1, possible || props.minColumns || 1));
    return bounded;
  });

  const getValue = (obj: AnyObject, path: string) => path.split('.').reduce((o, k) => (o === null ? o : o[k]), obj);

  const collect = (node: AnyObject, base = ''): FlatNode[] => {
    const propsObj = node?.properties || {};
    const out: FlatNode[] = [];

    // 注意：不把 FormCollapse 放到容器集合里，先专门处理
    const containerComponents = new Set([
      'FormLayout',
      'FormGrid',
      'FormButtonGroup',
      'FormStep',
      'ArrayItems',
      'ArrayTable',
      // 'FormCollapse', // 特殊处理
      'AutoButtonGroup',
    ]);

    const keys = Object.keys(propsObj).sort((a, b) => {
      const ia = (propsObj[a]?.['x-index'] ?? 0) as number;
      const ib = (propsObj[b]?.['x-index'] ?? 0) as number;
      return ia - ib;
    });

    for (const key of keys) {
      const child = propsObj[key];
      const comp = child?.['x-component'];

      // A) 保留的容器：FormCollapse -> 收集面板
      if (comp === 'FormCollapse' && shouldPreserve(comp, props.preserveContainers || [])) {
        const panels: CollapseNode['panels'] = [];
        const ps = child?.properties || {};
        const pkeys = Object.keys(ps).sort((a, b) => {
          const ia = (ps[a]?.['x-index'] ?? 0) as number;
          const ib = (ps[b]?.['x-index'] ?? 0) as number;
          return ia - ib;
        });
        for (const pk of pkeys) {
          const pn = ps[pk];
          const header = pn?.['x-component-props']?.header ?? pn?.title;
          panels.push({
            header,
            content: collect(pn, base) as Array<ItemNode | HeaderNode>, // 面板内部允许 header 分组与普通字段
          });
        }
        out.push({ type: 'collapse', panels });
        continue;
      }

      // B) 分组头
      if (props.groupByHeader && isHeaderNode(child, props.groupHeaderComponents || [])) {
        out.push({ type: 'header', title: child?.title, description: child?.['x-component-props']?.description });
        continue;
      }

      // C) void 或布局容器：下钻但不计入路径
      if (child?.type === 'void' || containerComponents.has(comp)) {
        out.push(...collect(child, base));
        continue;
      }

      // D) object：可能是值对象或布局容器
      if (child?.type === 'object') {
        const nextBase = base ? `${base}.${key}` : key;
        if (!containerComponents.has(comp)) {
          if (child?.properties) {
            out.push(...collect(child, nextBase));
            continue;
          }
          out.push({
            type: 'item',
            path: nextBase,
            title: child?.title ?? key,
            component: comp,
            enum: child?.enum,
            componentProps: child?.['x-component-props'],
            span: child?.['x-decorator-props']?.gridSpan ?? 1,
            previewFormat: child?.['x-preview-format'],
            xVisible: child?.['x-visible'],
            xHidden: child?.['x-hidden'],
            xDisplay: child?.['x-display'],
          });
          continue;
        }
        out.push(...collect(child, base));
        continue;
      }

      // E) 其他基础类型字段
      const path = base ? `${base}.${key}` : key;
      // 优先使用 enum，如果没有则尝试从 x-component-props.options 获取
      const options = child?.enum || child?.['x-component-props']?.options;
      out.push({
        type: 'item',
        path,
        title: child?.title ?? key,
        component: comp,
        enum: options,
        componentProps: child?.['x-component-props'],
        span: child?.['x-decorator-props']?.gridSpan ?? 1,
        previewFormat: child?.['x-preview-format'],
        xVisible: child?.['x-visible'],
        xHidden: child?.['x-hidden'],
        xDisplay: child?.['x-display'],
      });
    }
    return out;
  };

  const flat = computed(() => collect(props.schema));

  const groupify = (nodes: Array<ItemNode | HeaderNode>): Group[] => {
    const out: Group[] = [];
    let current: Group = { key: 0, items: [] };
    for (const n of nodes) {
      if ((n as HeaderNode).type === 'header') {
        if (current.items.length) out.push(current);
        const h = n as HeaderNode;
        current = { key: out.length, title: h.title, description: h.description, items: [] };
      } else {
        current.items.push(n as ItemNode);
      }
    }
    if (current.items.length) out.push(current);
    return out;
  };

  const sections = computed<Section[]>(() => {
    const out: Section[] = [];
    let linear: Array<ItemNode | HeaderNode> = [];
    let keyCounter = 0;

    for (const n of flat.value) {
      if ((n as CollapseNode).type === 'collapse') {
        if (linear.length) {
          out.push({ key: keyCounter++, kind: 'groups', groups: groupify(linear) });
          linear = [];
        }
        const c = n as CollapseNode;
        out.push({
          key: keyCounter++,
          kind: 'collapse',
          panels: c.panels.map(p => ({
            header: p.header,
            groups: groupify(p.content as Array<ItemNode | HeaderNode>),
          })),
        });
      } else {
        linear.push(n as any);
      }
    }
    if (linear.length) out.push({ key: keyCounter++, kind: 'groups', groups: groupify(linear) });
    return out;
  });

  const isItemVisible = (it: ItemNode) => {
    if (it.xVisible === false) return false;
    if (it.xHidden === true) return false;
    if (it.xDisplay === 'hidden' || it.xDisplay === 'none') return false;

    const f = props.form?.value || props.form;
    if (f && typeof f.query === 'function') {
      const field = f.query(it.path).take();
      if (field) {
        if (field.visible === false) return false;
        if (field.hidden === true) return false;
        if (field.display === 'hidden' || field.display === 'none') return false;
      }
    }
    return true;
  };

  // hideEmpty 过滤
  const isItemNonEmpty = (it: ItemNode) => {
    const v = getValue(values.value, it.path);
    const isValidValue = (v: any) => v !== undefined && v !== null && v !== '';
    return isValidValue(v);
  };

  const filterGroups = (gs: Group[]) => {
    let _gs = gs.map(g => ({ ...g, items: g.items.filter(isItemVisible) })).filter(g => g.items.length > 0);
    if (props.hideEmpty) {
      _gs = _gs.map(g => ({ ...g, items: g.items.filter(isItemNonEmpty) })).filter(g => g.items.length > 0);
    }
    return _gs;
  };
  const renderSections = computed<Section[]>(() => {
    /** 显式收集依赖，以响应 Formily 状态变化。 */
    void formStateRevision.value;
    const res: Section[] = [];
    for (const s of sections.value) {
      if (s.kind === 'groups') {
        const groups = filterGroups(s.groups);
        if (!props.hideEmpty || groups.length) res.push({ key: s.key, kind: 'groups', groups });
      } else {
        const panels = s.panels
          .map(p => ({ header: p.header, groups: filterGroups(p.groups) }))
          .filter(p => !props.hideEmptyPanels || p.groups.length);
        if (!props.hideEmpty || panels.length) res.push({ key: s.key, kind: 'collapse', panels });
      }
    }
    return res;
  });

  const toPanelKeys = (panels: any[]) => panels.map((_: any, i: number) => i);

  return {
    values,
    finalColumns,
    renderSections,
    toPanelKeys,
    getValue,
  };
}
