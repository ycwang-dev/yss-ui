import { computed, onMounted, provide, ref, shallowRef, type ComputedRef } from 'vue';
import { normalizeCollapsedRows } from '../constant';
import type { YssFormilyCollapseSlotScope, YssFormilyEmits, YssFormilyProps } from '../types';

/** Formily 折叠上下文注入键。 */
export const FORMILY_COLLAPSE_CONTEXT = Symbol('YSS_FORMILY_COLLAPSE_CONTEXT');

/** 栅格注册参数。 */
export interface FormilyCollapseGridOptions {
  target?: boolean;
  elementId?: string;
}

/** 栅格注册句柄。 */
export interface FormilyCollapseGridHandle {
  id: string;
  isTarget: ComputedRef<boolean>;
  rowOffset: ComputedRef<number>;
  updateRows: (rows: number) => void;
  updateTarget: (target?: boolean) => void;
  updateElementId: (elementId: string) => void;
  unregister: () => void;
}

/** 操作组注册句柄。 */
export interface FormilyCollapseActionHandle {
  isPrimary: ComputedRef<boolean>;
  unregister: () => void;
}

/** YFormily 折叠上下文。 */
export interface FormilyCollapseContext {
  enabled: ComputedRef<boolean>;
  expanded: ComputedRef<boolean>;
  collapsedRows: ComputedRef<number>;
  rowCount: ComputedRef<number>;
  showTrigger: ComputedRef<boolean>;
  hasActionsSlot: ComputedRef<boolean>;
  hasActionGroups: ComputedRef<boolean>;
  showFallbackTrigger: ComputedRef<boolean>;
  controlsId: ComputedRef<string | undefined>;
  slotScope: ComputedRef<YssFormilyCollapseSlotScope>;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
  registerGrid: (options?: FormilyCollapseGridOptions) => FormilyCollapseGridHandle;
  registerActionGroup: () => FormilyCollapseActionHandle;
}

/** 内部栅格注册项。 */
interface GridRegistration {
  id: string;
  elementId: string;
  target: boolean | undefined;
  rows: number;
}

/** 组件内部唯一 ID 种子。 */
let collapseGridSeed = 0;

/**
 * 管理 YFormily 折叠状态、目标栅格和操作组注册。
 * @param props YFormily Props
 * @param emit YFormily 事件发送器
 * @param hasActionsSlot 是否提供 actions 插槽
 * @returns 折叠上下文
 */
