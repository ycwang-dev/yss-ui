---
toc: content
---

## 认证相关

### 清除本地认证信息 clearAuthInfo

清空本地与登录态相关的多组 `localStorage` 键值（`access_token`、`token_expires`、`user_info`、`auth_routes`、`is_reset`、`header_spaces_routes`、`active_space_code`、`yss_tabs_v1`、`auth_btns`）。

<code src="./demos/auth/clear.vue" title="一键清理认证缓存（演示写入与清理）"></code>

> 注意：函数仅做本地清理，不会发起登出请求；如需服务端登出，请在业务层自行补充。


