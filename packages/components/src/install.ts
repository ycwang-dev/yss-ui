import AuthorityDropdown from './authority/AuthorityDropdown.vue';
import YButton from './button/index.vue';
import { YEcharts } from './echarts/main-exports';
import YEditTable from './edit-table/index.vue';
import YFileImport from './file-import/index.vue';
import YFormily from './formily/index.vue';
import { YMonaco, YMonacoDiff } from './monaco/main-exports';
import YCard from './card/index.vue';
import YTable from './table/index.vue';
import YConditionBuilder from './condition-builder/index.vue';
import YTree from './tree/index.vue';
import YSplitPane from './split-pane/index.vue';
import YCron from './cron/index.vue';
import YMonthCalendar from './month-calendar/index.vue';
import { YConfigProvider } from './locale';
import { YSheet } from './sheet/main-exports';
import { VxeUI } from 'vxe-pc-ui';

/** 全量安装使用的组件清单；具名消费者不加载此模块。 */
const components = [
  YButton,
  YTable,
  YEditTable,
  YFormily,
  AuthorityDropdown,
  YFileImport,
  YCard,
  YConditionBuilder,
  YTree,
  YSplitPane,
  YCron,
  YMonthCalendar,
  YConfigProvider,
];

/** 保留旧全量安装及历史全局别名。 */
export const install = (app: any): void => {
  // 安装 vxe-pc-ui（提供 vxe-tooltip 等必需组件）
  try {
    const installedFlag = '__yss_vxe_ui_installed__';
    if (VxeUI && !(app as any)[installedFlag]) {
      app.use(VxeUI as any);
      (app as any)[installedFlag] = true;
    }
  } catch (e) {
    // 忽略：若用户未安装 vxe-pc-ui，将在运行时提示
  }
  components.forEach(component => {
    app.component(component.name || component.__name, component);
  });
  // 注册别名组件与异步重型组件，避免未使用的项目同步加载巨型依赖
  app.component('YssFormily', YFormily); // 历史兼容全局别名
  app.component('YDropdown', AuthorityDropdown); // AuthorityDropdown 的简化别名
  app.component('YSheet', YSheet);
  app.component('YMonaco', YMonaco);
  app.component('YMonacoDiff', YMonacoDiff);
  app.component('YEcharts', YEcharts);
};

export default {
  install,
};
