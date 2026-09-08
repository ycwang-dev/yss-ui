<script setup lang="ts">
import { computed, ref } from 'vue';
import { YButton } from '@yss-ui/components';
import {
  LocaleType,
  UniverPresetSheetsDataValidationZhCN,
  UniverPresetSheetsFilterZhCN,
  UniverSheetsDataValidationPreset,
  UniverSheetsFilterPreset,
  YSheet,
  type IWorkbookData,
} from '@yss-ui/components/sheet';

defineOptions({ name: 'DemoSheetAdvanced' });

/**
 * 是否只读
 */
const readonly = ref(true);

/**
 * 工作簿数据
 */
const workbookData = ref<IWorkbookData>({
  id: 'demo-advanced-workbook',
  appVersion: '0.25.0',
  name: '扩展能力示例',
  locale: LocaleType.ZH_CN,
  styles: {},
  sheetOrder: ['sheet-01'],
  sheets: {
    'sheet-01': {
      id: 'sheet-01',
      name: '指标映射',
      rowCount: 80,
      columnCount: 12,
      cellData: {
        0: {
          0: { v: '外部列', s: { bl: 1 } },
          1: { v: '标准列', s: { bl: 1 } },
          2: { v: '处理状态', s: { bl: 1 } },
        },
        1: {
          0: { v: 'fund_name' },
          1: { v: '产品名称' },
          2: { v: '待确认' },
        },
        2: {
          0: { v: 'nav_date' },
          1: { v: '估值日期' },
          2: { v: '已确认' },
        },
      },
    },
  },
});

/**
 * 扩展 Preset：启用筛选与数据校验 UI 能力
 */
const extraPresets = [UniverSheetsFilterPreset(), UniverSheetsDataValidationPreset()];

/**
 * 扩展中文语言包
 */
const extraLocales = {
  [LocaleType.ZH_CN]: [UniverPresetSheetsFilterZhCN, UniverPresetSheetsDataValidationZhCN],
};

/**
 * Univer 表格配置
 */
const sheetConfig = {
  header: false,
  toolbar: true,
  formulaBar: true,
  footer: { addSheetButtonConfig: { show: false } },
};

/**
 * 只读按钮文案
 */
const readonlyText = computed(() => (readonly.value ? '切换为可编辑' : '切换为只读'));
</script>

<template>
  <div class="demo-sheet-advanced">
    <div class="demo-sheet-advanced__toolbar">
      <YButton size="small" @click="readonly = !readonly">{{ readonlyText }}</YButton>
    </div>
    <YSheet
      v-model="workbookData"
      height="560px"
      locale="zh-CN"
      :readonly="readonly"
      :config="sheetConfig"
      :extra-presets="extraPresets"
      :extra-locales="extraLocales"
    />
  </div>
</template>

<style scoped lang="less">
.demo-sheet-advanced {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demo-sheet-advanced__toolbar {
  display: flex;
  justify-content: flex-end;
}
</style>
