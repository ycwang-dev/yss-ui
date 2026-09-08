---
title: Button 按钮
description: 基于 Ant Design Vue Button 封装的企业级按钮组件
toc: content
---

# Button 按钮

基于 Ant Design Vue `Button` 的企业级封装，统一主题与权限能力，提供一致的 API 与用法体验。

## 何时使用

- 标记并触发一个动作（或一组动作）。
- 需要统一主题色和交互规范。
- 需要简化权限控制（隐藏/禁用）。

## 代码演示

### 尺寸与块级

<code src="./demos/button/size.vue"></code>

### 加载/禁用/幽灵/危险

<code src="./demos/button/states.vue"></code>

### 权限按钮（localStorage）

统一用 `YButton` 传入 `permissionCode` 即可：

<code src="./demos/button/permission.vue"></code>

<code src="./demos/button/auth-basic.vue"></code>

### 权限下拉（localStorage）

<code src="./demos/button/auth-dropdown.vue"></code>

## API

YButton 将未声明属性透传给 Ant Design Vue Button，AuthorityDropdown 则通过 `buttonProps` 明确透传按钮属性。当前仓库锁定 `ant-design-vue@4.2.6`；下表只列 YSS 自有契约与高频透传项，其他能力以对应版本的上游文档为准。

### YButton Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| theme | `'primary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | 主题类名扩展，便于统一定制样式（不会改变 AntD 原始外观，需结合 CSS 变量使用）。 |
| type | `'default' \| 'primary' \| 'dashed' \| 'link' \| 'text'` | `'default'` | 同 AntD Button。 |
| size | `'small' \| 'middle' \| 'large'` | `'middle'` | 同 AntD Button。 |
| loading | `boolean \| { delay?: number }` | `false` | 同 AntD Button，支持延迟。 |
| disabled | `boolean` | `false` | 同 AntD Button。 |
| danger | `boolean` | `false` | 同 AntD Button。 |
| ghost | `boolean` | `false` | 同 AntD Button。 |
| shape | `'circle' \| 'round'` | `-` | 同 AntD Button。 |
| block | `boolean` | `false` | 同 AntD Button。 |
| htmlType | `'button' \| 'submit' \| 'reset'` | `'button'` | 同 AntD Button。 |
| href | `string` | `-` | 透传给 AntD，用作外链（渲染为 `<a>`）。 |
| target | `string` | `-` | 透传给 AntD，配合 `href` 使用。 |
| permissionCode | `string` | `-` | 按钮权限码；传入则启用权限逻辑。 |
| fallback | `'hide' \| 'disable'` | `'hide'` | 无权限时策略：隐藏或禁用。 |
| modifiers | `Array<'stop' \| 'prevent'>` | `[]` | 点击修饰：阻止冒泡/默认。 |

### YButton Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| click | `(e: MouseEvent)` | 点击事件（当 `disabled/loading` 时不会触发）。 |

### YButton Slots

| 插槽名 | 说明 |
| --- | --- |
| default | 按钮内容。 |
| icon | 图标插槽（已转发至 AntD `#icon`）。 |

### AuthorityDropdown 权限下拉

`AuthorityDropdown` 是组件包的公开具名导出，用于按权限过滤下拉操作。全量安装组件库时还会注册全局别名 `YDropdown`，但 `YDropdown` **不是** `@yss-ui/components` 的具名导出，按需导入必须使用 `AuthorityDropdown`。

#### AuthorityDropdown Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `permissionCode` | `string` | - | 下拉按钮权限码；不传时不限制按钮权限。 |
| `dropdownItems` | `AuthorityDropdownItem[]` | `[]` | 下拉操作列表；每项可通过 `permissionCode` 单独控制权限。 |
| `options` | `{ label?: string; value?: string }` | `{ label:'text', value:'id' }` | 指定操作项的显示字段和唯一值字段。 |
| `buttonProps` | `Record<string, any>` | `{}` | 透传给 Ant Design Vue Button 的属性。 |
| `fallback` | `'hide' \| 'disable'` | `'hide'` | 按钮无权限时隐藏或禁用。 |

#### AuthorityDropdown Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| `command` | `(record: AuthorityDropdownItem)` | 点击有权限的下拉操作后触发，返回原始操作项。 |

#### AuthorityDropdown Slots

| 插槽名 | 说明 |
| --- | --- |
| `default` | 自定义按钮内容；未提供时根据 `permissionCode` 对应的权限信息显示按钮名称。 |

### Expose

YButton 与 AuthorityDropdown 均未暴露实例方法。

### Types

`ButtonProps`、`AuthorityDropdownProps` 和 `AuthorityDropdownItem` 均可从 `@yss-ui/components` 进行类型导入。

### 兼容别名

全量安装时注册的 `YDropdown` 仅是 AuthorityDropdown 的全局兼容别名，不属于具名导出；新代码必须具名导入 `AuthorityDropdown`。

### 与 Ant Design Vue 的对齐清单

- Props：已对齐 AntD Button 常用属性，并新增 `theme`。非声明式属性通过 `$attrs` 透传。
- Slots：支持默认插槽与 `#icon` 插槽（向下转发至 AntD）。
- Events：对齐 AntD 的 `click` 行为；`disabled/loading` 下不触发。
- 跳转能力：支持 `href/target` 透传，渲染为链接按钮。
