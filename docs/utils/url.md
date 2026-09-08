---
toc: content
---

## URL 解析 (getUrlData)

用来解析和获取当前的页面（或自定义）URL参数。

- 相比原生的 `URLSearchParams`，它兼容了前端常见的哈希路由模式（如 `/#/page?id=1`），能在 `hash` 和 `search` 前后可能都带有 query 字段的复合体中精准提取出所有的参数。
- 能够更健壮地处理参数内部包含特殊符号的情况，例如等于号 `=`（如 Base64 编码字符串）。
- 某单独一个参数由于业务问题导致乱码非法不能被 `decodeURIComponent` 解压时，整体的执行不会直接抛错崩溃，保证了其他参数能如常拿取。
- 支持传入忽略数组，直接过滤掉业务端不需要的动态系统级别随机生成的垃圾参数。

### 基础用法

获取当前系统页面地址栏中的参数。如果有覆盖的情况，`search` 的参数会覆盖 `hash` 内的参数。

<code src="./demos/url/basic.vue" title="基础获取"></code>

### 过滤特定参数 (支持数组)

在部分系统或者部分网关验证中，页面的每次跳转有时都会随机生成某些特殊的参数（例如 `_ex` 认证或是时间戳）。多数场景下你的业务系统并不需要它，甚至如果你想原样提取参数拿给下一级接口，这些随机参数会产生干扰，此时可以主动利用此工具过滤掉它们。

<code src="./demos/url/exclude.vue" title="忽略指定参数白名单 (exclude)"></code>

### 自定义 URL 或 String 参数解析

当你的系统需要解析后端的跳转地址、其他第三方带特定拼接格式的 URL 内容时，无需从原生的 `window.location` 里面取，直接利用传参即可。

<code src="./demos/url/custom.vue" title="自定义任意字符串解析"></code>

### API

#### getUrlData(url?, excludeKeys?)

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| url | `string` | 否 | - | 自定义需要解析的完整 URL 或 query 字符串。如果不传，则默认解析当前 `window.location` 的内容。 |
| excludeKeys | `string[]` | 否 | `[]` | 过滤并需要被排除忽略解析提取的特定 query key 数组。例如在参数列表中不想提取 `token` 和 `_ex`，可传入 `['token', '_ex']` |

返回：`Record<string, string>` 组装完整的字典对象。
