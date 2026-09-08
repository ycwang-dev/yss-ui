/** SplitPane 折叠动画模式。 */
export type YSplitPaneCollapseAnimation = 'size' | 'transform' | 'none';

/** SplitPane 拖拽调整尺寸模式。 */
export type YSplitPaneResizeMode = 'realtime' | 'deferred';

export interface YSplitPaneProps {
  /** 分割方向：horizontal=左右分割，vertical=上下分割 */
  direction?: 'horizontal' | 'vertical';
  /** 初始左侧宽度（px） */
  initialWidth?: number;
  /** 初始上侧高度（px，仅在 direction='vertical' 时生效） */
  initialHeight?: number;
  /** 左侧宽度（受控），可使用 `v-model:leftWidth` */
  leftWidth?: number;
  /** 上侧高度（受控，仅在 direction='vertical' 时生效，可使用 `v-model:topHeight`） */
  topHeight?: number;
  /** 左侧最小宽度（px） */
  minWidth?: number;
  /** 左侧最大宽度（px） */
  maxWidth?: number;
  /** 上侧最小高度（px，仅在 direction='vertical' 时生效） */
  minHeight?: number;
  /** 上侧最大高度（px，仅在 direction='vertical' 时生效） */
  maxHeight?: number;
  /** 是否可折叠 */
  collapsible?: boolean;
  /** 是否允许拖动分割线 */
  draggable?: boolean;
  /** 拖拽调整尺寸模式：realtime=实时布局，deferred=代理线预览并在释放后提交 */
  resizeMode?: YSplitPaneResizeMode;
  /** 折叠状态（受控），可使用 `v-model:collapsed` */
  collapsed?: boolean;
  /** 折叠动画结束后是否卸载左侧/上侧面板内容 */
  destroyOnCollapse?: boolean;
  /** 折叠动画模式：size=尺寸过渡，transform=重内容合成层过渡，none=无动画 */
  collapseAnimation?: YSplitPaneCollapseAnimation;
  /** 分割线宽度（px） */
  gutterSize?: number;
  /** 本地存储 key，用于持久化宽度 */
  storageKey?: string;
  /** vertical 模式是否展示快捷按钮组（隐藏顶部/复位/隐藏底部） */
  showVerticalQuickActions?: boolean;
}

export interface YSplitPaneEmits {
  (e: 'update:collapsed', v: boolean): void;
  (e: 'update:leftWidth', v: number): void;
  (e: 'update:topHeight', v: number): void;
  (e: 'resize', payload: { size: number; width?: number; height?: number }): void;
  (e: 'toggle', v: boolean): void;
}
