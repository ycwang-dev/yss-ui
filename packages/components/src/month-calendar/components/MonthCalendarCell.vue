<script setup lang="ts">
import { computed } from 'vue';
import type { CSSProperties } from 'vue';
import type { YMonthCalendarCellClass, YMonthCalendarCellContext, YMonthCalendarPointerPayload } from '../types';

defineOptions({ name: 'YMonthCalendarCell' });

const props = defineProps<{
  context: YMonthCalendarCellContext;
  contextMenuEnabled: boolean;
  showContent: boolean;
  focusable: boolean;
  loading: boolean;
  customClass?: YMonthCalendarCellClass;
  customStyle?: CSSProperties;
}>();

const emit = defineEmits<{
  click: [payload: YMonthCalendarPointerPayload];
  dblclick: [payload: YMonthCalendarPointerPayload];
  contextmenu: [payload: YMonthCalendarPointerPayload];
  keydown: [event: KeyboardEvent, context: YMonthCalendarCellContext];
}>();

const interactionDisabled = computed(() => props.context.isDisabled || props.loading);

/** 构造统一鼠标事件载荷。 */
const createPayload = (event: MouseEvent): YMonthCalendarPointerPayload => ({
  ...props.context,
  event,
});

/** 处理普通点击。 */
const handleClick = (event: MouseEvent): void => {
  event.stopPropagation();
  if (!interactionDisabled.value) {
    emit('click', createPayload(event));
  }
};

/** 处理双击。 */
const handleDoubleClick = (event: MouseEvent): void => {
  event.stopPropagation();
  if (!interactionDisabled.value) {
    emit('dblclick', createPayload(event));
  }
};

/** 处理右键。 */
const handleContextMenu = (event: MouseEvent): void => {
  if (interactionDisabled.value) {
    event.preventDefault();
    return;
  }
  if (props.contextMenuEnabled) {
    event.preventDefault();
  }
  emit('contextmenu', createPayload(event));
};
</script>

<template>
  <div
    :class="[
      'y-month-calendar__cell',
      {
        'y-month-calendar__cell--today': context.isToday,
        'y-month-calendar__cell--selected': context.isSelected,
        'y-month-calendar__cell--outside': !context.isCurrentMonth,
        'y-month-calendar__cell--disabled': context.isDisabled,
      },
      customClass,
    ]"
    :style="customStyle"
    :data-date-key="context.dateKey"
    :tabindex="focusable ? 0 : -1"
    role="button"
    :aria-label="context.date.format('YYYY-MM-DD')"
    :aria-current="context.isToday ? 'date' : undefined"
    :aria-selected="context.isSelected"
    :aria-disabled="interactionDisabled"
    @click="handleClick"
    @dblclick="handleDoubleClick"
    @contextmenu="handleContextMenu"
    @keydown="emit('keydown', $event, context)"
  >
    <slot v-if="showContent" />
  </div>
</template>
