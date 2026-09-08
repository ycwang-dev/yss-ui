<script setup lang="ts">
import { ref } from 'vue';
import { LocaleType, YSheet, type IWorkbookData } from '@yss-ui/components/sheet';

defineOptions({ name: 'DemoSheetBasic' });

/**
 * 工作簿数据
 */
const workbookData = ref<Partial<IWorkbookData>>({
  id: 'demo-workbook',
  name: '销售数据表',
  locale: LocaleType.ZH_CN,
  sheetOrder: ['sheet-01'],
  sheets: {
    'sheet-01': {
      id: 'sheet-01',
      name: '第一季度',
      rowCount: 100,
      columnCount: 26,
      cellData: {
        0: {
          0: { v: '产品名称', s: { bl: 1 } },
          1: { v: '销售额', s: { bl: 1 } },
          2: { v: '数量', s: { bl: 1 } },
          3: { v: '单价', s: { bl: 1 } },
        },
        1: {
          0: { v: '产品A' },
          1: { v: 10000 },
          2: { v: 100 },
          3: { v: 100 },
        },
        2: {
          0: { v: '产品B' },
          1: { v: 20000 },
          2: { v: 200 },
          3: { v: 100 },
        },
        3: {
          0: { v: '产品C' },
          1: { v: 15000 },
          2: { v: 150 },
          3: { v: 100 },
        },
      },
    },
  },
});

/**
 * Demo 配置
 * 右键菜单保持 YSheet 默认开启，初始化闪烁由组件内部样式处理。
 */
const demoConfig = {};

/**
 * 工作簿创建完成回调
 */
const handleWorkbookCreated = (workbook: any) => {
  console.log('工作簿创建完成:', workbook);
};

/**
 * 错误处理
 */
const handleError = (error: Error) => {
  console.error('Univer 错误:', error);
};
</script>

<template>
  <YSheet
    v-model="workbookData as IWorkbookData"
    height="620px"
    locale="zh-CN"
    :config="demoConfig"
    @workbook-created="handleWorkbookCreated"
    @error="handleError"
  />
</template>
