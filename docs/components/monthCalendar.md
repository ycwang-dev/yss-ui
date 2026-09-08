---
title: MonthCalendar 月日历
description: 支持受控月份、日期边界、键盘导航、双击、右键菜单和日期插槽的月视图组件
route: /components/month-calendar
toc: content
---

# MonthCalendar 月日历

`YMonthCalendar` 基于 Dayjs 提供独立的“选中日期”和“展示月份”状态，适合业务日历、排班、任务计划等月视图场景。
组件默认使用 `glass` 视觉预设；需要嵌入低装饰业务容器时可切换为 `plain`。

## 何时使用

- 需要展示完整月份并允许选择日期。
- 需要为日期扩展状态、标签、双击或右键菜单。
- 需要限制合法日期范围，或禁用部分日期。

## 代码演示

### 基础用法

<code src="./demos/month-calendar/basic.vue"></code>

### 自定义单元格内容

<code src="./demos/month-calendar/custom-cell.vue"></code>

### 连续假期日历

<code src="./demos/month-calendar/continuous-holiday/index.vue"></code>

### 右键菜单

<code src="./demos/month-calendar/context-menu.vue"></code>

### 禁用日期与范围

<code src="./demos/month-calendar/disabled.vue"></code>

### 外观与尺寸

<code src="./demos/month-calendar/appearance.vue"></code>

### 双击与事件监听

<code src="./demos/month-calendar/events.vue"></code>

### 头部插槽增强

可以通过 `header-left`、`header-right-before` 和 `header-right-after` 插槽在默认头部的基础上添加自定义内容（例如右侧的刷新按钮），且不会影响自带的“上个月、今天、下个月”三个按钮。

<code src="./demos/month-calendar/header-slots.vue"></code>

## API

### Props

Vue 模板推荐使用中划线属性名；JavaScript、JSX 和类型定义使用驼峰属性名。文档同时列出两种写法，站内搜索任一种名称都能命中。

| 参数（驼峰） | 模板属性（中划线） | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- | --- |
| modelValue | model-value / `v-model` | 受控选中日期 | `Dayjs` | - |
| defaultValue | default-value | 非受控默认选中日期 | `Dayjs` | - |
| month | month / `v-model:month` | 受控展示月份 | `Dayjs` | - |
| defaultMonth | default-month | 非受控默认月份 | `Dayjs` | 当前月 |
| loading | loading | 加载状态并阻断交互 | `boolean` | `false` |
| validRange | valid-range | 可选择日期范围 | `[Dayjs, Dayjs]` | - |
| disabledDate | disabled-date | 自定义禁用日期 | `(date: Dayjs) => boolean` | - |
| showHeader | show-header | 展示默认头部 | `boolean` | `true` |
| appearance | appearance | 视觉预设 | `'glass' \| 'plain'` | `'glass'` |
| cellLayout | cell-layout | 日期单元格布局；`grid` 适合连续日程或假期条 | `'card' \| 'grid'` | `'card'` |
| responsive | responsive | 根据组件容器宽度自动压缩日期高度、间距和头部操作 | `boolean` | `true` |
| fillHeight | fill-height | 父容器具有明确高度时，将六行日期撑满剩余可用高度 | `boolean` | `false` |
| headerActions | header-actions | 分别控制上一月、今天、下一月按钮显隐 | `{ previous?: boolean; today?: boolean; next?: boolean }` | 全部展示 |
| showOutsideDays | show-outside-days | 展示跨月日期 | `boolean` | `true` |
| navigateOnOutsideSelect | navigate-on-outside-select | 选择跨月日期时切换月份 | `boolean` | `true` |
| selectOnContextMenu | select-on-context-menu | 右键时先选中日期 | `boolean` | `true` |
| contextMenuEnabled | context-menu-enabled | 显式控制是否启用右键菜单插槽 | `boolean` | 根据插槽自动判断 |
| cellHeight | cell-height | 日期单元格高度，数值最小为 64 | `number \| string` | `88` |
| todayText | today-text | 今天徽标文案及圆形日期标记提示文本 | `string` | `今天` |
| todayIndicator | today-indicator | 今天标记展示方式 | `'date' \| 'badge' \| 'both'` | `'date'` |
| cellClassName | cell-class-name | 根据日期上下文扩展单元格类名 | `(context) => string \| string[] \| Record<string, boolean>` | - |
| cellStyle | cell-style | 根据日期上下文扩展单元格样式 | `(context) => CSSProperties` | - |
| rootStyle | root-style | 根节点自定义样式 | `CSSProperties` | - |
| loadingTip | loading-tip | 默认加载提示文案 | `string` | `加载中...` |

