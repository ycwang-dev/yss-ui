<script setup lang="ts">
import { VxeColumn } from 'vxe-table';
import EditTableCell from './EditTableCell.vue';
import EditCellEditor from './EditCellEditor.vue';
import type { EditTableContext } from '../hooks/useEditTableContext';
import { getCellSlotName, getExpandSlotName, getFilterSlotName, getHeaderSlotName } from '../constant';

defineOptions({ name: 'EditTableColumn' });

const props = defineProps<{
  /** 当前列定义 */
  col: any;
  /** 上下文状态集合 */
  ctx: EditTableContext;
}>();
</script>

<template>
  <vxe-column v-bind="props.ctx.getColumnProps(col)">
    <template v-if="getHeaderSlotName(col, $slots)" #header="scope">
      <slot :name="getHeaderSlotName(col, $slots)" v-bind="scope" />
    </template>
    <template #default="scope">
      <EditTableCell
        :col="col"
        :scope="scope"
        :action-config="col.type === 'action' ? props.ctx.resolveActionConfig(col) : undefined"
        :has-formatter="props.ctx.hasFormatter(col)"
        :formatted-value="props.ctx.callFormatter(col, scope.row)"
        :should-transform="props.ctx.shouldTransform(col, scope.row)"
        :transformed-value="props.ctx.transformLabel(col, scope.row)"
        :cell-error="props.ctx.shouldShowError(col, scope.row) ? props.ctx.getCellError(col, scope.row) : ''"
      >
        <template v-if="getCellSlotName(col, $slots)" #custom-cell="slotScope">
          <slot :name="getCellSlotName(col, $slots)" v-bind="slotScope" />
        </template>
        <template v-if="$slots['action-more-icon']" #action-more-icon>
          <slot name="action-more-icon" />
        </template>
        <template v-else-if="$slots.actionMoreIcon" #actionMoreIcon>
          <slot name="actionMoreIcon" />
        </template>
      </EditTableCell>
    </template>
    <template v-if="col.type !== 'action' && col.type !== 'expand' && col.field" #edit="{ row }">
      <EditCellEditor
        :col="col"
        :row="row"
        :editor-component="props.ctx.resolveEditor(col, row)"
        :editor-props="props.ctx.editorProps(col, row)"
        :editor-events="props.ctx.editorEvents(col, row)"
        :tooltip-props="props.ctx.getErrorTooltipProps(col, row)"
        :is-error="props.ctx.shouldShowError(col, row)"
      />
    </template>
    <template v-if="getFilterSlotName(col, $slots)" #filter="scope">
      <slot :name="getFilterSlotName(col, $slots)" v-bind="scope" />
    </template>
    <template v-if="getExpandSlotName(col, $slots)" #content="scope">
      <slot :name="getExpandSlotName(col, $slots)" v-bind="scope" />
    </template>
  </vxe-column>
</template>
