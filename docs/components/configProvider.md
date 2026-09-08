---
title: 全局配置 ConfigProvider
route: /components/config-provider
toc: content
---

# 全局配置 ConfigProvider

YSS UI 使用 Vue 的 Provide/Inject 提供组件词典，不依赖 vue-i18n。应用负责自己的业务词典与语言切换事务，YSS UI 负责组件内置文案。

语言核心从 `@yss-ui/components/locale` 导入。核心为兼容同步 `setGlobalLocale(code)` 包含三份小型组件词典，不会静态加载 VXE、Formily、Monaco 或 Univer。不能将“核心很小”理解为“所有非默认词典都不会进入首屏”。

## 代码演示

<code src="./demos/config-provider/basic.vue" title="三语切换：表格内置文案、气泡确认和表单输入保留"></code>

## 应用接入

根组件可以使用 Provider：

```vue | pure
<script setup lang="ts">
import { shallowRef } from 'vue';
import { YConfigProvider, zhCN, type YssLocale } from '@yss-ui/components/locale';

const locale = shallowRef<YssLocale>(zhCN);
let revision = 0;

/** 资源准备完毕后提交；连续切换只允许最后一次生效。 */
const setLanguage = async (name: 'zh-CN' | 'zh-TW' | 'en-US') => {
  const request = ++revision;
  const next = name === 'en-US'
    ? (await import('@yss-ui/components/locale/en-US')).default
    : name === 'zh-TW'
      ? (await import('@yss-ui/components/locale/zh-TW')).default
      : zhCN;
  if (request === revision) locale.value = next;
};
</script>

<template>
  <YConfigProvider :locale="locale">
    <router-view />
  </YConfigProvider>
</template>
```

微应用模板采用等价的应用级注入，在 `app.mount` 之前执行：

```typescript | pure
import { createApp, shallowRef } from 'vue';
import { LOCALE_INJECTION_KEY, zhCN } from '@yss-ui/components/locale';
import App from './App.vue';

const app = createApp(App);
const yssLocale = shallowRef(zhCN);
app.provide(LOCALE_INJECTION_KEY, yssLocale);
```

每个 Vue 应用持有自己的 Ref。嵌入模式由门户下发 `locale` 和单调递增的 `localeRevision`；独立模式提供选择入口，系统内确认后重载；storage 变化同样不得静默刷新旧页面。组件库不会修改浏览器存储、请求头、文档语言或业务时区。

应用策略与组件能力分开：登录页采用热切换；兼容大量旧微应用的系统内部推荐“确认后平滑整页重载”。重载前统一提示未保存内容可能丢失，保留完整 URL 与认证；新文档引导阶段继续显示加载过渡，并在当前应用就绪或报错后结束。不要承诺重载保留表单实例、未保存值或撤销栈。

路线 C 不强制旧 columns/Schema 改为 computed，但必须先 await 语言初始化，再动态 import App/路由及静态配置。重载不会清除持久化菜单/字典缓存，门户需要主动获取目标语言数据。仅在明确选择热切换时，业务配置需要响应式，并应保留表单状态；不能用 locale key 重建表单伪装状态保持。

两条路径均应先准备目标资源；失败时不切换当前有效状态。组件库支持 Provider 响应式变化，不决定门户是否重载。

## 翻译与回退

```typescript | pure
import { computed } from 'vue';
import { useLocale } from '@yss-ui/components/locale';

const { t } = useLocale('table');
const totalText = computed(() => t('total', { total: 100 }));
const { t: rootT } = useLocale();
const confirmText = computed(() => rootT('common.confirm'));
const actionTitle = computed(() => rootT('table.actionTitle'));
```

有命名空间时先读该模块，再读 common，最后逐项回退简体；无命名空间时支持完整路径与 common 短键。不存在的键返回键名。仅支持字符串叶子和 `{name}` 具名插值，数组通过 `currentLocale` 读取。自定义词典推荐展开内置语言包，再覆盖特定字段；属性类型要求完整的 `YssLocale`。

## 支持范围与引擎边界

| 范围 | 三语行为 | 使用约束 |
| --- | --- | --- |
| YTable / YEditTable | 内置操作、分页、筛选及 VXE 词典同步 | 挂载表格自动注册词典；热切换页面用响应式配置；重载页面允许初始化后的静态 t() |
| YFormily | 组件按钮、内置校验规则同步 | 保留 Form 实例；仅重新校验已显示错误的字段；业务 Schema 和自定义校验由应用翻译 |
| YTree / YFileImport / YCron / YSplitPane | 组件自有按钮、占位符和提示 | 数据、文件名、用户输入、透传提示不自动翻译 |
| YConditionBuilder | 默认逻辑词及操作符、占位符 | 自定义字段及操作符标签由调用方翻译；value 保持不变 |
| YMonthCalendar | 月份、星期、今天、加载提示 | 日期实例展示时显式指定 locale；不改变业务日期及时区 |
| YSheet | 核心 Univer 三语，Facade 原生热切换 | 不重建工作簿；额外插件的三语词典由 extraLocales 提供 |
| YMonaco / DiffEditor | YSS UI 自有按钮及自定义菜单支持三语 | Monaco 内核菜单使用英文；旧 nls 不能保证当前版本内核翻译，不属于三语热切换承诺 |
| YEcharts | 图表配置透传 | 业务标题/系列名由应用翻译；引擎 locale 通过 initOptions 配置，见组件文档 |
| Ant Design Vue 透传控件 | 使用应用根 ConfigProvider | YConfigProvider 不替代 Ant Design Vue ConfigProvider |

VXE 和 Formily 校验器的语言属于引擎单例。同一引擎实例下应使用同一种语言；多个 Provider 同屏使用不同语言，不保证第三方引擎文案隔离。微前端应同步到同一个门户语言。切换词典不会自动翻译已经由后端返回的菜单、业务字典和错误消息。

## API

### YConfigProvider Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| locale | YssLocale | 继承父级或全局语言 | 组件语言包；最外层全局默认为简体 |
| syncVxe | boolean | false | 显式同步原生 VXE 控件；异步注册词典后切换。YTable/YEditTable 已自动适配，无须重复开启 |

### YConfigProvider Events

无。

### YConfigProvider Slots

| 插槽名 | 参数 | 说明 |
| --- | --- | --- |
| default | - | 使用当前语言的组件树 |

### YConfigProvider Expose

无。

### YConfigProvider Types

```typescript | pure
import type { YssLocale, YssLocaleName } from '@yss-ui/components/locale';
```

### 语言工具

| API | 类型与用途 |
| --- | --- |
| useLocale(namespace?) | setup/组合函数中获取响应式 currentLocale、localeName、messages 和 t |
| setGlobalLocale(locale) | 同步设置无 Provider 场景的默认语言；接受 YssLocale 或标准代码，非法代码回退简体 |
| getGlobalLocale() | 获取默认词典对象 |
| LOCALE_INJECTION_KEY | 应用级 Provide/Inject 标识 |
| syncVxeLanguage(locale) | 返回 Promise<void>，按需加载、注册并切换 VXE 词典；失败向调用方抛出 |

语言包可从 `@yss-ui/components/locale/zh-CN`、`/locale/zh-TW`、`/locale/en-US` 默认导入。

## 验收建议

验证简→繁→英→简、快速连续切换、资源失败重试、已有错误提示、表单未保存输入、表格分页/筛选、工作簿撤销记录、独立模式刷新持久化及卸载重挂。包级验证必须使用构建后的 tarball，不能仅依赖源码别名或本机绝对路径 link。
