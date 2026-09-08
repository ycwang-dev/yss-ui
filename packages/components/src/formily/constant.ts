/** 折叠隐藏节点标记，用于区分组件隐藏与业务隐藏。 */
export const COLLAPSE_HIDDEN_ATTRIBUTE = 'data-yss-formily-collapse-hidden';

/** 折叠目标栅格属性名。 */
export const COLLAPSE_TARGET_ATTRIBUTE = 'collapseTarget';

/** 默认收起保留行数。 */
export const DEFAULT_COLLAPSED_ROWS = 1;

/** 栅格节点布局所需的最小结构。 */
export interface FormilyGridNodeLike {
  index: number;
  span?: number;
  originSpan?: number;
}

/** 单次栅格行计算状态。 */
export interface FormilyGridWalkState {
  walkedColumns: number;
  rowCount: number;
}

/**
 * 将外部传入的收起行数归一化为正整数。
 * @param value 外部传入行数
 * @returns 合法收起行数
 */
export const normalizeCollapsedRows = (value?: number): number => {
  if (!Number.isFinite(value)) return DEFAULT_COLLAPSED_ROWS;
  return Math.max(DEFAULT_COLLAPSED_ROWS, Math.floor(value as number));
};

/**
 * 将一个业务可见栅格节点追加到布局状态，并返回它所在行。
 * 算法与 @formily/grid 的非 strictAutoFit 填充逻辑保持一致。
 * @param state 当前布局累计状态
 * @param node 栅格节点
 * @param columns 当前响应式列数
 * @param strictAutoFit 是否使用严格自适应
 * @returns 节点所在行
 */
export const appendVisibleGridNode = (
  state: FormilyGridWalkState,
  node: FormilyGridNodeLike,
  columns: number,
  strictAutoFit = false
): number => {
  const safeColumns = Math.max(1, Math.floor(columns || 1));
  let columnIndex = state.walkedColumns % safeColumns;
  let remainColumns = safeColumns - columnIndex;
  const originSpan = Number(node.originSpan ?? node.span ?? 1);
  const desiredSpan = originSpan === -1 ? remainColumns : Math.max(1, Math.min(originSpan, safeColumns));

  if (strictAutoFit && desiredSpan > remainColumns && columnIndex > 0) {
    state.walkedColumns += remainColumns;
    columnIndex = 0;
    remainColumns = safeColumns;
  }

  const actualSpan = strictAutoFit ? desiredSpan : Math.min(desiredSpan, remainColumns);
  const row = Math.floor(state.walkedColumns / safeColumns) + 1;
  state.walkedColumns += actualSpan;
  state.rowCount = Math.max(state.rowCount, Math.ceil(state.walkedColumns / safeColumns));
  return row;
};
