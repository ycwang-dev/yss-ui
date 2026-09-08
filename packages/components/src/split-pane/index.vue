<script setup lang="ts">
import './index.less';
import { ref, computed, watch, onMounted } from 'vue';
import { useThrottleFn } from '@vueuse/core';
import { YSplitPaneEmits, YSplitPaneProps } from './types';
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons-vue';
import {
  clampWidth,
  DEFAULT_GUTTER_SIZE,
  DEFAULT_INITIAL_WIDTH,
  DEFAULT_MAX_HEIGHT,
  DEFAULT_MAX_WIDTH,
  DEFAULT_MIN_HEIGHT,
  DEFAULT_MIN_WIDTH,
  MOUSEMOVE_THROTTLE_MS,
} from './constant';
import { useLayoutCache } from './hooks/useLayoutCache';
import { initPaneSize } from './hooks/useInitialPaneSize';
import { useCollapse } from './hooks/useCollapse';
import { useCollapseTransition } from './hooks/useCollapseTransition';
import { useDragResize } from './hooks/useDragResize';
import { useVerticalQuickActions } from './hooks/useVerticalQuickActions';
import VerticalQuickActions from './VerticalQuickActions.vue';
import { useLocale } from '../locale/useLocale';

defineOptions({ name: 'YSplitPane' });

const { t } = useLocale('splitPane');

const props = withDefaults(defineProps<YSplitPaneProps>(), {
  direction: 'horizontal',
  initialWidth: DEFAULT_INITIAL_WIDTH,
  initialHeight: DEFAULT_MIN_HEIGHT,
  leftWidth: undefined,
  topHeight: undefined,
  minWidth: DEFAULT_MIN_WIDTH,
  maxWidth: DEFAULT_MAX_WIDTH,
  minHeight: DEFAULT_MIN_HEIGHT,
  maxHeight: DEFAULT_MAX_HEIGHT,
  collapsible: true,
  draggable: true,
  resizeMode: 'realtime',
  collapsed: false,
  destroyOnCollapse: false,
  collapseAnimation: 'size',
  gutterSize: DEFAULT_GUTTER_SIZE,
  storageKey: '',
  showVerticalQuickActions: false,
});

const emits = defineEmits<YSplitPaneEmits>();
const isVertical = computed(() => props.direction === 'vertical');

/** 受控模式标识 */
const isControlled = computed(() => {
  if (isVertical.value) {
    return props.topHeight !== undefined;
  }
  return props.leftWidth !== undefined;
});

/** 左侧宽度状态 */
const leftWidth = ref<number>(props.leftWidth ?? props.initialWidth);

/** 上侧高度状态（vertical 模式使用） */
const getVerticalInitialHeight = () => props.initialHeight ?? props.topHeight ?? props.minHeight ?? DEFAULT_MIN_HEIGHT;
const topHeight = ref<number>(props.topHeight ?? getVerticalInitialHeight());
const getMinSize = () =>
  isVertical.value ? (props.minHeight ?? DEFAULT_MIN_HEIGHT) : (props.minWidth ?? DEFAULT_MIN_WIDTH);
const getMaxSize = () =>
  isVertical.value ? (props.maxHeight ?? DEFAULT_MAX_HEIGHT) : (props.maxWidth ?? DEFAULT_MAX_WIDTH);
const clampPaneSize = (size: number): number => clampWidth(size, getMinSize(), getMaxSize());

/** 统一派发 topHeight 更新事件（兼容 camel / kebab） */
const emitTopHeight = (value: number): void => {
  emits('update:topHeight', value);
};

/** 当前分割尺寸（根据方向在 leftWidth/topHeight 之间切换） */
const paneSize = computed<number>({
  get: () => (isVertical.value ? topHeight.value : leftWidth.value),
  set: size => {
    if (isVertical.value) {
      topHeight.value = size;
      return;
    }
    leftWidth.value = size;
  },
});

const showVerticalQuickActions = computed(() => isVertical.value && props.showVerticalQuickActions);

/** 根元素 ref */
const rootRef = ref<HTMLElement | null>(null);

/** 左侧/上侧面板 DOM 引用 */
const paneRef = ref<HTMLElement | null>(null);

/** 右侧/下侧面板 DOM 引用 */
const rightRef = ref<HTMLElement | null>(null);

// 布局缓存 Hook
const { cachedRect, updateCache } = useLayoutCache(rootRef);

// 折叠展开 Hook
const { isCollapsed, lastWidth, toggleCollapse, handleKeydown } = useCollapse(props, paneSize, isControlled, emits);

/**
 * 获取折叠过渡使用的稳定面板尺寸。
 * @returns 当前或最近一次有效面板尺寸
 */
const getTransitionPaneSize = (): number => {
  const controlledSize = isVertical.value ? props.topHeight : props.leftWidth;
  const currentSize = isControlled.value ? controlledSize : paneSize.value;
  return clampPaneSize((currentSize ?? 0) > 0 ? (currentSize as number) : lastWidth.value);
};

