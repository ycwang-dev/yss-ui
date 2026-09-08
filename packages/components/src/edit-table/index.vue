<template>
  <div class="y-edit-table-wrapper" :style="wrapperStyleVars">
    <vxe-table
      ref="tableRef"
      class="yss-custom-vxe-table"
      v-bind="mergedTableProps"
      :data="displayData"
      :loading="props.loading"
      @edit-closed="handleEditClosed"
      @row-dragend="handleRowDragend"
      @filter-change="handleFilterChange"
    >
      <!-- 拖拽把手列（vxe 内置 drag-sort）- 放左侧 -->
      <vxe-column
        v-if="rowDragable && showDragHandle && dragHandlePlacement === 'left'"
        :width="dragHandleWidth"
        align="center"
        :resizable="false"
        :show-overflow="false"
        :fixed="dragHandleFixedComputed"
        drag-sort
      />

      <template v-for="col in columns" :key="col.field || col.type">
        <!-- 分组表头：支持 vxe-colgroup 全量透传（黑名单剔除） -->
        <vxe-colgroup v-if="col.children && col.children.length" v-bind="getColgroupProps(col as any)">
          <!-- 分组表头自定义插槽（kebab-case 优先，兼容 camelCase） -->
          <template v-if="$slots['group-header'] || $slots.groupHeader" #header="scope">
            <slot v-if="$slots['group-header']" name="group-header" v-bind="scope" />
            <slot v-else name="groupHeader" v-bind="scope" />
          </template>

          <vxe-column
            v-for="sub in col.children"
            :key="(sub as any).field || (sub as any).type"
            v-bind="getColumnProps(sub)"
          >
            <!-- 表头插槽：#<field>-header 或 #header（同时兼容旧 #<field>Header） -->
            <template
              v-if="
                ((sub as any).field &&
                  ($slots[((sub as any).field as string) + 'Header'] ||
                    $slots[`${toKebabCase((sub as any).field as string)}-header`])) ||
                $slots.header
              "
              #header="scope"
            >
              <template v-if="(sub as any).field && $slots[((sub as any).field as string) + 'Header']">
                <slot :name="((sub as any).field as string) + 'Header'" v-bind="scope" />
              </template>
              <template v-else-if="(sub as any).field && $slots[`${toKebabCase((sub as any).field as string)}-header`]">
                <slot :name="`${toKebabCase((sub as any).field as string)}-header`" v-bind="scope" />
              </template>
              <template v-else-if="$slots.header">
                <slot name="header" v-bind="scope" />
              </template>
            </template>

            <!-- 查看态/编辑态/操作列：合并 default，内部做条件分支 -->
            <template #default="scope">
              <ActionColumn
                v-if="(sub as any).type === 'action'"
                :buttons="resolveActionConfig(sub as any).buttons"
                :display-limit="resolveActionConfig(sub as any).displayLimit"
                :more-render-type="resolveActionConfig(sub as any).moreRenderType"
                :scope="scope"
              >
                <template v-if="$slots['action-more-icon']" #more>
                  <slot name="action-more-icon" />
                </template>
                <template v-else-if="$slots.actionMoreIcon" #more>
                  <slot name="actionMoreIcon" />
                </template>
              </ActionColumn>
              <template v-else>
                <template v-if="(sub as any).type !== 'expand'">
                  <template
                    v-if="
                      (sub as any).field &&
                      ($slots[(sub as any).field as string] || $slots[toKebabCase((sub as any).field as string)])
                    "
                  >
                    <slot
                      :name="
                        $slots[toKebabCase((sub as any).field as string)]
                          ? `${toKebabCase((sub as any).field as string)}`
                          : (sub as any).field
                      "
                      :row="scope.row"
                      :column="scope.column"
                      :row-index="scope.rowIndex"
                    />
                  </template>
                  <template v-else-if="hasFormatter(sub)">
                    {{ callFormatter(sub, scope.row) }}
                  </template>
                  <template v-else-if="shouldTransform(sub, scope.row)">
                    {{ transformLabel(sub, scope.row) }}
                  </template>
                  <template v-else>
                    {{ scope.row[(sub as any).field as string] }}
                  </template>
                  <div
                    v-if="shouldShowError(sub, scope.row)"
                    class="y-edit-table-cell-error"
                    :title="getCellError(sub, scope.row)"
                  >
                    {{ getCellError(sub, scope.row) }}
                  </div>
                </template>
              </template>
            </template>

            <!-- 编辑态单元格渲染：按 component 渲染 a-input/a-input-number/a-select -->
            <template
              v-if="(sub as any).type !== 'action' && (sub as any).type !== 'expand' && (sub as any).field"
              #edit="{ row }"
            >
              <div class="y-edit-table-editor" :class="{ 'is-error': shouldShowError(sub, row) }">
                <Tooltip v-bind="getErrorTooltipProps(sub, row)">
                  <component
                    :is="resolveEditor(sub, row)"
                    v-bind="editorProps(sub, row)"
                    :value="row[(sub as any).field]"
                    v-on="editorEvents(sub, row)"
                  />
                </Tooltip>
              </div>
            </template>

            <!-- 自定义筛选面板插槽：与 YTable 对齐，支持 #<field>-filter / #<field>Filter / #filter -->
            <template
              v-if="
                ((sub as any).field &&
                  ($slots[((sub as any).field as string) + 'Filter'] ||
                    $slots[`${(sub as any).field as string}-filter`] ||
                    $slots[`${toKebabCase((sub as any).field as string)}-filter`])) ||
                $slots.filter
              "
              #filter="scope"
            >
              <template v-if="(sub as any).field && $slots[((sub as any).field as string) + 'Filter']">
                <slot :name="((sub as any).field as string) + 'Filter'" v-bind="scope" />
              </template>
              <template v-else-if="(sub as any).field && $slots[`${(sub as any).field as string}-filter`]">
                <slot :name="`${(sub as any).field as string}-filter`" v-bind="scope" />
              </template>
              <template v-else-if="(sub as any).field && $slots[`${toKebabCase((sub as any).field as string)}-filter`]">
                <slot :name="`${toKebabCase((sub as any).field as string)}-filter`" v-bind="scope" />
              </template>
              <template v-else-if="$slots.filter">
                <slot name="filter" v-bind="scope" />
              </template>
            </template>

            <!-- 展开行内容插槽（兼容 #expand-row） -->
            <template
              v-if="(sub as any).type === 'expand' && ($slots['expand-row'] || $slots.expandRow)"
              #content="scope"
            >
              <slot v-if="$slots['expand-row']" name="expand-row" v-bind="scope" />
              <slot v-else name="expandRow" v-bind="scope" />
            </template>
          </vxe-column>
        </vxe-colgroup>

        <!-- 普通列 -->
        <vxe-column v-else v-bind="getColumnProps(col)">
          <!-- 表头插槽：#<field>-header 或 #header（同时兼容旧 #<field>Header） -->
          <template
            v-if="
              (col.field &&
                ($slots[(col.field as string) + 'Header'] || $slots[`${toKebabCase(col.field as string)}-header`])) ||
              $slots.header
            "
            #header="scope"
          >
            <template v-if="col.field && $slots[(col.field as string) + 'Header']">
              <slot :name="(col.field as string) + 'Header'" v-bind="scope" />
            </template>
            <template v-else-if="col.field && $slots[`${toKebabCase(col.field as string)}-header`]">
              <slot :name="`${toKebabCase(col.field as string)}-header`" v-bind="scope" />
            </template>
            <template v-else-if="$slots.header">
              <slot name="header" v-bind="scope" />
            </template>
          </template>

          <!-- 查看态/编辑态/操作列：合并 default，内部做条件分支 -->
          <template #default="scope">
            <ActionColumn
              v-if="col.type === 'action'"
              :buttons="resolveActionConfig(col).buttons"
              :display-limit="resolveActionConfig(col).displayLimit"
              :more-render-type="resolveActionConfig(col).moreRenderType"
              :scope="scope"
            >
              <template v-if="$slots['action-more-icon']" #more>
                <slot name="action-more-icon" />
              </template>
              <template v-else-if="$slots.actionMoreIcon" #more>
                <slot name="actionMoreIcon" />
              </template>
            </ActionColumn>
            <template v-else>
              <template v-if="col.type !== 'expand'">
                <template v-if="col.field && ($slots[col.field] || $slots[toKebabCase(col.field as string)])">
                  <slot
                    :name="$slots[toKebabCase(col.field as string)] ? `${toKebabCase(col.field as string)}` : col.field"
                    :row="scope.row"
                    :column="scope.column"
                    :row-index="scope.rowIndex"
                  />
                </template>
                <template v-else-if="hasFormatter(col)">
                  {{ callFormatter(col, scope.row) }}
                </template>
                <template v-else-if="shouldTransform(col, scope.row)">
                  {{ transformLabel(col, scope.row) }}
                </template>
                <template v-else>
                  {{ scope.row[col.field as string] }}
                </template>
                <div
                  v-if="shouldShowError(col, scope.row)"
                  class="y-edit-table-cell-error"
                  :title="getCellError(col, scope.row)"
                >
                  {{ getCellError(col, scope.row) }}
                </div>
              </template>
            </template>
          </template>

          <!-- 编辑态单元格渲染：按 component 渲染 a-input/a-input-number/a-select -->
          <template v-if="col.type !== 'action' && col.type !== 'expand' && col.field" #edit="{ row }">
            <div class="y-edit-table-editor" :class="{ 'is-error': shouldShowError(col, row) }">
              <Tooltip v-bind="getErrorTooltipProps(col, row)">
                <component
                  :is="resolveEditor(col, row)"
                  v-bind="editorProps(col, row)"
                  :value="row[col.field]"
                  v-on="editorEvents(col, row)"
                />
              </Tooltip>
            </div>
          </template>

          <!-- 自定义筛选面板插槽：与 YTable 对齐，支持 #<field>-filter / #<field>Filter / #filter -->
          <template
            v-if="
              (col.field &&
                ($slots[(col.field as string) + 'Filter'] ||
                  $slots[`${col.field as string}-filter`] ||
                  $slots[`${toKebabCase(col.field as string)}-filter`])) ||
              $slots.filter
            "
            #filter="scope"
          >
            <template v-if="col.field && $slots[(col.field as string) + 'Filter']">
              <slot :name="(col.field as string) + 'Filter'" v-bind="scope" />
            </template>
            <template v-else-if="col.field && $slots[`${col.field as string}-filter`]">
              <slot :name="`${col.field as string}-filter`" v-bind="scope" />
            </template>
            <template v-else-if="col.field && $slots[`${toKebabCase(col.field as string)}-filter`]">
              <slot :name="`${toKebabCase(col.field as string)}-filter`" v-bind="scope" />
            </template>
            <template v-else-if="$slots.filter">
              <slot name="filter" v-bind="scope" />
            </template>
          </template>

          <!-- 展开行内容插槽（兼容 #expand-row） -->
          <template v-if="col.type === 'expand' && ($slots['expand-row'] || $slots.expandRow)" #content="scope">
            <slot v-if="$slots['expand-row']" name="expand-row" v-bind="scope" />
            <slot v-else name="expandRow" v-bind="scope" />
          </template>
        </vxe-column>
      </template>
      <!-- 拖拽把手列（vxe 内置 drag-sort）- 放右侧 -->
      <vxe-column
        v-if="rowDragable && showDragHandle && dragHandlePlacement === 'right'"
        :width="dragHandleWidth"
        align="center"
        :resizable="false"
        :show-overflow="false"
        :fixed="dragHandleFixedComputed"
        drag-sort
      />
    </vxe-table>

    <!-- 添加按钮 -->
    <div v-if="addable" class="y-edit-table-add">
      <div class="y-edit-table-add__btn" @click="handleAdd">{{ resolvedAddBtnText }}</div>
    </div>

    <!-- 分页 -->
    <div v-if="pageable" class="y-edit-table-pagination">
      <Pagination
        :current="innerPagination.current"
        :page-size="innerPagination.pageSize"
        :total="computedTotal"
        :show-size-changer="innerPagination.showSizeChanger"
        :show-quick-jumper="innerPagination.showQuickJumper"
        :page-size-options="innerPagination.pageSizeOptions as any"
        @change="handleAntdChange"
        @show-size-change="handleAntdShowSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVxeLocale } from '../locale/useVxeLocale';
