<template>
  <div class="yss-form-group-header" :data-fullspan="fullSpan ? 'true' : null">
    <div v-if="description" class="yss-form-group-header__desc">
      <slot name="description">{{ description }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';

/** GroupHeader 组件 Props */
export interface GroupHeaderProps {
  description?: string;
  /** 兼容旧用法，若传入也只用于插槽，不再在内容区重复渲染 */
  title?: string;
  /** 是否让分组标题占满整行（默认 true，可由 schema 的 x-component-props 控制） */
  fullSpan?: boolean;
}
// 默认让分组标题跨整行；如需参与栅格布局，可显式传 fullSpan=false
const props = withDefaults(defineProps<GroupHeaderProps>(), { description: '', title: '', fullSpan: true });
const { description, fullSpan } = toRefs(props);
</script>

<script lang="ts">
export default { name: 'GroupHeader' };
</script>

<style scoped lang="less">
.yss-form-group-header {
  width: 100%;
  height: 100%;
  padding: 0;
  display: flex;
  align-items: center;
  margin-top: 1px;
}

.yss-form-group-header__desc {
  opacity: 0.75;
  font-size: 12px;
  line-height: 20px;
}
</style>

<style lang="less">
/* 让包含 GroupHeader 的表单项呈现分组样式（类似卡片标题） */
.ant-formily-form-item:has(.yss-form-group-header) .ant-formily-form-item-label,
.ant-form-item:has(.yss-form-group-header) .ant-form-item-label {
  flex: 0 0 auto !important;
  width: auto !important;
  max-width: none !important;
}

.ant-formily-form-item:has(.yss-form-group-header) .ant-formily-form-item-control,
.ant-form-item:has(.yss-form-group-header) .ant-form-item-control {
  flex: 1 1 auto !important;
  padding-top: 0;
}

.ant-formily-form-item:has(.yss-form-group-header) .ant-formily-form-item-label label,
.ant-form-item:has(.yss-form-group-header) .ant-form-item-label > label {
  position: relative;
  padding-left: 10px;
  font-weight: 600;
  color: var(--yss-color-primary-6, var(--ant-primary-color, #3371ff));
  overflow: visible !important;
  text-overflow: clip !important;
  white-space: nowrap;
}

.ant-formily-form-item:has(.yss-form-group-header) .ant-formily-form-item-label label::before,
.ant-form-item:has(.yss-form-group-header) .ant-form-item-label > label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 14px;
  background-color: var(--yss-color-primary-6, var(--ant-primary-color, #3371ff));
  border-radius: 1px;
}

/* 当显示开启 fullSpan 时强制让该项跨整行（不依赖栅格实现细节） */
.ant-formily-form-item:has(.yss-form-group-header[data-fullspan='true']),
.ant-form-item:has(.yss-form-group-header[data-fullspan='true']) {
  /* 覆盖 FormGrid 可能设置的列跨度 */
  grid-column: 1 / -1 !important;
}

.ant-formily-form-item {
  margin-bottom: 16px;
}
</style>