const {
  effectiveAnimation,
  layoutCollapsed,
  transitionPhase,
  transitionActive,
  transitionSize,
  paneContentRendered,
  paneContentVisible,
  isTransitioning,
  completeTransition,
} = useCollapseTransition({
  props,
  isCollapsed,
  isVertical,
  getTransitionSize: getTransitionPaneSize,
});

// 拖拽调整大小 Hook
const { dragging, near, previewSize, previewVisible, startDrag, handleMouseMove, handleMouseLeave } = useDragResize(
  props,
  paneSize,
  isControlled,
  isCollapsed,
  cachedRect,
  emits
);

/**
 * 节流的鼠标移动处理（60fps）
 * 优化悬停检测性能
 */
const throttledMouseMove = useThrottleFn(handleMouseMove, MOUSEMOVE_THROTTLE_MS);

const {
  quickActionsTopOffset,
  hideTopPane,
  resetVerticalPane,
  hideBottomPane,
  showHideTopButton,
  showResetButton,
  showHideBottomButton,
} = useVerticalQuickActions({
  showVerticalQuickActions,
  rootRef,
  cachedRect,
  gutterSize: props.gutterSize,
  draggable: props.draggable,
  storageKey: props.storageKey,
  getMaxSize,
  getVerticalInitialHeight,
  getPaneSize: () => paneSize.value,
  setPaneSize: size => {
    paneSize.value = size;
  },
  emitTopHeight,
});

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  // 初始化布局缓存
  updateCache();

  initPaneSize({
    props,
    isControlled: isControlled.value,
    isCollapsed: isCollapsed.value,
    setPaneSize: size => {
      paneSize.value = size;
    },
    clampPaneSize,
    getVerticalInitialHeight,
    emitTopHeight,
  });
});

/**
 * 同步外部传入的受控尺寸（horizontal: leftWidth, vertical: topHeight）
 */
watch([() => props.leftWidth, () => props.topHeight], ([newWidth, newHeight]) => {
  if (!isControlled.value) return;
  if (!isVertical.value && newWidth !== undefined) {
    leftWidth.value = clampPaneSize(newWidth);
    return;
  }
  if (isVertical.value && newHeight !== undefined) {
    topHeight.value = clampPaneSize(newHeight);
  }
});

/** 计算样式：自定义 CSS 变量 */
const gutterStyle = computed(() => ({
  '--y-split-gutter': `${props.gutterSize}px`,
  '--y-split-pane-size': `${transitionSize.value}px`,
  '--y-split-pane-negative-size': `-${transitionSize.value}px`,
  '--y-split-pane-offset': `${transitionSize.value + props.gutterSize}px`,
  '--y-split-pane-negative-offset': `-${transitionSize.value + props.gutterSize}px`,
}));

/** deferred 拖拽代理线样式，仅更新 transform，不改变真实 flex 布局。 */
const dragPreviewStyle = computed(() => {
  const position = previewSize.value + props.gutterSize / 2;
  if (isVertical.value) {
    return { transform: `translate3d(0, ${position}px, 0)` };
  }
  return { transform: `translate3d(${position}px, 0, 0)` };
});

/** deferred 拖拽时让分割线按钮跟随代理线移动。 */
const dragDividerStyle = computed(() => {
  if (!previewVisible.value) return undefined;
  const controlledSize = isVertical.value ? props.topHeight : props.leftWidth;
  const currentSize = isControlled.value ? (controlledSize ?? paneSize.value) : paneSize.value;
  const offset = previewSize.value - currentSize;
  if (isVertical.value) {
    return { transform: `translate3d(0, ${offset}px, 0)` };
  }
  return { transform: `translate3d(${offset}px, 0, 0)` };
});

/** 计算样式：左侧容器宽度 */
const leftStyle = computed(() => {
  const controlledSize = isVertical.value ? props.topHeight : props.leftWidth;
  const shouldUseTransitionSize = effectiveAnimation.value === 'transform' && isTransitioning.value;
  const expandedSize = shouldUseTransitionSize
    ? transitionSize.value
    : isControlled.value
      ? (controlledSize ?? paneSize.value)
      : paneSize.value;
  const rawSize = layoutCollapsed.value ? 0 : expandedSize;
  const width = rawSize <= 0 ? 0 : clampPaneSize(rawSize);
  if (isVertical.value) {
    return { height: `${width}px` };
  }
  return { width: `${width}px` };
});

/** 计算样式：面板内容固定尺寸，避免折叠过程中被挤压 */
const leftInnerStyle = computed(() => {
  const controlledSize = isVertical.value ? props.topHeight : props.leftWidth;
  const rawSize = isCollapsed.value
    ? lastWidth.value
    : isControlled.value
      ? (controlledSize ?? paneSize.value)
      : paneSize.value;
  const size = clampPaneSize(rawSize > 0 ? rawSize : lastWidth.value);
  if (isVertical.value) {
    return { height: `${size}px` };
  }
  return { width: `${size}px` };
});