useVxeLocale();
import { Pagination, Tooltip } from 'ant-design-vue';
import type { PropType } from 'vue';
import { computed, nextTick, ref, useAttrs } from 'vue';
import type { VxeTablePropTypes } from 'vxe-table';
import { VxeColgroup, VxeColumn, VxeTable } from 'vxe-table';
import ActionColumn from '../table/ActionColumn.vue';
import { useStableConfig } from '../table/hooks/useStableConfig';
import type { ActionButtonConfig, YTableActionConfig } from '../table/type';
import {
  useActionConfig,
  useAutoScrollOnAdd,
  useColumns,
  useEditors,
  useOptions,
  usePagination,
  useRowDrag,
  useStyleVars,
  useToolbar,
  useValidation,
  useVxeInstall,
  useXTableProps,
} from './hooks';
import { useTableDragScroll } from '../table/hooks/useTableDragScroll';
import { makeProxyTableInstance } from '../table/utils';
import { resolveEditComponentName } from './constant';
import type { YEditTableColumn, YEditTableErrorTooltipConfig, YEditTableErrorTooltipMode } from './type.ts';
import { useLocale } from '../locale/useLocale';

defineOptions({ name: 'YEditTable' });

defineSlots<{
  [key: string]: (props?: any) => any;
}>();

