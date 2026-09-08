---
title: 文件导入 FileImport
route: /components/file-import
toc: content
---

# 文件导入 FileImport

基于 Ant Design Vue Modal + Upload.Dragger 的文件导入弹窗组件，兼容旧版 MidBizFileImport 的核心 API，支持两步导入流程（选择文件 → 结果回显/确认导入），并提供丰富插槽。

## 代码演示

### 基础用法

<code src="./demos/file-import/basic.vue" title="基础导入流程：选择 → 下一步 → 确认/失败下载"></code>

### 多文件与自定义类型

<code src="./demos/file-import/multiple.vue" title="多文件 + 仅 CSV"></code>

### 失败数据下载与自定义结果插槽

<code src="./demos/file-import/result-slot.vue" title="自定义结果插槽 + 左侧附加按钮"></code>

### 按钮显隐与文案配置

<code src="./demos/file-import/custom-config.vue" title="隐藏下载模板 + 自定义拖拽文案与按钮文案"></code>

### 与 Formily 结合

<code src="./demos/file-import/formily.vue" title="Schema 内按钮触发导入"></code>

## API

YFileImport 当前基于 `ant-design-vue@4.2.6`。Modal 与 Upload 的扩展配置分别只通过 `modalProps`、`uploadProps` 透传，其他未声明顶层属性不属于 YFileImport 契约。

### YFileImport Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `boolean` | `false` | 弹窗可见性（受控） |
| title | `string` | `导入` | 弹窗标题 |
| width | `string \| number` | `50%` | 弹窗宽度 |
| fileTypeList | `string[]` | `['xls','xlsx','csv']` | 文件类型集合，用于推导 `accept`（如 `.xls,.xlsx,.csv`） |
| accept | `string` | `''` | 指定 `accept`，优先于 `fileTypeList` |
| multiple | `boolean` | `false` | 是否支持多文件 |
| drag | `boolean` | `true` | 是否启用拖拽上传（Upload.Dragger 固定拖拽，保留开关以兼容旧版） |
| action | `string` | `''` | Upload 直传地址（若使用直传/自定义上传可通过 `uploadProps` 配置） |
| autoUpload | `boolean` | `false` | 兼容字段；受控模式下不触发自动上传 |
| loadings | `string[]` | `[]` | 外部传入 loading 标识集合；组件内部按字符串命名控制按钮 loading |
| importResult | `{ successkey?: string; failkey?: string; success?: number; fail?: number; total?: number }` | `{ successkey: '1', failkey: '', success: 2, fail: 0, total: 2 }` | 导入结果，用于控制“确认导入/下载失败”按钮显隐与数字显示 |
| modalProps | `Record<string, any>` | `{}` | 透传到 `Modal` 的属性（如 `maskClosable`、`centered` 等） |
| uploadProps | `Record<string, any>` | `{}` | 透传到 `Upload.Dragger` 的属性（如 `customRequest`、`headers` 等） |
| showDownloadTemplate | `boolean` | `true` | 是否展示“下载导入模板”按钮 |
| showCancel | `boolean` | `true` | 是否展示“取消”按钮 |
| showUploadTip | `boolean` | `true` | 是否展示上传区底部文件类型提示 |
| showNextStep | `boolean` | `true` | 是否展示“下一步”按钮 |
| showLastStep | `boolean` | `true` | 是否展示“上一步”按钮 |
| draggerText | `string` | `''` | 拖拽区主文案；传入后覆盖默认“将文件拖到此处，或 点击导入” |
| texts | `FileImportTexts` | `{}` | 按钮与校验提示文案配置，见下表 |

#### texts 字段

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| downloadTemplate | `下载导入模板` | 下载模板按钮文案 |
| cancel | `取消` | 取消按钮文案 |
| nextStep | `下一步` | 下一步按钮文案 |
| lastStep | `上一步` | 上一步按钮文案 |
| confirmImport | `确认导入` | 确认导入按钮文案 |
| exportErrorData | `下载失败数据` | 下载失败数据按钮文案 |
| uploadTip | `只能导入 xls/xlsx/csv 文件`（按 `fileTypeList` 拼接） | 上传区底部提示；传 `''` 时不展示提示行 |
| emptyFileMessage | `请选择文件` | 未选择文件时的校验提示 |
| singleFileMessage | `一次只能上传一个文件` | 单文件模式选择多个文件时的校验提示 |
| invalidFileTypeMessage | `不支持该文件类型，请选择{types}文件` | 文件类型不匹配时的校验提示 |

说明：组件内部阻止了 Upload 的默认上传（`beforeUpload` 恒为 `false`）。如需直传，请在 `uploadProps.customRequest` 中实现。底部左侧区域在 `showDownloadTemplate=false` 且未使用 `footerLeft` 插槽时会自动隐藏；仅右侧按钮时底栏右对齐。

### Events

| 事件名 | 参数 | 说明 |
| --- | --- | --- |
| update:modelValue | `boolean` | 可见性变更 |
| finalImport | `{ loadingName: 'finalImport', fileList, close }` | 点击“确认导入”时触发 |
| downloadTemplate | `{ loadingName: 'downloadTemplate', fileList, close }` | 点击“下载导入模板”时触发 |
| exportErrorData | `{ loadingName: 'exportErrorData', fileList, close }` | 点击“下载失败数据”时触发 |
| lastStep | `{ close }` | 点击“上一步”时触发 |
| nextStep | `{ loadingName: 'nextStep', fileList, close }` | 点击“下一步”且通过校验后触发 |

### 插槽

| 插槽名 | 说明 |
| --- | --- |
| uploader | 覆盖上传区域，作用域 `{ fileList, accept, multiple }` |
| result | 覆盖结果展示区域，作用域 `{ result }` |
| footerLeft | 底部左侧附加按钮/内容 |
| footerRight | 底部右侧附加按钮/内容 |

### 暴露方法

| 方法 | 说明 |
| --- | --- |
| open() | 打开弹窗 |
| close() | 关闭弹窗 |
| reset() | 重置内部状态（清空文件列表并回到第一步） |

### Types

`YFileImportProps`、`FileImportTexts` 与 `ImportResult` 可从 `@yss-ui/components` 进行类型导入。

### 兼容说明

`drag` 与 `autoUpload` 为历史兼容字段：当前上传区固定使用 Upload.Dragger，组件也会阻止默认上传；新代码需要直传时应使用 `uploadProps.customRequest`。

## 设计说明

- 组件默认使用主题变量 `--yss-color-primary-6` 等，不硬编码颜色。
- 弹窗、下拉、提示等浮层统一 `getContainer: () => document.body`，避免被滚动容器裁剪。
- 若传入 `accept` 则不会再做扩展名校验；否则按 `fileTypeList` 校验。
