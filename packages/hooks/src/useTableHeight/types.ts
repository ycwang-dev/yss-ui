import type { Ref } from 'vue';

/**
 * useTableHeight 配置选项
 */
export interface UseTableHeightOptions {
  /**
   * 外部边界容器 (Boundary Container)
   * @description 缺省情况下直接监听目标容器的大小。如果目标容器的高度并非固定，而是由内容撑开的（这会导致双向依赖和闪烁循环），可传入更外层具有固定高度的容器 ref 作为 ResizeObserver 的观察边界。
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  boundaryRef?: Ref<any>;

  /**
   * 最小高度
   * @description 计算结果的最小值限制，防止高度过小影响体验
   * @default 200
   */
  minHeight?: number;

  /**
   * 默认高度
   * @description 初始高度值，在首次计算完成前使用
   * @default 400
   */
  defaultHeight?: number;

  /**
   * 额外偏移量
   * @description 可选的微调值，用于处理边框、padding 等边界情况
   * @default 0
   */
  extraOffset?: number;

  /**
   * 是否包含分页
   * @description 若为 true，会自动减去分页区域高度
   * @default false
   */
  withPagination?: boolean;

  /**
   * 自定义分页区域高度
   * @description 覆盖默认的分页高度常量 (48px)
   */
  paginationHeight?: number;

  /**
   * 是否包含工具栏
   * @description 若为 true，会自动减去工具栏高度
   * @default false
   */
  withToolbar?: boolean;

  /**
   * 自定义工具栏高度
   * @description 覆盖默认的工具栏高度常量 (48px)
   */
  toolbarHeight?: number;

  /**
   * 是否包含添加按钮 (仅 EditTable)
   * @description 若为 true，会自动减去底部添加按钮区域高度
   * @default false
   */
  withAddButton?: boolean;

  /**
   * 自定义添加按钮区域高度
   * @description 覆盖默认的添加按钮高度常量 (40px)
   */
  addButtonHeight?: number;
}

/**
 * useTableHeight 返回值
 */
export interface UseTableHeightReturn {
  /**
   * 响应式的表格高度值
   * @description 可直接绑定到 YTable 或 VxeTable 的 height 属性
   */
  tableHeight: Ref<number>;

  /**
   * 高度是否已就绪
   * @description 首次计算完成后为 true，可用于条件渲染或加载状态判断
   */
  isReady: Ref<boolean>;

  /**
   * 手动重新计算高度
   * @description 在某些特殊场景（如容器样式变化后）可手动触发计算
   */
  recalculateHeight: () => void;
}