// Props
const props = defineProps({
  data: { type: Array as PropType<any[]>, default: (): any[] => [] },
  columns: { type: Array as PropType<YEditTableColumn[]>, default: (): YEditTableColumn[] => [] },
  tableConfig: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  optionsMap: { type: Object as PropType<Record<string, any[]>>, default: () => ({}) },
  rowOptionsFieldName: { type: String as PropType<string>, default: 'options' },
  disabled: { type: Boolean as PropType<boolean>, default: false },
  loading: { type: Boolean as PropType<boolean>, default: false },
  maxHeight: { type: [Number, String] as PropType<number | string>, default: undefined },
  /** 操作列（不再默认追加，仅当外部提供列 type: 'action' 或提供 actionConfig.buttons 时手动使用） */
  actionConfig: {
    type: Object as PropType<YTableActionConfig>,
    default: (): YTableActionConfig => ({ buttons: [] as ActionButtonConfig[] }),
  },
  /** 拖拽 */
  rowDragable: { type: Boolean as PropType<boolean>, default: false },
  showDragHandle: { type: Boolean as PropType<boolean>, default: true },
  dragHandleWidth: { type: [Number, String] as PropType<number | string>, default: 46 },
  /** 拖拽把手列位置与固定 */
  dragHandlePlacement: { type: String as PropType<'left' | 'right'>, default: 'left' },
  dragHandleFixed: { type: [Boolean, String] as PropType<boolean | 'left' | 'right'>, default: false },
  rowDragConfig: { type: Object as PropType<VxeTablePropTypes.RowDragConfig> },
  /** 工具栏/展开 */
  toolbarConfig: { type: Object as PropType<{ custom?: boolean }>, default: () => ({ custom: false }) },
  expandConfig: { type: Object as PropType<VxeTablePropTypes.ExpandConfig>, default: () => ({}) },
  /** 分页 */
  pageable: { type: Boolean as PropType<boolean>, default: false },
  pagination: {
    type: Object as PropType<{
      current: number;
      pageSize: number;
      total?: number;
      showSizeChanger?: boolean;
      showQuickJumper?: boolean;
      pageSizeOptions?: (number | string)[];
      remote?: boolean;
    }>,
    default: () => ({
      current: 1,
      pageSize: 20,
      total: 0,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      remote: false,
    }),
  },
  /** UI */
  addable: { type: Boolean as PropType<boolean>, default: false },
  addBtnText: { type: String as PropType<string>, default: '' },
  /** 新增行位置：'top' 插入到顶部，'bottom' 追加到底部 */
  addPosition: { type: String as PropType<'top' | 'bottom'>, default: 'bottom' },
  /** 添加行后是否自动滚动到新行 */
  autoScrollOnAdd: { type: Boolean as PropType<boolean>, default: true },
  /** 校验错误 Tooltip 配置 */
  errorTooltipConfig: {
    type: [Boolean, Object] as PropType<false | YEditTableErrorTooltipConfig>,
    default: () => ({}),
  },
} as const);

