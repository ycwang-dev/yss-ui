<template>
  <!-- 需要二次确认时，用 Popconfirm 包裹 -->
  <Popconfirm
    v-if="config?.isConfirm && allowed"
    v-model:open="visible"
    :disabled="isDisabled"
    :title="titleText"
    :ok-text="okText"
    :cancel-text="cancelText"
    :placement="isLast ? 'topLeft' : undefined"
    overlay-class-name="y-table-action-popconfirm"
    v-bind="config?.confirmProps?.popProps"
    :ok-button-props="{ loading: needLoading && loading }"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <template #default>
      <Button :type="antdType" size="small" :disabled="isDisabled" :title="actionText" class="y-table-action-link">
        <span class="y-table-action-link__text">{{ actionText }}</span>
      </Button>
    </template>
  </Popconfirm>
  <!-- 无确认时，直接按钮 -->
  <Button
    v-else-if="allowed || config?.fallback === 'disable'"
    :type="antdType"
    size="small"
    :disabled="isDisabled || (!allowed && config?.fallback === 'disable')"
    :loading="needLoading && loading"
    :title="actionText"
    class="y-table-action-link"
    @click="handleConfirm"
  >
    <span class="y-table-action-link__text">{{ actionText }}</span>
  </Button>
</template>

<script setup lang="ts">
import { hasAuth } from '@yss-ui/utils';
import { Button, Popconfirm } from 'ant-design-vue';
import { computed, ref } from 'vue';
import { useLocale } from '../locale/useLocale';
import type { ActionButtonConfig } from './type';

defineOptions({ name: 'YTableActionButton' });

const { t } = useLocale('table');

const props = defineProps<{
  scope: any;
  config: ActionButtonConfig;
  isLast?: boolean;
}>();

/** 通知上层操作容器关闭当前菜单。 */
const emit = defineEmits<{
  'request-close': [];
}>();

const loading = ref(false);
const visible = ref(false);

const allowed = computed(() => !props.config?.permissionCode || hasAuth(props.config.permissionCode));
const isDisabled = computed(() => props.config?.disabledFn?.(props.scope) ?? false);
const needLoading = computed(() => !!props.config?.confirmProps?.needLoading);
const actionText = computed(() => props.config?.text ?? props.config?.label ?? '');

const titleText = computed(() => {
  const { confirmProps } = props.config || {};
  return confirmProps?.title || t('confirmTitle', { action: actionText.value });
});
const okText = computed(() => props.config?.confirmProps?.okText || t('confirm'));
const cancelText = computed(() => props.config?.confirmProps?.cancelText || t('cancel'));

const antdType = computed(() => {
  const t = props.config?.type || 'link';
  // text/link 在 antd 中都可用，默认使用 link 更贴近旧视觉
  if (t === 'text' || t === 'link') return 'link';
  return t as any;
});

const hideLoading = () => {
  loading.value = false;
};
const close = () => {
  visible.value = false;
};

/** 执行已通过禁用与确认校验的操作，并通知上层菜单立即收起。 */
const handleConfirm = async () => {
  if (isDisabled.value || (!allowed.value && props.config?.fallback === 'disable')) return;
  if (needLoading.value) loading.value = true;
  const clickHandler = props.config?.clickFn ?? props.config?.click;
  emit('request-close');
  await Promise.resolve(clickHandler?.(props.scope, props.config, { close, hideLoading }));
  if (!needLoading.value) {
    // 非受控 loading，直接关闭弹层
    close();
  }
};

/** 取消二次确认并通知上层菜单收起。 */
const handleCancel = () => {
  hideLoading();
  close();
  emit('request-close');
};
</script>

<style scoped lang="less">
.y-table-action-link {
  padding: 0 2px;
  color: var(--primary-color, #3371ff);

  &:hover:not(:disabled, .ant-btn-disabled),
  &:focus:not(:disabled, .ant-btn-disabled) {
    color: var(--primary-color, #3371ff);
    opacity: 0.85;
  }

  /* 禁用态需覆盖主色，否则 disabled 只拦点击、视觉仍是可点主色 */
  &:disabled,
  &.ant-btn-disabled {
    color: var(--ant-disabled-color, rgb(0 0 0 / 25%));
    cursor: not-allowed;
    opacity: 1;

    &:hover,
    &:focus {
      color: var(--ant-disabled-color, rgb(0 0 0 / 25%));
      opacity: 1;
    }
  }
}

.y-table-action-link__text {
  display: inline-block;
  max-width: 180px; /* 防止文本过长撑开列 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

<style lang="less">
/**
 * 修复 Popconfirm 按钮在 loading 状态下折行的问题
 * 注意：Popconfirm 弹出层通过 teleport 渲染到 body，scoped 样式无法穿透
 */
.y-table-action-popconfirm .ant-popconfirm-buttons {
  display: flex;
  justify-content: flex-end;
}
</style>
