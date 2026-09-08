---
toc: content
---

# SplitPane 分割面板

可调节宽度的侧边栏分割布局组件，常用于左侧树/菜单、右侧内容的布局场景。

## 典型场景：Tree + Table

左侧资源树，右侧数据表格的经典后台管理布局。

<code id="tree-table-layout" src="./demos/split-pane/tree-table-layout/index.vue"></code>

## 上下折叠与展开

通过 `direction="vertical"` 切换为上下分割，建议配合 `v-model:topHeight` 受控上侧高度；上侧区域支持拖拽调高和折叠/展开。

<code id="vertical-collapse" src="./demos/split-pane/vertical-collapse/vertical-collapse.vue"></code>

## 快捷按钮组（vertical）

当 `direction="vertical"` 且 `showVerticalQuickActions=true` 时，分割线显示“隐藏上侧 / 恢复初始高度 / 隐藏下侧”三个快捷按钮，并自动隐藏默认折叠按钮。

示例中：

- 上侧区域：高度自适应表格
- 下侧区域：高度自适应折线图

<code id="vertical-quick-actions" src="./demos/split-pane/vertical-quick-actions/index.vue"></code>

## 嵌套布局：Tree + Vertical Quick Actions

外层为左右分割（左侧树，右侧内容），并使用 `collapse-animation="transform"`、`resize-mode="deferred"` 展示重内容拖拽；右侧再嵌套一个 `direction="vertical"` 的分割面板，上侧为高度自适应表格，下侧为高度自适应折线图，并开启 `showVerticalQuickActions=true`。

<code id="nested-vertical-quick-actions" src="./demos/split-pane/nested-vertical-quick-actions/index.vue"></code>

## 禁用拖动分隔线

通过 `:draggable="false"` 禁用分割线拖拽，仅保留折叠/展开能力。

<code id="drag-disabled" src="./demos/split-pane/drag-disabled/drag-disabled.vue"></code>

## 重内容平滑折叠与拖拽

当任一面板包含千级树、宽表格、编辑器或图表时，建议同时设置 `collapse-animation="transform"` 和 `resize-mode="deferred"`：折叠时通过合成层位移完成视觉过渡；拖拽时只移动代理分割线，松手后才提交一次真实尺寸，避免 `width` / `height` 每帧变化导致重内容反复布局。

<code id="heavy-content" src="./demos/split-pane/heavy-content/index.vue"></code>

- `size`：默认兼容模式，使用 `width` / `height` 过渡，适合普通内容。
- `transform`：重内容模式，适合树、宽表格、编辑器和复杂图表；过渡期间折叠按钮会暂时锁定，外部受控状态变化会在当前动画结束后执行最新目标。
- `none`：无动画性能兜底，一次性提交布局。
- 系统启用 `prefers-reduced-motion: reduce` 时，组件会自动按 `none` 处理。
- `resizeMode="realtime"`：默认兼容模式，拖动时持续更新真实尺寸，适合轻量内容。
- `resizeMode="deferred"`：重内容拖拽模式，拖动时显示代理线，释放后更新一次真实尺寸；`update:leftWidth`、`update:topHeight` 和 `resize` 也只在释放时触发。

`destroyOnCollapse` 只决定动画完成后是否卸载面板内容，不能减少折叠过程中的布局开销。需要保留树的展开、勾选或滚动状态时，应保持默认值 `false`。

## API

### YSplitPane Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| direction | 分割方向 | `'horizontal' \| 'vertical'` | `'horizontal'` |
| initialWidth | 初始左侧宽度（px） | `number` | `280` |
| initialHeight | 初始上侧高度（px，仅在 `direction="vertical"` 生效） | `number` | `200` |
| leftWidth | 左侧宽度（受控） | `number` | - |
| topHeight | 上侧高度（受控，仅在 `direction="vertical"` 生效） | `number` | - |
| minWidth | 左侧最小宽度（px） | `number` | `200` |
| maxWidth | 左侧最大宽度（px） | `number` | `480` |
| minHeight | 上侧最小高度（px，仅在 `direction="vertical"` 生效） | `number` | `200` |
| maxHeight | 上侧最大高度（px，仅在 `direction="vertical"` 生效） | `number` | `400` |
| collapsible | 是否可折叠 | `boolean` | `true` |
| draggable | 是否允许拖动分割线 | `boolean` | `true` |
| resizeMode | 拖拽调整尺寸模式；重内容场景推荐 `deferred` | `'realtime' \| 'deferred'` | `'realtime'` |
| showVerticalQuickActions | 是否启用 vertical 快捷按钮组（隐藏上侧/恢复/隐藏下侧） | `boolean` | `false` |
| collapsed | 折叠状态（受控） | `boolean` | `false` |
| destroyOnCollapse | 折叠动画结束后是否卸载左侧/上侧内容；默认仅隐藏内容以保留内部状态 | `boolean` | `false` |
| collapseAnimation | 折叠动画模式；重内容场景推荐 `transform` | `'size' \| 'transform' \| 'none'` | `'size'` |
| gutterSize | 分割线尺寸（px） | `number` | `6` |
| storageKey | 本地存储 key，用于持久化尺寸 | `string` | - |

> `destroyOnCollapse` 只控制折叠后的内容保留策略：`false` 会在动画结束后隐藏内容并保留组件状态，`true` 会卸载内容以减少重 DOM 常驻开销。若左侧树或列表数据量很大，仍应在业务层设置 `height` 或虚拟滚动配置；它与 `collapseAnimation` 相互独立。

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:leftWidth | 左侧宽度更新时触发 | `(width: number)` |
| update:topHeight | 上侧高度更新时触发 | `(height: number)` |
| update:collapsed | 折叠状态更新时触发 | `(collapsed: boolean)` |
| resize | 尺寸调整时触发；`realtime` 拖动中节流触发，`deferred` 在释放时触发一次 | `(payload: { size: number; width?: number; height?: number })` |
| toggle | 点击折叠/展开按钮时触发 | `(collapsed: boolean)` |

### Slots

| 插槽名 | 说明 |
| --- | --- |
| left | 左侧面板内容（horizontal 模式） |
| right | 右侧面板内容（horizontal 模式） |
| top | 上侧面板内容（vertical 模式） |
| bottom | 下侧面板内容（vertical 模式） |

### Expose

YSplitPane 当前没有公开实例方法。

### Types

`YSplitPaneProps`、`YSplitPaneEmits`、`YSplitPaneCollapseAnimation` 与 `YSplitPaneResizeMode` 可从 `@yss-ui/components` 进行类型导入。