const { t } = useLocale('common');
const resolvedAddBtnText = computed(() => props.addBtnText || t('add'));

const emit = defineEmits<{
  (e: 'update:data', data: any[]): void;
  (e: 'updateRow', payload: { row: any; key: string; value: any }): void;
  (e: 'add'): void;
  (e: 'delete', scope: any, btn: any, helpers: { close: () => void; hideLoading: () => void }): void;
  (e: 'page-change', payload: { current: number; pageSize: number }): void;
  (e: 'size-change', size: number): void;
  (e: 'filter-change', params: any): void;
}>();

/** 筛选变化回调：与 YTable 对齐，透传 vxe 的 filter-change 参数 */
const handleFilterChange = (params: any) => emit('filter-change', params);

// refs
const tableRef = ref<InstanceType<typeof VxeTable>>();

// 将驼峰/下划线转换为中划线（用于 DOM 模板下的插槽名兼容）
const toKebabCase = (input: string): string => {
  return String(input)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
};

// 安装 vxe-pc-ui
useVxeInstall();

// 校验能力与 tooltip 内容清洗
const {
  getCellError,
  handleEditClosed,
  isActiveErrorCell,
  scheduleValidateRow,
  validate: validateInternal,
  showTooltipContent,
  shouldShowError,
} = useValidation(props, tableRef);

