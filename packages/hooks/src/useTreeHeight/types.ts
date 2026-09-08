import type { Ref } from 'vue';

/**
 * useTreeHeight 配置选项
 */
export interface UseTreeHeightOptions {
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
}

/**
 * useTreeHeight 返回值
 */
export interface UseTreeHeightReturn {
  /**
   * 响应式的树高度值
   * @description 可直接绑定到 YTree 的 height 属性
   */
  treeHeight: Ref<number>;

  /**
   * 手动重新计算高度
   * @description 在某些特殊场景（如容器样式变化后）可手动触发计算
   */
  recalculateHeight: () => void;
}
