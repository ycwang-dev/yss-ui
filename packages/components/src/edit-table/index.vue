<script setup lang="ts">
import { ref, useAttrs } from 'vue';
import { VxeColgroup, VxeColumn, VxeTable } from 'vxe-table';
import { useVxeLocale } from '../locale/useVxeLocale';
import { editTableProps } from './constant';
import EditTableColumn from './components/EditTableColumn.vue';
import EditTablePagination from './components/EditTablePagination.vue';
import { useEditTableContext, useVxeInstall } from './hooks';

defineOptions({ name: 'YEditTable' });
useVxeInstall();
useVxeLocale();

defineSlots<{ [key: string]: (props?: any) => any }>();

const props = defineProps(editTableProps);

const emit = defineEmits<{
  (e: 'update:data', data: any[]): void;
  (e: 'updateRow', payload: { row: any; key: string; value: any }): void;
  (e: 'add'): void;
  (e: 'delete', scope: any, btn: any, helpers: { close: () => void; hideLoading: () => void }): void;
  (e: 'page-change', payload: { current: number; pageSize: number }): void;
  (e: 'size-change', size: number): void;
  (e: 'filter-change', params: any): void;
}>();

const tableRef = ref<InstanceType<typeof VxeTable>>();
const attrs = useAttrs();
const ctx = useEditTableContext(props, emit, tableRef, attrs);

const {
  resolvedAddBtnText,
  handleFilterChange,
  handleEditClosed,
  handleRowDragend,
  handleTableScroll,
  mergedTableProps,
  wrapperStyleVars,
  innerPagination,
  computedTotal,
  displayData,
  handleAntdChange,
  handleAntdShowSizeChange,
  dragHandleFixedComputed,
  handleAdd,
} = ctx;

defineExpose({
  getTableInstance: ctx.getTableInstance,
  validate: ctx.validate,
});
</script>

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
      @scroll="handleTableScroll"
    >
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
        <!-- 分组表头 -->
        <vxe-colgroup v-if="col.children && col.children.length" v-bind="ctx.getColgroupProps(col as any)">
          <template v-if="$slots['group-header'] || $slots.groupHeader" #header="scope">
            <slot v-if="$slots['group-header']" name="group-header" v-bind="scope" />
            <slot v-else name="groupHeader" v-bind="scope" />
          </template>

          <EditTableColumn
            v-for="sub in col.children"
            :key="(sub as any).field || (sub as any).type"
            :col="sub"
            :ctx="ctx"
          >
            <template v-for="(_, slotName) in $slots" :key="slotName" #[slotName]="slotScope">
              <slot :name="slotName" v-bind="slotScope" />
            </template>
          </EditTableColumn>
        </vxe-colgroup>

        <!-- 普通列 -->
        <EditTableColumn v-else :col="col" :ctx="ctx">
          <template v-for="(_, slotName) in $slots" :key="slotName" #[slotName]="slotScope">
            <slot :name="slotName" v-bind="slotScope" />
          </template>
        </EditTableColumn>
      </template>

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
    <EditTablePagination
      v-if="pageable"
      :pagination="innerPagination"
      :total="computedTotal"
      @change="handleAntdChange"
      @show-size-change="handleAntdShowSizeChange"
    />
  </div>
</template>

<style scoped lang="less">
@import url('./style.less');
</style>

<style lang="less">
@import url('./global.less');
</style>