// vxe props 聚合
const { xTableProps } = useXTableProps(props, showTooltipContent);
const attrs = useAttrs();

// 样式变量
const { wrapperStyleVars } = useStyleVars(xTableProps);

// 工具栏
const { toolbarConfigComputed } = useToolbar(props.toolbarConfig);

// 分页
const { innerPagination, computedTotal, displayData, handleAntdChange, handleAntdShowSizeChange } = usePagination(
  props,
  emit
);

const rawTableProps = computed(() => ({
  ...xTableProps.value,
  ...(attrs as any),
  toolbarConfig: toolbarConfigComputed.value,
  expandConfig: props.expandConfig,
}));
const mergedTableProps = useStableConfig(() => rawTableProps.value as Record<string, any>);

// 字典/展示
const { getOptions, transformLabel } = useOptions(props);

// 单元格更新
const updateCell = (row: any, key: string, value: any) => {
  row[key] = value;
  emit('updateRow', { row, key, value });
};

// 编辑器
const { resolveEditor, editorProps, editorEvents } = useEditors(getOptions, updateCell, scheduleValidateRow);

// 拖拽
const { dragHandleFixedComputed, handleRowDragend } = useRowDrag(props, tableRef, emit);

// 行拖拽自动滚动支持
useTableDragScroll(tableRef, {
  enabled: computed(() => props.rowDragable === true),
  threshold: 50,
  maxSpeed: 15,
});

// 添加行后自动滚动到新行
const { scrollToNewRow } = useAutoScrollOnAdd(tableRef, {
  addPosition: props.addPosition,
});

/** 点击添加按钮：先通知业务层添加数据，再自动滚动到新行 */
const handleAdd = () => {
  emit('add');
  if (props.autoScrollOnAdd) {
    scrollToNewRow();
  }
};

// 列 props
const { getColumnProps, getColgroupProps } = useColumns(props);

// 操作列配置
const { resolveActionConfig } = useActionConfig({ actionConfig: props.actionConfig });

// 查看态是否需要翻译展示
const shouldTransform = (col: any, row: any) => {
  if (!col) return false;
  if (col?.isTransform) return true;
  const comp = resolveEditComponentName(col, row);
  if (
    comp === 'form-item-select' ||
    comp === 'form-item-tree-select' ||
    comp === 'form-item-cascader' ||
    comp === 'form-item-checkbox' ||
    comp === 'form-item-switch'
  )
    return true;
  const opts = getOptions(col, row);
  return Array.isArray(opts) && opts.length > 0;
};

// 自定义 formatter：优先于字典翻译；额外注入 transformed 文本
const hasFormatter = (col: any) => typeof col?.formatter === 'function';
const callFormatter = (col: any, row: any) => {
  try {
    const value = row?.[col?.field as string];
    const transformed = shouldTransform(col, row) ? (transformLabel(col, row) as any) : value;
    return col?.formatter?.({ cellValue: value, row, column: col, transformed });
  } catch (e) {
    return row?.[col?.field as string];
  }
};

const DEFAULT_ERROR_TOOLTIP_CLASS = 'y-edit-table-error-tooltip';
const DEFAULT_ERROR_TOOLTIP_MAX_WIDTH = 260;
const ERROR_TOOLTIP_MODES: YEditTableErrorTooltipMode[] = ['active', 'hover', 'always', 'none'];

/** 规范化校验错误 Tooltip 展示模式。 */
const normalizeErrorTooltipMode = (mode?: YEditTableErrorTooltipMode): YEditTableErrorTooltipMode => {
  return mode && ERROR_TOOLTIP_MODES.includes(mode) ? mode : 'active';
};