/** 计算 aria-valuenow，折叠状态按 0 暴露 */
const paneAriaValueNow = computed(() => {
  if (isCollapsed.value) return 0;
  if (previewVisible.value) return previewSize.value;
  return isControlled.value ? (isVertical.value ? props.topHeight : props.leftWidth) : paneSize.value;
});

/** 过渡期间拦截重复折叠操作。 */
const handleToggleCollapse = (): void => {
  if (isTransitioning.value) return;
  toggleCollapse();
};

/**
 * 处理折叠按钮键盘事件。
 * @param event - 键盘事件
 */
const handleToggleKeydown = (event: KeyboardEvent): void => {
  if (isTransitioning.value) {
    event.preventDefault();
    return;
  }
  handleKeydown(event);
};

/**
 * 处理分割线拖拽开始。
 * @param event - 鼠标事件
 */
const handleStartDrag = (event: MouseEvent): void => {
  if (isTransitioning.value) return;
  startDrag(event);
};

/**
 * 面板尺寸动画结束后隐藏或卸载内容
 * @param event - CSS 过渡结束事件
 */
const handlePaneTransitionEnd = (event: TransitionEvent): void => {
  if (effectiveAnimation.value !== 'size') return;
  if (event.target !== paneRef.value) return;
  const sizeProperty = isVertical.value ? 'height' : 'width';
  if (event.propertyName !== sizeProperty) return;
  completeTransition();
};

/**
 * transform 动画结束后提交最终 flex 布局。
 * @param event - CSS 过渡结束事件
 */
const handleTransformTransitionEnd = (event: TransitionEvent): void => {
  if (effectiveAnimation.value !== 'transform') return;
  if (event.target !== rightRef.value || event.propertyName !== 'transform') return;
  completeTransition();
};
</script>

<template>
  <div
    ref="rootRef"
    class="y-split-pane"
    :style="gutterStyle"
    :class="[
      {
        'is-dragging': dragging,
        'is-collapsed': layoutCollapsed,
        'is-near': near,
        'is-vertical': isVertical,
        'is-transitioning': isTransitioning,
        'is-transition-active': transitionActive,
      },
      `is-collapse-${effectiveAnimation}`,
      `is-resize-${props.resizeMode}`,
      transitionPhase !== 'idle' ? `is-${transitionPhase}` : '',
    ]"
    @mousemove="throttledMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <div v-if="previewVisible" class="y-split-pane__drag-preview" :style="dragPreviewStyle" aria-hidden="true" />
    <div ref="paneRef" class="y-split-pane__left" :style="leftStyle" @transitionend="handlePaneTransitionEnd">
      <div
        v-if="paneContentRendered"
        v-show="paneContentVisible"
        class="y-split-pane__left-inner"
        :style="leftInnerStyle"
      >
        <slot v-if="isVertical" name="top" />
        <slot v-else name="left" />
      </div>
    </div>
    <div
      class="y-split-pane__divider"
      :class="{ 'is-disabled': !props.draggable }"
      :style="dragDividerStyle"
      role="separator"
      :aria-orientation="props.direction"
      :aria-valuenow="paneAriaValueNow"
      @mousedown="handleStartDrag"
      @dblclick="handleToggleCollapse"
    >
      <button
        v-if="props.collapsible && !showVerticalQuickActions"
        class="y-split-pane__toggle"
        :class="{ 'y-split-pane__toggle-vertical': isVertical }"
        type="button"
        :disabled="isTransitioning"
        :aria-expanded="!isCollapsed"
        :aria-disabled="isTransitioning"
        :aria-label="
          isCollapsed
            ? isVertical
              ? t('expandTop')
              : t('expandLeft')
            : isVertical
              ? t('collapseTop')
              : t('collapseLeft')
        "
        @click.stop="handleToggleCollapse"
        @mousedown.stop
        @touchstart.stop
        @keydown="handleToggleKeydown"
      >
        <template v-if="isVertical">
          <DoubleLeftOutlined v-if="!isCollapsed" class="y-split-pane__toggle-icon" />
          <DoubleRightOutlined v-else class="y-split-pane__toggle-icon" />
        </template>
        <template v-else>
          <DoubleLeftOutlined v-if="!isCollapsed" />
          <DoubleRightOutlined v-else />
        </template>
      </button>
      <VerticalQuickActions
        :collapsible="props.collapsible"
        :show-vertical-quick-actions="showVerticalQuickActions"
        :show-hide-top-button="showHideTopButton"
        :show-reset-button="showResetButton"
        :show-hide-bottom-button="showHideBottomButton"
        :top-offset="quickActionsTopOffset"
        @hide-top="hideTopPane"
        @reset="resetVerticalPane"
        @hide-bottom="hideBottomPane"
      />
    </div>
    <div ref="rightRef" class="y-split-pane__right" @transitionend="handleTransformTransitionEnd">
      <slot v-if="isVertical" name="bottom" />
      <slot v-else name="right" />
    </div>
  </div>
</template>