### Events

| 事件（JavaScript） | 模板监听 | 参数 | 说明 |
| --- | --- | --- | --- |
| update:modelValue | update:model-value / `v-model` | `(value: Dayjs)` | 选中日期变化 |
| update:month | update:month / `v-model:month` | `(month: Dayjs)` | 展示月份变化 |
| select | select | `(payload: YMonthCalendarSelectPayload)` | 日期完成选择 |
| cell-click | cell-click | `(payload: YMonthCalendarPointerPayload)` | 单击日期 |
| cell-dblclick | cell-dblclick | `(payload: YMonthCalendarPointerPayload)` | 双击日期 |
| cell-contextmenu | cell-contextmenu | `(payload: YMonthCalendarPointerPayload)` | 右键日期 |
| panel-change | panel-change | `(payload: YMonthCalendarPanelChangePayload)` | 月份面板变化 |

### Slots

| 插槽 | 作用域 | 说明 |
| --- | --- | --- |
| header | `YMonthCalendarHeaderContext` | 完全自定义头部和月份操作 |
| header-left | `{ month: Dayjs }` | 自定义默认头部左侧月份展示区域 |
| header-right-before | `{ month: Dayjs }` | 在默认头部操作按钮组之前插入内容 |
| header-right-after | `{ month: Dayjs }` | 在默认头部操作按钮组之后插入内容 |
| weekday | `YMonthCalendarWeekdayContext` | 自定义星期表头 |
| date-cell | `YMonthCalendarCellContext` | 自定义日期单元格主体 |
| date-cell-extra | `YMonthCalendarCellContext` | 在默认日期内容后追加内容 |
| context-menu | `YMonthCalendarContextMenuContext` | 自定义右键菜单，包含日期上下文和 `close` |
| loading | - | 自定义加载内容 |

### Expose

通过模板 ref 获取组件实例后可调用以下方法。

| 方法 | 类型 | 说明 |
| --- | --- | --- |
| focusDate | `(date: Dayjs) => Promise<void>` | 聚焦指定日期 |
| closeContextMenu | `() => void` | 关闭右键菜单 |
| goToday | `() => void` | 切换并选中今天 |

### 类型说明

以下类型均可从 `@yss-ui/components` 导入。

| 类型 | 字段 |
| --- | --- |
| `YMonthCalendarCellContext` | `date`、`dateKey`、`isToday`、`isSelected`、`isCurrentMonth`、`isDisabled` |
| `YMonthCalendarPointerPayload` | 继承日期单元格上下文，并增加原始 `event: MouseEvent` |
| `YMonthCalendarSelectPayload` | 继承日期单元格上下文，并增加 `source: 'mouse' \| 'keyboard' \| 'contextmenu' \| 'header'` |
| `YMonthCalendarPanelChangePayload` | `month: Dayjs`、`mode: 'month'` |
| `YMonthCalendarHeaderContext` | `month`、三个禁用状态，以及 `previous`、`next`、`today` 操作方法 |
| `YMonthCalendarWeekdayContext` | `index`、`label` |
| `YMonthCalendarContextMenuContext` | 继承日期单元格上下文，并增加 `close()` |

## 行为说明

- 日期卡片默认保持适合状态和标签内容的横向比例，不强制正方形。
- `cellLayout="grid"` 会取消日期卡片之间的间距并使用连续分隔线，单元格内容仍保留默认内边距。
- 默认根据组件容器宽度压缩日期高度与间距，日期高度最低为 64px；`responsive="false"` 可恢复 840px 固定内容宽度和横向滚动。
- `fillHeight=true` 时组件高度为 `100%`，六行日期会均分头部和星期栏之外的剩余高度；父容器必须具有明确高度。
- 日期网格始终完整渲染六行；固定组件高度不足时，内容区域内部滚动而不裁切。
- `validRange` 起止值传反时会自动交换；今天不可选时默认头部的今天按钮同步禁用。
- `header` 插槽上下文包含 `previousDisabled`、`nextDisabled` 和 `todayDisabled`。
- 默认使用主题主色圆形日期表示今天，选中日期仍使用单元格边框；可通过 `todayIndicator` 切换为文字徽标或同时展示。
- 自定义 `date-cell` 插槽需要根据作用域中的 `isToday` 自行渲染今天标记，文本语义也由插槽实现方控制。

### 键盘操作

- 方向键移动日期焦点。
- `Home/End` 移动到本周开始或结束。
- `PageUp/PageDown` 切换月份。
- `Enter/Space` 选择日期。
- `Escape` 关闭右键菜单。