/** 将数字宽度转换为合法 CSS 尺寸。 */
const normalizeCssSize = (value?: number | string): string => {
  if (typeof value === 'number') {
    return `${value}px`;
  }
  return value || `${DEFAULT_ERROR_TOOLTIP_MAX_WIDTH}px`;
};

const normalizedErrorTooltipConfig = computed<YEditTableErrorTooltipConfig>(() => {
  if (props.errorTooltipConfig === false) {
    return {
      mode: 'none',
      placement: 'topLeft',
      maxWidth: DEFAULT_ERROR_TOOLTIP_MAX_WIDTH,
      autoAdjustOverflow: true,
    };
  }

  const rawConfig: YEditTableErrorTooltipConfig =
    typeof props.errorTooltipConfig === 'object' && props.errorTooltipConfig
      ? (props.errorTooltipConfig as YEditTableErrorTooltipConfig)
      : {};

  return {
    ...rawConfig,
    mode: normalizeErrorTooltipMode(rawConfig.mode),
    placement: rawConfig.placement ?? 'topLeft',
    maxWidth: rawConfig.maxWidth ?? DEFAULT_ERROR_TOOLTIP_MAX_WIDTH,
    autoAdjustOverflow: rawConfig.autoAdjustOverflow ?? true,
  };
});

/** 生成校验错误 Tooltip 参数，避免多个错误气泡同时遮挡。 */
const getErrorTooltipProps = (col: any, row: any) => {
  const config = normalizedErrorTooltipConfig.value;
  const mode = normalizeErrorTooltipMode(config.mode);
  const hasError = shouldShowError(col, row);
  const field = col?.field as string | undefined;
  const title = mode === 'none' || !hasError ? undefined : getCellError(col, row);
  const overlayClassName = [DEFAULT_ERROR_TOOLTIP_CLASS, config.overlayClassName].filter(Boolean).join(' ');
  const tooltipProps: Record<string, any> = {
    title,
    placement: config.placement,
    getPopupContainer: config.getPopupContainer ?? getPopupEl,
    overlayClassName,
    overlayInnerStyle: {
      maxWidth: normalizeCssSize(config.maxWidth),
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      ...(config.overlayInnerStyle || {}),
    },
    autoAdjustOverflow: config.autoAdjustOverflow,
  };

  if (config.mouseEnterDelay !== undefined) {
    tooltipProps.mouseEnterDelay = config.mouseEnterDelay;
  }
  if (config.mouseLeaveDelay !== undefined) {
    tooltipProps.mouseLeaveDelay = config.mouseLeaveDelay;
  }
  if (config.zIndex !== undefined) {
    tooltipProps.zIndex = config.zIndex;
  }

  if (mode === 'none') {
    tooltipProps.open = false;
  } else if (mode === 'always') {
    tooltipProps.open = hasError;
  } else if (mode === 'active' && field && hasError && isActiveErrorCell(row, field)) {
    tooltipProps.open = true;
  }

  return tooltipProps;
};

// 暴露方法
defineExpose({
  getTableInstance: () => makeProxyTableInstance(tableRef.value),
  async validate() {
    const res: any = await validateInternal();
    if (!res?.valid && res?.firstError) {
      const { row, field } = res.firstError;
      await nextTick();
      try {
        tableRef.value?.scrollToRow?.(row);
        tableRef.value?.setEditCell?.(row, field);
      } catch (e) {
        // ignore
      }
    }
    return res;
  },
});

function getPopupEl(_triggerNode?: HTMLElement) {
  return (typeof document === 'undefined' ? undefined : document.body) as any;
}
</script>

