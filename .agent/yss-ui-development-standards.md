# YSS UI 组件库开发规范

> **适用范围**：本规范适用于 Antigravity AI 代码生成以及开发人员在 YSS UI 组件库项目中的所有开发工作。

## 📋 目录

- [项目架构](#项目架构)
- [组件开发规范](#组件开发规范)
- [Hooks 开发规范](#hooks-开发规范)
- [工具函数开发规范](#工具函数开发规范)
- [文档编写规范](#文档编写规范)
  - [Hooks 文档规范](#hooks-文档规范critical)
  - [组件文档规范](#组件文档规范)
  - [更新日志文档规范](#更新日志文档规范critical)
- [Dumi 配置规范](#dumi-配置规范)
- [代码风格规范](#代码风格规范)

---

## 项目架构

### 目录结构

```
yss-ui/
├── packages/
│   ├── components/     # 组件库
│   ├── hooks/          # Hooks 库
│   ├── utils/          # 工具函数库
│   └── theme/          # 主题配置
├── docs/               # 文档目录
│   ├── components/     # 组件文档
│   ├── hooks/          # Hooks 文档
│   │   ├── demos/      # Demo 示例（独立 Vue 文件）
│   │   └── *.md        # 文档 Markdown
│   ├── utils/          # 工具函数文档
│   └── guide/          # 指南文档
├── .dumirc.ts          # Dumi 配置文件
└── .agent/             # AI 开发规范目录
```

---

## 组件开发规范

### 组件模块化拆分（强制执行）

**当组件代码超过 150 行或包含多个独立职责时，必须进行模块化拆分。**

#### 文件组织标准

```
ComponentName/
├── index.vue          # 主组件（仅负责组合逻辑和视图，≤ 150 行）
├── constant.ts        # 常量、类型定义、静态配置
├── style.less         # 独立样式文件
└── hooks/             # 业务逻辑 Composables
    ├── useDataFetch.ts
    ├── useModal.ts
    └── useFilters.ts
```

#### 文件职责划分

**1. constant.ts - 常量文件**

必须包含：
- ✅ TypeScript 类型定义（`type`, `interface`）
- ✅ 枚举（`enum`）
- ✅ 映射对象（`Record`, `Map`）
- ✅ 纯函数（如数据转换函数）
- ✅ 静态配置（表格列配置、下拉选项等）
- ✅ 常量值（`const` 定义的固定值）

**2. hooks/ - 业务逻辑文件夹**

命名规范：
- ✅ 使用 `use` 前缀（如 `useDataList.ts`）
- ✅ 一个文件专注一个职责

必须包含：
- ✅ 状态管理（`ref`, `reactive`, `computed`）
- ✅ API 调用逻辑
- ✅ 副作用处理（`watch`, `watchEffect`）
- ✅ 事件处理函数

**3. style.less - 样式文件**

必须抽离：
- ✅ 所有组件样式（移除 `<style scoped>`）
- ✅ 使用 Less/Sass 语法
- ✅ yss-ui docs里面的demo组件通过 `import './style.less'` 引入，因为dumi只有通过import引入的样式才会被打包渲染出来，实际业务层代码不需要 通过<style lang="less" scoped>@import './style.less'; </style>引入样式

**4. index.vue - 主组件**

职责：仅负责**组合 hooks** 和**渲染视图**

代码模板：

```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { tableColumns, getLevelLabel } from './constant';
import { useDataList } from './hooks/useDataList';
import { useModal } from './hooks/useModal';
import './style.less';

defineOptions({ name: 'ComponentName' });

// 业务逻辑 hooks
const { dataList, loading, fetchData } = useDataList();
const { modalOpen, openModal } = useModal();

// 生命周期
onMounted(() => fetchData());
</script>

<template>
  <!-- 模板内容 -->
</template>
```

#### 禁止行为

- ❌ 禁止在主组件中直接定义常量（超过 1 行的配置对象）
- ❌ 禁止在主组件中直接编写 API 调用逻辑
- ❌ 禁止将所有逻辑堆砌在单个文件中
- ❌ 禁止使用 `<style scoped>` 内联样式（必须抽离到 `style.less`）

### Vue 单文件组件（SFC）结构顺序

**必须按以下顺序组织代码块**：

```vue
<!-- 第一部分：逻辑代码 -->
<script setup lang="ts">
// ...
</script>

<!-- 第二部分：模板结构 -->
<template>
  <!-- ... -->
</template>

<!-- 第三部分：样式定义 -->
<style scoped lang="less">
/* ... */
</style>
```

---

## Hooks 开发规范

### Hooks 文件结构

```
hooks/
├── src/
│   ├── useFullscreen/
│   │   ├── index.ts         # Hook 实现
│   │   └── types.ts         # 类型定义（可选）
│   ├── useLoading.ts        # 简单 Hook 可单文件
│   └── index.ts             # 导出入口
```

### Hook 命名规范

- ✅ 必须使用 `use` 前缀
- ✅ 使用驼峰命名法（camelCase）
- ✅ 名称要清晰表达功能

### Hook 代码模板

```typescript
import { ref, Ref } from 'vue';

/**
 * @description Hook 功能描述
 * @param initialValue 初始值说明
 * @returns 返回值说明
 */
export function useExample(initialValue?: boolean) {
  const state = ref(initialValue);

  /**
   * 设置状态
   */
  const setState = (value: boolean) => {
    state.value = value;
  };

  return {
    state,
    setState,
  };
}
```

### Hook 导出规范

在 `packages/hooks/src/index.ts` 中导出：

```typescript
export { useFullscreen } from './useFullscreen';
export { useLoading } from './useLoading';
```

---

## 工具函数开发规范

### 工具函数结构

```
utils/
├── src/
│   ├── format.ts         # 格式化相关
│   ├── download.ts       # 下载相关
│   ├── auth.ts           # 认证相关
│   └── index.ts          # 导出入口
```

### 工具函数代码模板

```typescript
/**
 * @description 函数功能描述
 * @param param1 参数1说明
 * @param param2 参数2说明
 * @returns 返回值说明
 */
export function utilFunction(param1: string, param2?: number): string {
  // 实现逻辑
  return result;
}
```

---

## 文档编写规范

### Hooks 文档规范（Critical）

#### 文档文件结构

```
docs/hooks/
├── demos/                           # Demo 示例目录（必须按 Hook 名称分组）
│   ├── useFullscreen/               # useFullscreen 的所有 demo
│   │   ├── demo1-basic.vue
│   │   ├── demo2-image.vue
│   │   ├── demo3-page.vue
│   │   └── demo4-coexist.vue
│   └── useLoading/                  # useLoading 的所有 demo
│       ├── use-loading-basic.vue
│       └── use-loading-manual.vue
├── index.md                         # Hooks 概览（必须）
├── useFullscreen.md                 # Hook 文档
└── useLoading.md                    # Hook 文档
```

> **⚠️ 关键规范**：
> - **demos** 文件夹下**必须**为每个 Hook 创建独立子文件夹
> - 子文件夹命名使用 Hook 的 **camelCase** 名称（如 `useFullscreen/`, `useLoading/`）
> - 所有 demo 文件必须放在对应的 Hook 子文件夹内，**禁止**将所有 demo 文件平铺在 demos 根目录
> - 这与 **components** 和 **utils** 的 demos 组织方式保持一致

#### 文档 Frontmatter 配置（必须）

```markdown
---
title: useExample
description: 简短的功能描述
toc: content    # ⚠️ 关键配置：将二三级标题显示在右侧目录
---
```

> **⚠️ 重要**：`toc: content` 配置**必须添加**，否则文档的二三级标题会错误显示在左侧导航而不是右侧目录。

#### 文档结构模板

```markdown
---
title: useExample
description: 简短的功能描述
toc: content
---

# useExample

详细的功能介绍，支持什么场景。

## 代码演示

### 基础用法

使用说明文字。

<code src="./demos/useExample/use-example-basic.vue"></code>

### 高级用法

使用说明文字。

<code src="./demos/useExample/use-example-advanced.vue"></code>

## API

```typescript
const { state, action } = useExample(params);
```

### Params

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| param1 | 参数说明 | `string` | - |

### Return

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| state | 状态说明 | `Ref<boolean>` |

## 类型定义

```typescript
export interface ExampleOptions {
  // ...
}
```
```

#### Demo 文件规范（Critical）

**必须遵循的规则**：

1. **显式导入 Ant Design 组件**

```typescript
import { Button, Space, Tag } from 'ant-design-vue';

// 创建组件别名（必须）
const AButton = Button;
const ASpace = Space;
const ATag = Tag;
```

> **⚠️ 关键**：必须显式导入并创建别名，否则组件无法正常渲染。

2. **Demo 文件模板**

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useExample } from '@yss-ui/hooks';
import { Button } from 'ant-design-vue';

defineOptions({ name: 'UseExampleBasicDemo' });

const AButton = Button;

const { state, action } = useExample();
</script>

<template>
  <div class="demo-container">
    <a-button type="primary" @click="action">
      点击按钮
    </a-button>
  </div>
</template>

<style scoped lang="less">
.demo-container {
  background: #f5f5f5;
  padding: 24px;
  border-radius: 8px;
}
</style>
```

3. **Demo 命名规范**

- 文件名：`use-hook-name-scenario.vue`（kebab-case）
- 组件名：`UseHookNameScenarioDemo`（PascalCase）

示例：
- `use-loading-basic.vue` → `UseLoadingBasicDemo`
- `use-fullscreen-image.vue` → `UseFullscreenImageDemo`

### 组件文档规范

组件文档结构与 Hooks 类似,但需要额外包含：

- Props 表格
- Events 表格
- Slots 表格
- 方法表格（如有）

### 更新日志文档规范（Critical）

#### 文档文件结构

```
docs/
├── changelog.md                 # 综合更新日志（所有包）
└── changelog/
    ├── components.md            # 组件库专属日志
    ├── hooks.md                 # Hooks 专属日志
    └── utils.md                 # 工具库专属日志
```

#### Frontmatter 配置（必须）

**所有更新日志文件都必须添加 `toc: content` 配置**：

```markdown
---
title: 更新日志
nav:
  title: 更新日志
  path: /changelog
toc: content    # ⚠️ 关键配置：将版本号显示在右侧目录
---
```

> **⚠️ 重要**：`toc: content` 配置确保：
> - **左侧导航**：只显示 sidebar 配置中的固定项目（综合日志、组件库、Hooks、工具库）
> - **右侧 TOC**：自动提取文档内容中的标题作为锚点（v1.1.19、2025-12 等版本号）

#### 综合日志格式规范

在 `docs/changelog.md` 中，所有更新条目**必须使用包名标签**：

```markdown
## v1.1.19
`2025-12-17`

### ✨ Features

- **[@yss-ui/components] Table**: 新增远程筛选功能
- **[@yss-ui/hooks] useFullscreen**: 新增全屏钩子
- **[@yss-ui/utils] formatDate**: 新增时区支持

### 🐞 Bug Fixes

- **[@yss-ui/components] Table**: 修复表格渲染问题
```

**标签格式要求**：

- ✅ 必须使用 `[@yss-ui/components]`、`[@yss-ui/hooks]`、`[@yss-ui/utils]`
- ✅ 标签后必须有一个空格
- ✅ 标签必须在双星号 `**` 内部
- ❌ 禁止将标签放在星号外部或错误位置

#### 分包日志自动生成

**使用脚本自动生成分包日志**：

```bash
# 编辑综合日志后执行
pnpm generate:changelog
```

脚本会自动：
1. 解析 `docs/changelog.md` 中的所有版本块
2. 根据包名标签 `[@yss-ui/xxx]` 过滤相关更新
3. 移除标签前缀，保持日志简洁
4. 生成三个分包日志文件

**工作流程**：

```bash
# 步骤 1: 编辑综合日志，添加包名标签
vim docs/changelog.md

# 步骤 2: 生成分包日志
pnpm generate:changelog

# 步骤 3: 检查生成结果
git diff docs/changelog/

# 步骤 4: 提交变更
git add docs/changelog*
git commit -m "docs: update changelog for v1.1.20"
```

> **⚠️ 警告**：不要直接编辑分包日志文件（`components.md`、`hooks.md`、`utils.md`），因为每次运行脚本都会覆盖！

#### Sidebar 配置（必须）

在 `.dumirc.ts` 中配置更新日志导航：

```typescript
sidebar: {
  '/changelog': [
    {
      title: '更新日志',
      children: [
        { title: '综合日志', link: '/changelog' },
        { title: '组件库', link: '/changelog/components' },
        { title: 'Hooks', link: '/changelog/hooks' },
        { title: '工具库', link: '/changelog/utils' },
      ],
    },
  ],
}
```

#### Emoji 图标规范

使用统一的 Emoji 标记更新类型：

- ✨ **Features** - `### ✨ Features`
- 🐞 **Bug Fixes** - `### 🐞 Bug Fixes`
- 📝 **Documentation** - `### 📝 Documentation`
- 🛠 **Refactoring** - `### 🛠 Refactoring`
- 💅 **Style** - `### 💅 Style`
- 🎉 **First Release** - `### 🎉 First Release`



## Dumi 配置规范

### Sidebar 配置规范

在 `.dumirc.ts` 中配置左侧导航分组：

```typescript
sidebar: {
  '/hooks': [
    {
      title: 'Hooks 介绍',
      children: [{ title: '快速开始', link: '/hooks' }],
    },
    {
      title: 'DOM',
      children: [
        { title: 'useFullscreen', link: '/hooks/use-fullscreen' },
      ],
    },
    {
      title: '状态管理',
      children: [
        { title: 'useLoading', link: '/hooks/use-loading' },
      ],
    },
  ],
  '/components': [
    {
      title: '通用组件',
      children: [
        { title: 'Button 按钮', link: '/components/button' },
      ],
    },
  ],
  '/utils': [
    {
      title: '日期格式化',
      children: [{ title: 'formatDate', link: '/utils/format' }],
    },
  ],
}
```

### 分组命名规范

#### Hooks 分组建议

- **Hooks 介绍** - 概览入口（必须）
- **DOM** - DOM 操作相关（useFullscreen, useEventListener, useClickOutside）
- **状态管理** - 状态管理相关（useLoading, useToggle, useBoolean）
- **副作用** - 副作用相关（useDebounce, useThrottle, useInterval）
- **浏览器** - 浏览器 API 相关（useLocalStorage, useSessionStorage, useCookie）

#### Utils 分组建议

- **日期格式化** - formatDate, parseDate
- **文件下载** - downloadBlob, downloadFile
- **认证相关** - clearAuthInfo, getToken

#### Components 分组建议

- **通用组件** - Button, Card, Tree
- **表单组件** - Formily, Monaco
- **表格组件** - Table, EditTable
- **图表组件** - Echarts
- **业务组件** - ConditionBuilder, FileImport

---

## 代码风格规范

### TypeScript 规范

```typescript
// ✅ 使用 ES6+ 语法
const value = 'example';
let count = 0;

// ❌ 禁止使用 var
var oldStyle = 'no';

// ✅ 优先使用解构赋值
const { name, age } = person;
const [first, second] = array;

// ✅ 优先使用箭头函数
const add = (a: number, b: number) => a + b;

// ✅ 使用可选链和空值合并
const value = obj?.nested?.value ?? 'default';

// ✅ 使用 async/await
const fetchData = async () => {
  const result = await api.getData();
  return result;
};

// ❌ 避免 Promise 嵌套
api.getData().then(data => {
  api.process(data).then(result => {
    // 不推荐
  });
});
```

### 注释规范

```typescript
/**
 * @description 函数功能描述（必须使用 JSDoc）
 * @param param1 参数说明
 * @param param2 参数说明
 * @returns 返回值说明
 */
export function exampleFunction(param1: string, param2?: number): string {
  // 重要逻辑使用中文单行注释
  const result = processData(param1);
  
  return result;
}

// ✅ 方法、类、接口必须使用 JSDoc（/** ... */）
// ✅ 所有注释优先使用中文
// ❌ 禁止仅使用 // 注释方法定义
```

### Vue 3 最佳实践

```vue
<script setup lang="ts">
// ✅ 使用 <script setup lang="ts">
// ✅ 优先使用 ref 和 computed
import { ref, computed } from 'vue';

const count = ref(0);
const doubled = computed(() => count.value * 2);

// ✅ 使用 defineOptions 定义组件名
defineOptions({ name: 'ExampleComponent' });

// ✅ 使用 TypeScript 定义 Props
interface Props {
  title: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
});

// ✅ 定义 Emits
const emit = defineEmits<{
  change: [value: number];
  submit: [];
}>();
</script>

<template>
  <!-- 模板内容 -->
</template>

<style scoped lang="less">
/* ✅ 使用 <style scoped lang="less"> */
</style>
```

---

## 开发工作流

### 1. 新增 Hook 流程

1. 在 `packages/hooks/src/` 创建 Hook 文件
2. 在 `packages/hooks/src/index.ts` 导出
3. 在 `docs/hooks/` 创建文档文件（添加 `toc: content`）
4. 在 `docs/hooks/demos/` 创建 Demo 文件（显式导入 Ant Design 组件）
5. 在 `.dumirc.ts` 的 `sidebar['/hooks']` 添加导航配置

### 2. 新增组件流程

1. 在 `packages/components/src/` 创建组件目录
2. 按模块化规范组织文件（index.vue, constant.ts, hooks/, style.less）
3. 在 `packages/components/src/index.ts` 导出
4. 创建组件文档和 Demo
5. 在 `.dumirc.ts` 的 `sidebar['/components']` 添加导航配置

### 3. 新增工具函数流程

1. 在 `packages/utils/src/` 创建工具函数文件
2. 在 `packages/utils/src/index.ts` 导出
3. 创建文档
4. 在 `.dumirc.ts` 的 `sidebar['/utils']` 添加导航配置

---

## 常见错误与解决方案

### 错误 1: 文档分类显示在左侧而不是右侧

**原因**：缺少 `toc: content` 配置

**解决方案**：

```markdown
---
title: useExample
description: 描述
toc: content    # ← 添加此行
---
```

### 错误 2: Ant Design 组件未渲染

**原因**：未显式导入组件

**解决方案**：

```typescript
// ❌ 错误：直接使用 <a-button>
<template>
  <a-button>按钮</a-button>
</template>

// ✅ 正确：显式导入并创建别名
<script setup lang="ts">
import { Button } from 'ant-design-vue';
const AButton = Button;
</script>

<template>
  <a-button>按钮</a-button>
</template>
```

### 错误 3: 组件代码过长难以维护

**原因**：未进行模块化拆分

**解决方案**：按照组件模块化规范拆分为 `index.vue`, `constant.ts`, `hooks/`, `style.less`

---

## AI 代码生成指引

当使用 Antigravity AI 生成代码时，请遵循以下原则：

1. **自动应用模块化结构**：默认创建符合规范的文件结构
2. **主动拆分逻辑**：不需用户明确提出，直接按规范组织代码
3. **保持简洁**：主组件代码控制在 150 行以内
4. **添加 JSDoc**：所有导出函数和 Hooks 必须有 JSDoc 注释
5. **显式导入组件**：Demo 文件中必须显式导入 Ant Design 组件
6. **添加 toc 配置**：文档文件必须添加 `toc: content`
7. **组织 demos 文件夹**：为每个 Hook/组件/工具创建独立子文件夹，demo 文件必须放在对应子文件夹内

---

## 参考资源

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Ant Design Vue](https://www.antdv.com/)
- [Dumi 文档](https://d.umijs.org/)
- [VueUse](https://vueuse.org/) - 优先评估是否可复用

---

**最后更新时间**: 2025-12-19