export const useFormilyCollapse = (
  props: YssFormilyProps,
  emit: YssFormilyEmits,
  hasActionsSlot: ComputedRef<boolean>
): FormilyCollapseContext => {
  const innerExpanded = ref(!!props.defaultExpanded);
  const mounted = ref(false);
  const grids = shallowRef<GridRegistration[]>([]);
  const actionGroups = ref<symbol[]>([]);

  /** 当前是否实际启用折叠。 */
  const enabled = computed(() => !!props.collapsible && props.mode !== 2);
  /** 收起状态保留行数。 */
  const collapsedRows = computed(() => normalizeCollapsedRows(props.collapsedRows));
  /** 当前展开状态。 */
  const expanded = computed(() => props.expanded ?? innerExpanded.value);
  /** 当前参与折叠的目标栅格。 */
  const targetGrids = computed(() => {
    const explicitTargets = grids.value.filter(item => item.target === true);
    if (explicitTargets.length) return explicitTargets;
    const defaultTarget = grids.value.find(item => item.target !== false);
    return defaultTarget ? [defaultTarget] : [];
  });
  /** 当前目标栅格总行数。 */
  const rowCount = computed(() => targetGrids.value.reduce((total, item) => total + item.rows, 0));
  /** 是否需要显示展开/收起入口。 */
  const showTrigger = computed(() => enabled.value && rowCount.value > collapsedRows.value);
  /** 是否已注册 Schema AutoButtonGroup。 */
  const hasActionGroups = computed(() => actionGroups.value.length > 0);
  /** 是否在根部渲染无按钮组的兜底入口。 */
  const showFallbackTrigger = computed(
    () => mounted.value && showTrigger.value && !hasActionsSlot.value && !hasActionGroups.value
  );
  /** aria-controls 对应的目标栅格 ID。 */
  const controlsId = computed(() => {
    const ids = targetGrids.value.map(item => item.elementId).filter(Boolean);
    return ids.length ? ids.join(' ') : undefined;
  });

  /**
   * 请求更新展开状态。
   * @param next 目标状态
   */
  const setExpanded = (next: boolean) => {
    if (next === expanded.value) return;
    if (props.expanded === undefined) innerExpanded.value = next;
    emit('update:expanded', next);
    emit('toggle', next);
  };

  /** 切换展开状态。 */
  const toggle = () => setExpanded(!expanded.value);
  /** 展开表单。 */
  const expand = () => setExpanded(true);
  /** 收起表单。 */
  const collapse = () => setExpanded(false);

  /** 触发器和插槽共用作用域。 */
  const slotScope = computed<YssFormilyCollapseSlotScope>(() => ({
    expanded: expanded.value,
    rowCount: rowCount.value,
    collapsedRows: collapsedRows.value,
    toggle,
    expand,
    collapse,
  }));

  /**
   * 注册一个 FormGrid。
   * @param options 栅格折叠选项
   * @returns 栅格注册句柄
   */
  const registerGrid = (options: FormilyCollapseGridOptions = {}): FormilyCollapseGridHandle => {
    collapseGridSeed += 1;
    const id = `yss-formily-grid-${collapseGridSeed}`;
    const registration: GridRegistration = {
      id,
      elementId: options.elementId || id,
      target: options.target,
      rows: 0,
    };
    grids.value = [...grids.value, registration];

    return {
      id,
      isTarget: computed(() => targetGrids.value.includes(registration)),
      rowOffset: computed(() => {
        const index = targetGrids.value.indexOf(registration);
        if (index <= 0) return 0;
        return targetGrids.value.slice(0, index).reduce((total, item) => total + item.rows, 0);
      }),
      updateRows: rows => {
        const normalizedRows = Math.max(0, Math.floor(rows || 0));
        if (registration.rows === normalizedRows) return;
        registration.rows = normalizedRows;
        grids.value = [...grids.value];
      },
      updateTarget: target => {
        if (registration.target === target) return;
        registration.target = target;
        grids.value = [...grids.value];
      },
      updateElementId: elementId => {
        if (!elementId || registration.elementId === elementId) return;
        registration.elementId = elementId;
        grids.value = [...grids.value];
      },
      unregister: () => {
        grids.value = grids.value.filter(item => item !== registration);
      },
    };
  };

  /**
   * 注册 Schema AutoButtonGroup，只让第一个活跃按钮组接管入口。
   * @returns 操作组注册句柄
   */
  const registerActionGroup = (): FormilyCollapseActionHandle => {
    const id = Symbol('YSS_FORMILY_ACTION_GROUP');
    actionGroups.value = [...actionGroups.value, id];
    return {
      isPrimary: computed(() => actionGroups.value[0] === id),
      unregister: () => {
        actionGroups.value = actionGroups.value.filter(item => item !== id);
      },
    };
  };

  /** 组件挂载后才允许显示无按钮组兜底行。 */
  onMounted(() => {
    mounted.value = true;
  });

  const context: FormilyCollapseContext = {
    enabled,
    expanded,
    collapsedRows,
    rowCount,
    showTrigger,
    hasActionsSlot,
    hasActionGroups,
    showFallbackTrigger,
    controlsId,
    slotScope,
    toggle,
    expand,
    collapse,
    registerGrid,
    registerActionGroup,
  };

  provide(FORMILY_COLLAPSE_CONTEXT, context);
  return context;
};
