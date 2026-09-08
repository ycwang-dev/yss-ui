import type { CSSProperties } from 'vue';
import type { CardProps as AntCardProps } from 'ant-design-vue';

/**
 * YCard Props
 * 基于 Ant Design Card 扩展的卡片组件 Props
 * 专注于单个卡片功能，提供灵活的样式控制，不包含布局逻辑
 */
export interface YCardProps extends Omit<Partial<AntCardProps>, 'bodyStyle'> {
  /**
   * @description 内容区内边距（将合并到 bodyStyle.padding）
   * 支持数字（px）或字符串（如 '16px', '1rem'）
   * @example 16 | '16px' | '1rem'
   */
  padding?: number | string;
  /**
   * @description 透传给 ACard 的 bodyStyle
   * 会与 padding 属性合并，显式传入的 bodyStyle.padding 优先级更高
   */
  bodyStyle?: CSSProperties;
  /**
   * @description 自定义卡片类名
   * 可以是字符串或字符串数组，用于业务层样式定制
   */
  className?: string | string[];
  /**
   * @description 自定义卡片样式
   * 用于业务层直接设置样式，避免类名污染
   */
  customStyle?: CSSProperties;
  /**
   * @description Meta 标题
   * 若提供任一 Meta 相关内容，将在内容区顶部渲染 Meta 信息
   */
  metaTitle?: string;
  /**
   * @description Meta 描述
   */
  metaDescription?: string;
}
