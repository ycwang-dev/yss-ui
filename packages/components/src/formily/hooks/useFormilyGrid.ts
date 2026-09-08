import * as Antdv from '@formily/antdv';
import { computed, defineComponent, h, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import {
  COLLAPSE_HIDDEN_ATTRIBUTE,
  COLLAPSE_TARGET_ATTRIBUTE,
  appendVisibleGridNode,
  type FormilyGridWalkState,
} from '../constant';
import type { FormilyCollapseContext, FormilyCollapseGridHandle } from './useFormilyCollapse';

type AnyObject = Record<string, any>;

/** 弹窗/抽屉动画期间 FormGrid 需要补偿重算的时间点。 */
const FORM_GRID_RECALCULATE_DELAYS = [0, 50, 150, 350, 700] as const;

/** FormGrid 折叠节点的最小结构。 */
interface CollapseGridNode {
  index: number;
  span?: number;
  originSpan?: number;
  visible?: boolean;
  element?: HTMLElement;
}

/** FormGrid 实例的最小结构。 */
interface CollapseGridInstance {
  columns?: number;
  children?: CollapseGridNode[];
  options?: AnyObject;
}

/** useFormilyGrid 选项。 */
export interface FormilyGridOptions {
  gridDefaults?: AnyObject;
  detailOptions?: Record<string, any>;
  collapse?: FormilyCollapseContext;
}

/**
 * 解析 Schema 传入的 collapseTarget 布尔值。
 * @param value Schema 属性值
 * @returns 三态布尔值
 */
const resolveCollapseTarget = (value: unknown): boolean | undefined => {
  if (value === true || value === '' || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
};

/**
 * 提供表单栅格默认值、详情默认值和查询表单折叠能力。
 * @param options 页面/实例级配置
 * @returns gridDefaults、detailResolved、FormGridWithDefaults
 */
export function useFormilyGrid(options: FormilyGridOptions) {
  /** 实例级响应式栅格默认值。 */
  const gridDefaults = computed(() => ({
    maxColumns: 3,
    minColumns: 1,
    columnGap: 16,
    rowGap: 0,
    minWidth: 260,
    ...(options.gridDefaults || {}),
  }));

  /** 详情模式默认值。 */
  const detailResolved = computed(() => ({
    responsive: true,
    maxColumns: gridDefaults.value.maxColumns,
    minColumns: gridDefaults.value.minColumns,
    minWidth: gridDefaults.value.minWidth,
    ...(options.detailOptions || {}),
  }));

  /** 带默认值和折叠能力的 FormGrid 适配器。 */
  const FormGridWithDefaults = defineComponent({
    name: 'FormGridWithDefaults',
    setup(_, { attrs, slots }) {
      const gridRef = ref<any>(null);
      const timerIds: Array<ReturnType<typeof setTimeout>> = [];
      const frameIds: number[] = [];
      let disposed = false;
      let activeGrid: CollapseGridInstance | null = null;
      let walkState: FormilyGridWalkState = { walkedColumns: 0, rowCount: 0 };
      /** 未传入自定义 Grid 时复用的官方 Grid 实例。 */
      const internalGrid = (Antdv as AnyObject).createFormGrid({});
      /** 当前被注入折叠回调的 Grid 实例。 */
      let activeManagedGrid: AnyObject | null = null;
      /** Grid 原有回调，用于切换实例或卸载时恢复。 */
      let managedGridCallbacks: AnyObject = {};

      /** 当前栅格在折叠管理器中的注册句柄。 */
      const collapseHandle: FormilyCollapseGridHandle | undefined = options.collapse?.registerGrid({
        target: resolveCollapseTarget((attrs as AnyObject)[COLLAPSE_TARGET_ATTRIBUTE]),
        elementId: String((attrs as AnyObject).id || ''),
      });

      /**
       * 获取 FormGrid 根元素，兼容组件实例 ref 和 DOM ref。
       * @returns FormGrid 根 DOM 节点
       */
      const getGridElement = (): HTMLElement | null => {
        const element = gridRef.value?.$el ?? gridRef.value;
        if (typeof HTMLElement === 'undefined' || !(element instanceof HTMLElement)) return null;
        return element;
      };

      /**
       * 读取当前栅格容器宽度。
       * @returns 容器宽度
       */
      const getWidth = (): number => {
        const element = getGridElement();
        if (!element) return 0;
        return element.getBoundingClientRect?.().width ?? element.clientWidth ?? 0;
      };

      /** 重置单次 Grid digest 的行计算状态。 */
      const resetWalkState = (grid: CollapseGridInstance) => {
        activeGrid = grid;
        walkState = { walkedColumns: 0, rowCount: 0 };
      };

      /**
       * 获取局部或实例级的 Grid 回调。
       * @param name 回调属性名
       * @returns 用户回调
       */
      const getUserCallback = (name: 'shouldVisible' | 'onDigest' | 'onInitialized') => {
        return (attrs as AnyObject)[name] ?? (gridDefaults.value as AnyObject)[name] ?? managedGridCallbacks[name];
      };

      /** 恢复 Grid 原有回调，避免外部传入的 Grid 实例残留组件闭包。 */
      const restoreManagedGridCallbacks = () => {
        if (!activeManagedGrid?.options) return;
        const restoredOptions = { ...activeManagedGrid.options };
        (['shouldVisible', 'onDigest', 'onInitialized'] as const).forEach(name => {
          const callback = managedGridCallbacks[name];
          if (typeof callback === 'undefined') delete restoredOptions[name];
          else restoredOptions[name] = callback;
        });
        activeManagedGrid.options = restoredOptions;
        activeManagedGrid = null;
        managedGridCallbacks = {};
      };

      /**
       * 将折叠回调写入 FormGrid 官方 Grid 实例。
       * 当前 @formily/antdv 版本只声明 shouldVisible Prop，onDigest/onInitialized 必须通过 grid.options 注入。
       * @param resolved 合并后的 FormGrid 配置
       * @returns 供 FormGrid 使用的 Grid 实例
       */
      const resolveManagedGrid = (resolved: AnyObject) => {
        const grid = resolved.grid || internalGrid;
        if (activeManagedGrid !== grid) {
          clearCollapseMarkers();
          restoreManagedGridCallbacks();
          activeManagedGrid = grid;
          managedGridCallbacks = {
            shouldVisible: grid.options?.shouldVisible,
            onDigest: grid.options?.onDigest,
            onInitialized: grid.options?.onInitialized,
          };
        }

        const gridOptions = { ...(grid.options || {}), ...resolved };
        delete gridOptions.grid;
        grid.options = {
          ...gridOptions,
          shouldVisible: handleShouldVisible,
          onDigest: handleDigest,
          onInitialized: handleInitialized,
        };
        return grid;
      };

      /**
       * 合并用户 shouldVisible 和折叠可见性。
       * @param node 当前栅格节点
       * @param grid FormGrid 布局实例
       * @returns 节点是否显示
       */
      const handleShouldVisible = (node: CollapseGridNode, grid: CollapseGridInstance): boolean => {
        if (activeGrid !== grid || node.index === 0) resetWalkState(grid);

        const element = node.element;
        const hiddenByCollapse = !!element?.hasAttribute(COLLAPSE_HIDDEN_ATTRIBUTE);
        const userShouldVisible = getUserCallback('shouldVisible');
        const userVisible = typeof userShouldVisible === 'function' ? userShouldVisible(node, grid) !== false : true;
        const businessVisible =
          typeof userShouldVisible === 'function' ? userVisible : !!node.visible || hiddenByCollapse;

        if (!businessVisible) {
          element?.removeAttribute(COLLAPSE_HIDDEN_ATTRIBUTE);
          return false;
        }

        const row = appendVisibleGridNode(walkState, node, Number(grid.columns || 1), !!grid.options?.strictAutoFit);
        const shouldCollapse =
          !!options.collapse?.enabled.value &&
          !!collapseHandle?.isTarget.value &&
          !options.collapse.expanded.value &&
          collapseHandle.rowOffset.value + row > options.collapse.collapsedRows.value;

        if (shouldCollapse) {
          element?.setAttribute(COLLAPSE_HIDDEN_ATTRIBUTE, 'true');
          return false;
        }

        element?.removeAttribute(COLLAPSE_HIDDEN_ATTRIBUTE);
        return true;
      };

      /**
       * Grid 布局完成后回传实际业务可见行数。
       * @param grid FormGrid 布局实例
       */
      const handleDigest = (grid: CollapseGridInstance) => {
        if (!grid.children?.length) walkState = { walkedColumns: 0, rowCount: 0 };
        collapseHandle?.updateRows(walkState.rowCount);
        getUserCallback('onDigest')?.(grid);
      };

      /**
       * Grid 初始化后透传用户回调。
       * @param grid FormGrid 布局实例
       */
      const handleInitialized = (grid: CollapseGridInstance) => {
        getUserCallback('onInitialized')?.(grid);
      };

      /** 恢复由展开/收起功能隐藏的节点。 */
      const clearCollapseMarkers = () => {
        const element = getGridElement();
        if (!element) return;
        element.querySelectorAll<HTMLElement>(`[${COLLAPSE_HIDDEN_ATTRIBUTE}]`).forEach(node => {
          node.removeAttribute(COLLAPSE_HIDDEN_ATTRIBUTE);
        });
      };

      /**
       * 登记动画帧任务，并在卸载时统一取消。
       * @param callback 动画帧回调
       */
      const requestReflowFrame = (callback: () => void) => {
        if (typeof window === 'undefined') return;
        const frameId = window.requestAnimationFrame(() => {
          const index = frameIds.indexOf(frameId);
          if (index > -1) frameIds.splice(index, 1);
          if (!disposed) callback();
        });
        frameIds.push(frameId);
      };

      /** 清理所有等待中的延迟任务和动画帧任务。 */
      const clearScheduledTasks = () => {
        timerIds.splice(0).forEach(timerId => clearTimeout(timerId));
        if (typeof window !== 'undefined') {
          frameIds.splice(0).forEach(frameId => window.cancelAnimationFrame(frameId));
        }
      };

      /** 通过 Grid observable options 直接触发内置 digest。 */
      const triggerGridDigest = () => {
        if (!activeManagedGrid?.options) return;
        activeManagedGrid.options = { ...activeManagedGrid.options };
      };

      /** 通过两帧宽度微调触发 FormGrid 内部 ResizeObserver 重新计算。 */
      const triggerGridReflow = async () => {
        await nextTick();
        if (disposed || typeof window === 'undefined') return;
        requestReflowFrame(() => {
          const element = getGridElement();
          if (!element || getWidth() <= 0) return;
          const originalWidth = element.style.width;
          window.dispatchEvent(new Event('resize'));
          element.style.width = '99.99%';
          void element.offsetHeight;
          requestReflowFrame(() => {
            if (!element.isConnected) return;
            element.style.width = originalWidth;
            void element.offsetHeight;
            window.dispatchEvent(new Event('resize'));
          });
        });
      };

      /** 同步 Schema 折叠目标与 DOM ID。 */
      watch(
        () => [(attrs as AnyObject)[COLLAPSE_TARGET_ATTRIBUTE], (attrs as AnyObject).id] as const,
        ([target, elementId]) => {
          collapseHandle?.updateTarget(resolveCollapseTarget(target));
          collapseHandle?.updateElementId(String(elementId || collapseHandle.id));
        },
        { immediate: true }
      );

      if (options.collapse && collapseHandle) {
        /** 折叠状态或目标顺序改变后强制 Grid 重算。 */
        watch(
          [
            options.collapse.enabled,
            options.collapse.expanded,
            options.collapse.collapsedRows,
            collapseHandle.isTarget,
            collapseHandle.rowOffset,
          ],
          ([enabled]) => {
            if (!enabled) {
              clearCollapseMarkers();
              collapseHandle.updateRows(0);
              restoreManagedGridCallbacks();
            } else triggerGridDigest();
            void triggerGridReflow();
          }
        );
      }

      onMounted(() => {
        FORM_GRID_RECALCULATE_DELAYS.forEach(delay => {
          const timerId = setTimeout(() => {
            const index = timerIds.indexOf(timerId);
            if (index > -1) timerIds.splice(index, 1);
            void triggerGridReflow();
          }, delay);
          timerIds.push(timerId);
        });
      });

      onUnmounted(() => {
        disposed = true;
        clearScheduledTasks();
        clearCollapseMarkers();
        restoreManagedGridCallbacks();
        collapseHandle?.unregister();
      });

      return () => {
        const sanitized: AnyObject = {};
        Object.keys(attrs as AnyObject).forEach(key => {
          if (key === COLLAPSE_TARGET_ATTRIBUTE) return;
          const value = (attrs as AnyObject)[key];
          if (typeof value !== 'undefined') sanitized[key] = value;
        });

        const resolved: AnyObject = { ...gridDefaults.value, ...sanitized };
        const elementId = String(resolved.id || collapseHandle?.id || '');
        collapseHandle?.updateElementId(elementId);
        if (options.collapse?.enabled.value) {
          resolved.grid = resolveManagedGrid(resolved);
          delete resolved.onDigest;
          delete resolved.onInitialized;
        }

        return h(
          (Antdv as AnyObject).FormGrid,
          {
            ...resolved,
            id: elementId || undefined,
            ref: gridRef,
          },
          slots
        );
      };
    },
  });

  return { gridDefaults, detailResolved, FormGridWithDefaults };
}