<style scoped lang="less">
.y-edit-table-wrapper {
  width: 100%;

  /* 将 vxe-ui 的主色映射到组件库主题变量 */
  --vxe-ui-font-primary-color: var(--primary-color, #3371ff);
  --vxe-ui-toolbar-custom-active-background-color: color-mix(in srgb, var(--primary-color, #3371ff) 12%, transparent);
  --vxe-ui-table-row-hover-background-color: color-mix(in srgb, var(--primary-color, #3371ff) 8%, transparent);
  --vxe-ui-table-row-current-background-color: color-mix(in srgb, var(--primary-color, #3371ff) 14%, transparent);
  --vxe-ui-table-row-checkbox-checked-background-color: color-mix(
    in srgb,
    var(--primary-color, #3371ff) 12%,
    transparent
  );
  --vxe-ui-table-row-radio-checked-background-color: color-mix(in srgb, var(--primary-color, #3371ff) 12%, transparent);
  --vxe-ui-table-row-hover-current-background-color: color-mix(in srgb, var(--primary-color, #3371ff) 18%, transparent);
  --vxe-ui-table-row-hover-checkbox-checked-background-color: color-mix(
    in srgb,
    var(--primary-color, #3371ff) 16%,
    transparent
  );
  --vxe-ui-table-row-hover-radio-checked-background-color: color-mix(
    in srgb,
    var(--primary-color, #3371ff) 16%,
    transparent
  );
}

.y-edit-table-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0;
}

.y-edit-table-pagination :deep(.ant-pagination-options-size-changer) {
  min-width: 112px;
}

.y-edit-table-pagination :deep(.ant-pagination-options-size-changer .ant-select-selector) {
  min-width: 112px;
}

.y-edit-table-pagination :deep(.ant-pagination-options .ant-select-dropdown) {
  min-width: 112px !important;
  width: max-content !important;
}

.y-edit-table-pagination :deep(.ant-pagination-options .ant-select-item-option-content) {
  overflow: visible;
  text-overflow: clip;
}

.y-edit-table-add {
  width: 100%;
  margin-top: 8px;
}

.y-edit-table-add__btn {
  width: 100%;
  height: 28px;
  border-radius: 4px;
  border: 1px dashed #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
}

.y-edit-table-add__btn:hover {
  border-color: var(--primary-color, #3371ff);
  color: var(--primary-color, #3371ff);
}

.y-edit-table-cell-error {
  color: var(--yss-color-error-6, var(--ant-error-color, #ff4d4f));
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.y-edit-table-editor.is-error :deep(.ant-input),
.y-edit-table-editor.is-error :deep(.ant-select-selector),
.y-edit-table-editor.is-error :deep(.ant-picker),
.y-edit-table-editor.is-error :deep(.ant-input-number) {
  border-color: var(--yss-color-error-6, var(--ant-error-color, #ff4d4f)) !important;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--yss-color-error-6, var(--ant-error-color, #ff4d4f)) 20%, transparent);
}

/* 空状态高度与行高联动 */
::deep(.vxe-table--empty-block) {
  min-height: var(--rowHeight) !important;
}

/* 与旧组件库对齐的 vxe 自定义区域主题色（使用主题变量） */
:deep(.vxe-table-custom--checkbox-option.is--checked),
:deep(.vxe-table-custom--checkbox-option.is--indeterminate) {
  color: var(--primary-color, #3371ff);
}

:deep(.vxe-table-custom--checkbox-option.is--checked) .vxe-checkbox--icon,
:deep(.vxe-table-custom--checkbox-option.is--indeterminate) .vxe-checkbox--icon {
  color: var(--primary-color, #3371ff);
}

/* vxe 自定义弹层按钮描边颜色 */
:deep(.vxe-custom--wrapper) .vxe-button.is--circle {
  border-color: var(--primary-color, #3371ff);
  border-radius: 3px;
}

/* 空状态高度与行高联动 */
:deep(.vxe-table--empty-block) {
  min-height: var(--rowHeight) !important;
}

:deep(.yss-custom-vxe-table .vxe-table--header-inner-wrapper) {
  /* 仅保持背景色；高度交给 vxe 自动计算，避免分组表头被压扁 */
  background-color: rgb(245 248 255);
}

:deep(.vxe-cell--valid-error-tip) {
  display: none;
}

/* 自定义表头文字颜色 */
:deep(.vxe-table .vxe-table--header-wrapper) {
  color: #11192a;
}

/* 自定义表格内容文字颜色 */
:deep(.vxe-table--render-default) {
  color: #323847;
}

/* ==========================================================
 * 暗色模式适配 (Dark Mode)
 * dumi / yss-ui 通用暗色属性：[data-prefers-color='dark']
 * 恢复 vxe-table 自带的暗色变量替代本组件强行指定的亮色
 * ========================================================== */
:root[data-prefers-color='dark'] .y-edit-table-wrapper :deep(.yss-custom-vxe-table .vxe-table--header-inner-wrapper) {
  background-color: var(--vxe-ui-table-header-background-color);
}

:root[data-prefers-color='dark'] .y-edit-table-wrapper :deep(.vxe-table .vxe-table--header-wrapper) {
  color: var(--vxe-ui-table-header-font-color);
}

:root[data-prefers-color='dark'] .y-edit-table-wrapper :deep(.vxe-table--render-default) {
  color: var(--vxe-ui-font-color);
}
</style>

<style lang="less">
/* 全局：为 vxe-ui 绑定主题主色，解决部分内部节点与 Teleport 弹层不继承 scoped 变量的问题 */
:root {
  --vxe-ui-font-primary-color: var(--primary-color, #3371ff);
  --vxe-ui-toolbar-custom-active-background-color: color-mix(in srgb, var(--primary-color, #3371ff) 12%, transparent);
  --vxe-ui-table-row-hover-background-color: color-mix(in srgb, var(--primary-color, #3371ff) 8%, transparent);
  --vxe-ui-table-row-current-background-color: color-mix(in srgb, var(--primary-color, #3371ff) 14%, transparent);
  --vxe-ui-table-row-checkbox-checked-background-color: color-mix(
    in srgb,
    var(--primary-color, #3371ff) 12%,
    transparent
  );
  --vxe-ui-table-row-radio-checked-background-color: color-mix(in srgb, var(--primary-color, #3371ff) 12%, transparent);
  --vxe-ui-table-row-hover-current-background-color: color-mix(in srgb, var(--primary-color, #3371ff) 18%, transparent);
  --vxe-ui-table-row-hover-checkbox-checked-background-color: color-mix(
    in srgb,
    var(--primary-color, #3371ff) 16%,
    transparent
  );
  --vxe-ui-table-row-hover-radio-checked-background-color: color-mix(
    in srgb,
    var(--primary-color, #3371ff) 16%,
    transparent
  );
}

.vxe-table-custom-modal-wrapper,
.vxe-table-custom-drawer-wrapper {
  --vxe-ui-font-primary-color: var(--primary-color, #3371ff);
  --vxe-ui-toolbar-custom-active-background-color: color-mix(in srgb, var(--primary-color, #3371ff) 12%, transparent);
  --vxe-ui-table-row-hover-background-color: color-mix(in srgb, var(--primary-color, #3371ff) 8%, transparent);
  --vxe-ui-table-row-current-background-color: color-mix(in srgb, var(--primary-color, #3371ff) 14%, transparent);
  --vxe-ui-table-row-checkbox-checked-background-color: color-mix(
    in srgb,
    var(--primary-color, #3371ff) 12%,
    transparent
  );
  --vxe-ui-table-row-radio-checked-background-color: color-mix(in srgb, var(--primary-color, #3371ff) 12%, transparent);
  --vxe-ui-table-row-hover-current-background-color: color-mix(in srgb, var(--primary-color, #3371ff) 18%, transparent);
  --vxe-ui-table-row-hover-checkbox-checked-background-color: color-mix(
    in srgb,
    var(--primary-color, #3371ff) 16%,
    transparent
  );
  --vxe-ui-table-row-hover-radio-checked-background-color: color-mix(
    in srgb,
    var(--primary-color, #3371ff) 16%,
    transparent
  );
}

/* 通过全局非 scoped 设置 tooltip 的颜色搭配，与原始 JS 的硬覆盖保持一致并在暗色下重置 */
.y-edit-table-error-tooltip {
  .ant-tooltip-inner {
    background-color: #fff;
    color: var(--yss-color-error-6, var(--ant-error-color, #ff4d4f));
  }

  .ant-tooltip-arrow-content {
    background-color: #fff;
  }

  .ant-tooltip-arrow::before,
  .ant-tooltip-arrow::after {
    background: #fff;
  }
}

:root[data-prefers-color='dark'] .y-edit-table-error-tooltip {
  .ant-tooltip-inner {
    background-color: rgb(0 0 0 / 85%); /* 或原版 tooltip 暗色背景 */
    color: var(--yss-color-error-6, var(--ant-error-color, #ff4d4f));
  }

  .ant-tooltip-arrow-content {
    background-color: rgb(0 0 0 / 85%);
  }

  .ant-tooltip-arrow::before,
  .ant-tooltip-arrow::after {
    background: rgb(0 0 0 / 85%);
  }
}
</style>
