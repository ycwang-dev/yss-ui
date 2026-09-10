---
title: 快速开始
description: YSS UI 快速开始指南
toc: content
---

# 快速开始

YSS UI 是一个基于 Vue 3、Ant Design Vue 与 VXE-Table 的企业级中后台组件库，专为微应用架构设计。

## 频道导航

- 安装与接入：本页 + [安装](/guide/installation)
- 生产发布： [发版工作流](/guide/release-workflow) / [GitLab CI 集成](/guide/gitlab-ci-integration)
- 存量系统接入： [JSP 项目接入](/guide/jsp)

## 安装

> **💡 安装说明**
>
> `@yss-ui/*` 系列包均已公开发布至官方公共 **npm 制品库**，可直接使用 npm、pnpm 或 yarn 进行安装。完整配置说明请参阅 👉 **[安装指南](/guide/installation)**。

### 环境要求

- Node.js >= 22.10.0（建议升级到 22.17.1，我们在该版本验证良好）
- Vue >= 3.0.0

### 包管理器

推荐使用 pnpm：

```bash
pnpm add @yss-ui/components
```

或者使用 npm：

```bash
npm install @yss-ui/components
```

## 全局引入（你的微应用当前方案）

在 main.ts 中：

```typescript
import { createApp } from 'vue';
import YSSUI from '@yss-ui/components';
import '@yss-ui/components/dist/style.css';
import App from './App.vue';

const app = createApp(App);
app.use(YSSUI);
app.mount('#app');
```

## 按需引入（适用于独立项目或极限体积优化）

为了减小包体积，推荐按需引入组件：

<code id="guide-on-demand-import-button" src="./main/Button.vue" ></code>

## 根入口按需裁剪（待发布）

升级后继续使用原来的公开根入口，不需要增加构建插件或修改为专用轻量路径：

```ts
import { YCard, YTable, YFormily } from '@yss-ui/components';
import '@yss-ui/components/dist/style.css';
```

组件实现按职责保留构建边界，全量安装代码独立成模块。支持 tree-shaking 的生产构建会裁剪未使用的组件与安装代码。历史 `YssFormily` 别名、组件 Props/事件/类型、`lite`、`sheet`、locale 子路径和旧 CSS 路径保持兼容；根入口与 lite 共用组件，语言入口仍共用单例。

```ts
// 重型组件仍使用相同根入口，放在懒加载的业务页面中。
import { YEcharts } from '@yss-ui/components';
```

`app.use(YSSUI)` 全量安装继续可用，但它明确引用了全部注册组件，因此不能获得局部具名导入的体积收益。开发模式的依赖预构建与生产 tree-shaking 口径不同，不能将开发资源量当作生产加载量。

旧隔离插件可能直接读取 `dist/index.mjs` 等内部文件，这些传统产物保留以兼容存量工具。标准包导入通过 package exports/module/main 进入优化后的根入口；新版模板在生产构建中仅为历史虚拟模块名保留兼容映射，不再改写根入口 import，开发模式继续复用依赖预构建优化。存量项目若用别名强制指向传统内部文件，仍按其别名加载，不能视为标准根入口消费。

完整 `style.css` 仍有固定成本，不会根据 JavaScript 的 import 列表自动裁剪 CSS。验收必须同时检查完整页面资源、未使用的重型依赖、浏览器渲染与旧 API 兼容性，不能只比较入口文件大小。

组件库本地开发使用 `pnpm --filter @yss-ui/components dev`，单一监听流程依次更新传统产物和新根入口。可通过 `YSS_KEEP_CONSUMER=true pnpm test:package-consumer` 保留真实打包消费项目，再执行 `python3 scripts/check-package-consumer-browser.py <控制台输出的消费项目目录>` 验证页面渲染与全量安装。

## 使用 Utils 和 Hooks（先保留）

```typescript
// 使用工具函数
import { formatMoney, validateEmail } from '@yss-ui/utils';

// 使用 Hooks
import { useTable, useForm } from '@yss-ui/hooks';
```

## TypeScript 支持

YSS UI 使用 TypeScript 开发，提供完整的类型定义：

```typescript
import type { ButtonProps, FormProps } from '@yss-ui/components';
```

## 配置

### 全局配置

```typescript
import { createApp } from 'vue';
import YssUI from '@yss-ui/components';

const app = createApp(App);

app.use(YssUI, {
  // 全局配置
  theme: {
    primaryColor: '#1890ff',
  },
});
```

### 主题定制

```typescript
import { colors, spacing, typography } from '@yss-ui/theme';

// 使用主题变量
const primaryColor = colors.primary[6];
const basePadding = spacing.md;
```

## 最佳实践

### 1. 组件命名

统一使用 `y-` 前缀避免命名冲突：

<code id="guide-best-practice-naming-button" src="./main/Button.vue" ></code>

### 2. 类型安全

充分利用 TypeScript 类型：

```typescript
import type { YTableProps } from '@yss-ui/components';

const tableProps: YTableProps = {
  data: [],
  columns: [],
  showPagination: true,
};
```

### 3. 主题一致性（避免颜色硬编码）

使用主题变量保持设计一致性：

<code src="./main/ButtonTheme.vue" ></code>

## 下一步

- 查看 [组件文档](/components) 了解所有可用组件
- 查看 [工具函数](/utils) 了解实用工具
- 查看 [Hooks](/hooks) 了解可复用逻辑
- 面向存量系统：查看 [JSP 项目接入（UMD + CDN/本地）](/guide/jsp)
