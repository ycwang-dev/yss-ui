---
toc: content
---

## 文件下载

包含三种常见下载方式：

- `handleBlobResponse(data, headers)`：从接口 `blob` 响应解析文件名并下载（支持 `filename*` 和 `filename`）
- `downloadFileStream(stream, fileName)`：将二进制流下载为文件
- `downloadFileFromUrl(url, fileName?)`：直接从 URL 下载

### 从接口响应下载（带文件名解析）

<code src="./demos/download/handle-blob.vue" title="解析 Content-Disposition 并下载"></code>

#### 真实 API 调用示例

<code src="./demos/download/api-example.vue" title="完整的 API 文件下载流程"></code>

### 下载 Blob 流

<code src="./demos/download/stream.vue" title="下载内存中的二进制数据"></code>

### 从 URL 直接下载

<code src="./demos/download/url.vue" title="从 URL 下载，支持自定义文件名"></code>

### API

#### handleBlobResponse(data, headers, hasUtf8Encoding?)

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| data | `BlobPart` | 是 | - | 二进制数据 |
| headers | `Record<string, string>` | 是 | - | 响应头（支持 AxiosHeaders 对象） |
| hasUtf8Encoding | `boolean` | 否 | `false` | **已弃用**。现已支持自动识别 `filename*` 和 `filename` |

#### downloadFileStream(stream, fileName)

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| stream | `BlobPart` | 是 | 二进制数据 |
| fileName | `string` | 是 | 下载文件名（包含后缀） |

#### downloadFileFromUrl(url, fileName?)

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| url | `string` | 是 | 文件 URL（支持 data:） |
| fileName | `string` | 否 | 自定义文件名（未提供时由浏览器决定） |


