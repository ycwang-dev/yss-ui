---
title: 工具库更新日志
nav:
  title: 更新日志
  path: /changelog/utils
toc: content
---

# 🛠 工具库更新日志

YSS UI 工具库（`@yss-ui/utils`）的版本更新记录。

---

## v1.0.6

`2026-05-07`

### 🐛 Bug Fixes

- **Utils**: 优化 `handleBlobResponse` 和 `getFileNameFromContentDisposition` 逻辑。支持自动识别 `filename*` (RFC 5987) 和 `filename` 响应头。现在调用 `handleBlobResponse` 无需再手动传入 `hasUtf8Encoding` 参数。

---

## v1.0.5

`2026-04-15`

### ✨ Features

- **Utils**: 优化内部工具函数导出结构。

---

## v1.0.4

`2026-03-09`

### ✨ Features

- **Utils**: 增加 `getUrlData` 方法，支持健壮的 URL 参数解析（兼容 search/hash 模式），并提供 `excludeKeys` 参数用于过滤不需要的业务参数。

---

## v1.0.3

`2026-03-03`

### ✨ Features

- **Utils**: 增加 `copyToClipboard` 方法，支持兼容 HTTPS/Localhost 安全上下文与普通 HTTP 降级的文本复制能力。

---

## v1.0.2

`2025-11-15`

### 🐛 Bug Fixes

- **Utils**: 增加 `download` 方法业务场景示例，Table demo 增加异常数据逻辑。[`553fa46`](https://github.com/yss-ui/yss-ui/commit/553fa46)
