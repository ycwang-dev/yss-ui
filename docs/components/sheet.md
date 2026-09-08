---
toc: content
---

# Sheet 协同表格

YSheet 是基于 [Univer](https://univer.ai/) 封装的电子表格组件，提供类似 Excel 的编辑体验。

## 基础用法

<code id="demo-sheet-basic" src="./demos/sheet/basic/index.vue"></code>

## 只读与扩展 Preset

<code id="demo-sheet-advanced" src="./demos/sheet/advanced/index.vue"></code>

## API

YSheet 的 `config`、`extraPresets`、`extraPlugins` 与 `extraLocales` 是明确的 Univer 扩展边界；未声明的顶层属性不会自动透传为 Univer 配置。

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 工作簿数据，支持 v-model 双向绑定 | `IWorkbookData` | - |
| height | 容器高度 | `string \| number` | `'100%'` |
| locale | 核心引擎语言，缺省继承 YConfigProvider；原生切换保留工作簿 | `'zh-CN' \| 'zh-TW' \| 'en-US'` | 继承组件语言 |
| darkMode | 是否启用暗黑模式 | `boolean` | `false` |
| config | Univer 核心配置 (IUniverSheetsCorePresetConfig) | `Partial<Config>` | `{ header: true, toolbar: true, footer: {}, contextMenu: true, formulaBar: true }` |
| readonly | 是否只读模式，会拦截键盘编辑、粘贴、拖拽、双击编辑和右键入口 | `boolean` | `false` |
| extraPresets | 额外的 Preset 包，例如筛选、数据校验、绘图等 | `any[]` | `[]` |
| extraPlugins | 额外的 Univer 插件，支持插件类或 `[插件类, 配置]` | `any[]` | `[]` |
| extraLocales | 额外的语言包，按当前 locale 与核心语言包合并 | `Record<string, unknown \| unknown[]>` | `{}` |

### Config 配置详解

`config` 属性透传给 `UniverSheetsCorePreset`，支持其所有配置项。以下列出常用配置：

```typescript
interface IUniverSheetsCorePresetConfig {
  /** 容器元素 (内部自动处理) */
  container: HTMLElement;
  /** 是否显示头部 (默认 true) */
  header?: boolean;
  /** 是否显示工具栏 (默认 true) */
  toolbar?: boolean;
  /** 是否显示底部状态栏/SheetBar (默认 {}) */
  footer?: boolean | {
    sheetBar?: boolean;
    statisticBar?: boolean;
    menus?: boolean;
    zoomSlider?: boolean;
  };
  /** 是否显示右键菜单 (默认 true) */
  contextMenu?: boolean;
  /** 是否显示公式栏 (默认 true) */
  formulaBar?: boolean;
  /** 菜单配置 (用于隐藏/禁用菜单项) */
  menu?: Record<string, MenuItemConfig>;
  /** 表格特有配置 */
  sheets?: {
    /** 保护区域阴影策略 */
    protectedRangeShadow?: boolean | 'always' | 'non-editable' | 'non-viewable' | 'none';
    [key: string]: any;
  };
  [key: string]: any;
}
```

#### 配置示例

```html
<YSheet
  :config="{
    header: false, // 隐藏头部
    sheets: {
      protectedRangeShadow: false // 隐藏保护区域阴影
    },
    menu: {
      'sheet.contextMenu.permission': { hidden: true } // 隐藏特定的右键菜单
    }
  }"
/>
```

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 数据变化时触发 | `(value: IWorkbookData) => void` |
| workbook-created | 工作簿创建完成时触发 | `(workbook: Workbook) => void` |
| error | 错误回调 | `(error: Error) => void` |

### Slots

YSheet 当前没有公开插槽。

### Expose

通过 `ref` 可以获取到组件实例并调用以下方法：

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| getUniverAPI | 获取 Univer Facade API 实例 | - | `FUniver \| null` |
| getWorkbook | 获取当前工作簿 | - | `Workbook` |
| save | 保存数据 | - | `IWorkbookData \| null` |
| reload | 重新加载数据 | `(data: IWorkbookData) => void` | - |
| dispose | 销毁实例 | - | - |

### Types

`YSheetProps`、`YSheetEmits`、`YSheetExpose`、`IWorkbookData`、`IUniverSheetsCorePresetConfig`、`YSheetExtraPlugin` 等类型可从 `@yss-ui/components` 导入。

## IWorkbookData 数据结构

```typescript
interface IWorkbookData {
  id: string                    // 工作簿 ID
  name: string                  // 工作簿名称
  locale: 'zh-CN' | 'zh-TW' | 'en-US'     // 语言
  sheetOrder: string[]          // Sheet 顺序
  sheets: {
    [sheetId: string]: {
      id: string
      name: string
      cellData: {
        [row: number]: {
          [col: number]: {
            v: any              // 单元格值
            s?: object          // 样式(可选)
          }
        }
      }
      rowCount: number
      columnCount: number
    }
  }
  styles?: object               // 样式定义(可选)
}
```

## 安装依赖

自 `1.5.10` 起，`YSheet` 相关 Univer / React / RxJS 为 **optionalDependencies**：

- 业务侧**无需**手动 `pnpm add` 这些包，安装 `@yss-ui/components` 时会自动尝试拉取。
- 私服缺包时不会阻断整个项目安装；未使用 `YSheet` 的业务可正常开发。
- 使用 `YSheet` 时需保证私服能访问到对应可选依赖（或由 optionalDependencies 安装成功）。

## 导出包说明

主入口仍可异步使用 `YSheet` / `LocaleType` / 相关类型。Univer Preset 等运行时对象请从 **`@yss-ui/components/sheet`** 引入：

| 导出名 | 说明 | 来源包 |
| --- | --- | --- |
| `LocaleType` | 语言类型枚举 | `@univerjs/presets`（主入口有兼容枚举） |
| `IWorkbookData` | 工作簿数据类型 | `@univerjs/presets` |
| `IUniverSheetsCorePresetConfig` | 核心表格 preset 配置类型 | `@univerjs/preset-sheets-core` |
| `YSheetExpose` | YSheet ref 暴露方法类型 | `@yss-ui/components` |
| `UniverSheetsFilterPreset` | 筛选 Preset | `@univerjs/preset-sheets-filter` |
| `UniverPresetSheetsFilterZhCN` | 筛选中文语言包 | `@univerjs/preset-sheets-filter/locales/zh-CN` |
| `UniverSheetsDataValidationPreset` | 数据校验 Preset | `@univerjs/preset-sheets-data-validation` |
| `UniverPresetSheetsDataValidationZhCN` | 数据校验中文语言包 | `@univerjs/preset-sheets-data-validation/locales/zh-CN` |
| `UniverSheetsDrawingPreset` | 绘图 Preset（用于图片、形状、浮动元素等） | `@univerjs/preset-sheets-drawing` |
| `UniverPresetSheetsDrawingZhCN` | 绘图中文语言包 | `@univerjs/preset-sheets-drawing/locales/zh-CN` |

### 示例：启用筛选和数据校验

```typescript
import {
  YSheet,
  UniverSheetsFilterPreset,
  UniverPresetSheetsFilterZhCN,
  UniverSheetsDataValidationPreset,
  UniverPresetSheetsDataValidationZhCN,
  LocaleType
} from '@yss-ui/components/sheet';

const extraPresets = [UniverSheetsFilterPreset(), UniverSheetsDataValidationPreset()];
const extraLocales = {
  [LocaleType.ZH_CN]: [UniverPresetSheetsFilterZhCN, UniverPresetSheetsDataValidationZhCN]
};
```

`YSheet` 内部已引入核心表格、筛选和数据校验样式。进阶 Preset / 语言包请从 `@yss-ui/components/sheet` 导入。

## 注意事项

1. **容器高度**: 必须为容器设置明确的高度，否则 Univer 无法正常渲染
2. **数据更新**: 必须通过 Facade API 更新数据，禁止直接修改 `IWorkbookData` 对象
3. **内存管理**: 组件销毁时会自动调用 `dispose()` 方法，避免内存泄漏
4. **依赖体积**: 该组件依赖 React、RxJS 等库，会增加约 2-3MB 的打包体积

## 更多资料

- [Univer 官方文档](https://docs.univer.ai/)
- [Univer GitHub](https://github.com/dream-num/univer)

## 国际化边界

核心语言包注册简体、繁体与英文，语言变更调用 Univer Facade `setLocale`，不重新创建工作簿。用户输入、工作表名称、公式、币种和数据不自动翻译。额外插件必须通过 `extraLocales` 提供三语词典，缺少插件词典时不能宣称该插件完整三语。
