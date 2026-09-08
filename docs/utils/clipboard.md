---
toc: content
---

## 文本复制

提供高度兼容的剪贴板复制能力：

- `copyToClipboard(text)`：自动兼容 `HTTPS/localhost` 安全上下文（优先调用 `navigator.clipboard.writeText`）与降级普通 `HTTP` 跨域环境（备用 `document.execCommand('copy')`）。

### 基础用法

<code src="./demos/clipboard/basic.vue" title="基础文本复制"></code>

### API

#### copyToClipboard(text)

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| text | `string` | 是 | - | 需要复制到系统剪贴板的纯文本内容 |

**返回：** `Promise<boolean>`

- `true`：复制操作执行成功。
- `false`：文本为空或由于浏览器严格策略限制导致复制失败。
