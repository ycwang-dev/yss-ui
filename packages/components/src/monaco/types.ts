// 使用宽松类型以避免在未安装 monaco 依赖时的类型解析问题
// 运行时仍按 ESM 动态导入获取真实 API
export type MonacoApi = any;

export interface YMonacoToolbarTooltipTexts {
  copy: string;
  copied: string;
  enterFullscreen: string;
  exitFullscreen: string;
  download: string;
  diffCopy: string;
  diffDownload: string;
}

export interface YMonacoToolbarTooltipOptions {
  placement?: string;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  texts?: Partial<YMonacoToolbarTooltipTexts>;
}

export interface YMonacoFullscreenTransitionOptions {
  duration?: number;
  easing?: string;
}

export interface YMonacoProps {
  /** 双向绑定内容 */
  modelValue: string;
  /** 语法高亮语言，例如 'javascript' | 'sql' | 'json' | 'log' | 'nginx' */
  language?: string;
  /** 主题：'vs' | 'vs-dark' | 'hc-black' | 自定义（不传时自动跟随站点亮暗模式） */
  theme?: string;
  /** 宽度 */
  width?: number | string; // 默认值：'100%'
  /** 高度 */
  height?: number | string; // 默认值：300
  /** Monaco Editor 选项 */
  options?: Record<string, unknown>;
  /** 只读（置灰态） */
  readonly?: boolean;
  /** 自动布局 */
  autoLayout?: boolean;
  /** 是否显示边框 */
  showBorder?: boolean;
  /** @deprecated 旧版 NLS 不适配当前 ESM 内核；内核保持英文，组件按钮由 YConfigProvider 控制。 */
  nls?: boolean;
  /** 应用内全屏的目标容器（选择器或元素），不使用浏览器全屏 */
  fullscreenTarget?: string | HTMLElement;
  /** 全屏时的 z-index 层级（默认 10000，确保能覆盖抽屉/弹窗） */
  fullscreenZIndex?: number;
  /** SQL 模式信息（用于表名/字段名提示） */
  sqlSchema?: SqlSchema | null;
  /** 是否启用 SQL 智能提示（默认 true） */
  sqlSuggest?: boolean;
  /** 是否在初始化完成后自动执行一次格式化（默认 true） */
  formatOnMount?: boolean;
  /** 初始化自动格式化生效语言列表（默认 ['sql']，可手动加入 'nginx'） */
  formatLanguages?: string[];
  /** 是否启用日志查看器模式（支持增量追加、滚动触底加载等） */
  logMode?: boolean;
  /** 日志模式下的最大保留行数（默认 10000），超出时自动删除头部旧日志 */
  maxLines?: number;
  /** 滚动触底检测阈值（行数），当距离底部小于此值时触发 scroll-end 事件（默认 50） */
  scrollThreshold?: number;
  /** 追加内容后是否自动滚动到底部（默认 true） */
  autoScroll?: boolean;
  /** 是否显示悬浮工具栏 (默认 true) */
  showToolbar?: boolean;
  /** 工具栏配置 */
  toolbarOptions?: {
    /** 是否启用复制 */
    copy?: boolean;
    /** 是否启用全屏 */
    fullscreen?: boolean;
    /** 是否启用下载 */
    download?: boolean;
  };
  /** 工具栏 Tooltip 配置（false 关闭） */
  toolbarTooltip?: boolean | YMonacoToolbarTooltipOptions;
  /** 应用内全屏切换过渡配置（false 关闭） */
  fullscreenTransition?: boolean | YMonacoFullscreenTransitionOptions;
}

export interface YMonacoExpose {
  /** 获取编辑器实例 */
  getInstance: () => any | null;
  /** 设置内容 */
  setValue: (value: string) => void;
  /** 插入文本（使用 snippet 机制） */
  insertText: (text: string) => void;
  /** 在光标处插入文本 */
  insertTextAtPosition: (text: string, context?: { editor?: any; monaco?: MonacoApi }) => void;
  /** 设置语言 */
  setLanguage: (lang: string) => void;
  /** 设置主题 */
  setTheme: (theme: string) => void;
  /** 切换只读 */
  toggleReadonly: (readonly?: boolean) => void;
  /** 切换“应用内全屏” */
  toggleFullscreen: () => void;
  /** 触发布局计算 */
  layout: () => void;
  /** 追加日志内容（日志模式专用） */
  appendContent: (text: string) => void;
  /** 清空日志内容（日志模式专用） */
  clearContent: () => void;
  /** 滚动到底部（日志模式专用） */
  scrollToBottom: () => void;
  /** 获取当前行数（日志模式专用） */
  getLineCount: () => number;
}

/** SQL 模式信息：用于智能提示 */
export interface SqlSchemaTable {
  /** 表名（可含 schema，如 schema.table） */
  name: string;
  /** 列清单 */
  columns: Array<{ name: string; type?: string; comment?: string }>; // 允许最小集
}

export interface SqlSchema {
  /** 可选的 schema 名称（如 "public"） */
  schema?: string;
  /** 表列表 */
  tables: SqlSchemaTable[];
}

export interface YMonacoDiffProps extends Omit<YMonacoProps, 'modelValue'> {
  /** 差异对比：原始内容 */
  original: string;
  /** 差异对比：修改后内容（v-model:value）*/
  value: string;
}

export interface YMonacoDiffExpose {
  /** 获取 DiffEditor 实例 */
  getInstance: () => any | null;
  /** 设置原始内容 */
  setOriginal: (val: string) => void;
  /** 设置修改后内容 */
  setValue: (val: string) => void;
  /** 切换语言 */
  setLanguage: (lang: string) => void;
  /** 切换主题 */
  setTheme: (theme: string) => void;
  /** 切换“应用内全屏” */
  toggleFullscreen: () => void;
  /** 触发布局 */
  layout: () => void;
}
