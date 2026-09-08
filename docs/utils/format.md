---
toc: content
---

## 日期格式化

提供两类常用能力：

- `formatDate(date, format)`：按模板格式化日期，默认 `YYYY-MM-DD HH:mm:ss`
- `formatDateRelative(date)`：智能相对时间展示（今天/昨天/今年/跨年）

### 模板格式化 formatDate

<code src="./demos/format/template.vue" ></code>

### 智能相对时间 formatDateRelative

<code src="./demos/format/relative.vue" title="今天/昨天/今年/跨年 智能展示"></code>

### API

#### formatDate(date, format?)

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| date | `Date | string | number` | 是 | - | 可被 `Date` 解析的值 |
| format | `string` | 否 | `'YYYY-MM-DD HH:mm:ss'` | 模板，支持 `YYYY/MM/DD HH:mm:ss` 等 |

返回：`string`

#### formatDateRelative(date)

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| date | `Date | string | number` | 是 | - | 可被 `Date` 解析的值 |

返回（规则）：

- 今天：`今天 HH:mm`
- 昨天：`昨天 HH:mm`
- 今年：`M/D HH:mm`
- 其他年份：`YYYY/M/D HH:mm`


