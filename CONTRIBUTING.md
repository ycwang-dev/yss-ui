## YSS-UI 贡献指南

本项目使用 Vue 3 + TypeScript + Vite，基于 vxe-table 4.16 封装。请在提交任何代码前先阅读并遵循以下规范。

### 架构与目录
- 组件一律采用 compositon hooks 拆分：在 `packages/components/src/<component>/hooks/` 下组织单一职责的 hooks，组件 `.vue` 仅做组合与渲染。
- 页面层按如下结构组织：
```
views/PageName/
├── index.vue
├── constant.ts
├── type.ts
├── mock.ts
├── index.less
├── components/
└── hooks/
```
- 文档与示例：位于 `docs/components`；新增/修改配置项必须同步更新 API 表与 demos。

### TypeScript 与注释
- TypeScript 必写，导出/公共 API 显式类型；允许局部可推断类型不重复标注。
- 注释统一使用 JSDoc：`/** ... */`，禁止用 `//` 作为 API 注释。对 `defineProps/defineEmits` 字段、方法、hooks 的参数与返回添加 JSDoc，以便悬浮提示。
- 命名语义化：函数为动词短语、变量为名词短语；避免 1-2 字母短名。

### vxe-table 4.19 规范
- props 透传由 `useXTableProps` 统一规范：
  - `rowConfig/cellConfig/columnConfig/editConfig/rowDragConfig/scrollY/tooltipConfig` 聚合于此。
  - `editConfig.autoClear=false`；`showOverflow/showHeaderOverflow` 的 `true` 解释为 `'tooltip'`；默认 `scrollY: { enabled: true, gt: 100 }`。
  - 开启行拖拽时必须设置 `row-config.drag: true`。
- 事件使用 4.16 API：`edit-closed`、`row-dragend` 等。
- Tooltip 文本通过 `tooltipConfig.contentMethod` 返回纯文本或 `null`。

### 主题与依赖
- 禁止硬编码颜色，统一使用 CSS 变量（如 `var(--primary-color)`）。
- 弹层/下拉统一 `getPopupContainer: () => document.body`，避免被滚动容器裁剪。
- Dumi demos 统一从 `@yss-ui/components` 导入，不引用源码路径。

### hooks 设计
- 单一职责、输入输出清晰，必要时复用 `packages/components/src/table/hooks/` 中通用 hooks（如 `useVxeInstall`、`useActionConfig`）。
- watch 指明依赖与 `deep` 语义；高频/异步可使用 `vue-hooks-plus` 的防抖/节流。
- 错误/校验逻辑集中到 `useValidation`：行弱 ID、错误 Map、校验规则、`validate()` 暴露以及 tooltip 文本清洗。

### 文档与示例同步要求
- 新增或修改以下任一项，必须同步更新：
  - Props/Emits/插槽/暴露方法：更新 `docs/components/<component>.md` 中的 API 表。
  - 新增/更新示例到 `docs/components/demos/<component>/` 覆盖变更场景（基础、校验、字典转换、拖拽、分页、直编、大数据）。
  - 如为破坏性改动，文档注明迁移说明与对照示例。

### 提交前检查
- 运行 linter，修复类型与格式问题。
- 自查：是否遵循 hooks 拆分、JSDoc 注释齐全、vxe 4.16 API 对齐、主题色未硬编码、文档与 demos 已同步。

### 代码片段规范（示例）
```ts
/** 分页配置 */
pagination: {
  type: Object as PropType<{
    current: number;
    pageSize: number;
    total?: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    pageSizeOptions?: (number | string)[];
    remote?: boolean;
  }>,
  default: () => ({ current: 1, pageSize: 20, total: 0, showSizeChanger: true, showQuickJumper: true, pageSizeOptions: ['10','20','50','100'], remote: false }),
}
```


