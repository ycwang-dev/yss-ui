<template>
  <div class="condition-builder">
    <div
      class="condition-group"
      :class="{
        'is-root': isRoot,
        'operator-and': rootRef.logicalOp === 'AND',
        'operator-or': rootRef.logicalOp === 'OR',
        'has-multiple-conditions': isRoot && rootRef.children.length > 1,
        'is-disabled': props.disabled,
      }"
    >
      <!-- 逻辑操作符（且/或） -->
      <div
        v-if="!isRoot || (isRoot && rootRef.children.length > 1)"
        :class="[
          'logic-operator',
          rootRef.logicalOp === 'AND' ? 'operator-and' : 'operator-or',
          { 'is-disabled': props.disabled },
        ]"
      >
        <div
          :class="['logic-btn', rootRef.logicalOp === 'AND' ? 'logic-and' : 'logic-or']"
          @click="!props.disabled && onToggleRoot()"
        >
          {{ rootRef.logicalOp === 'AND' ? resolvedAndText : resolvedOrText }}
        </div>
      </div>

      <!-- 条件内容区域 -->
      <div class="condition-content">
        <div class="condition-items">
          <!-- 单个条件项 -->
          <div
            v-for="(child, idx) in rootRef.children"
            :key="child.id"
            class="condition-item"
            :class="{ 'is-group': child.type === 'GROUP' }"
          >
            <!-- 简单条件 -->
            <div v-if="child.type === 'LEAF'" class="simple-condition">
              <!-- 字段选择 -->
              <AAutoComplete
                :value="getFieldLabel((child as any).field)"
                :options="fieldOptions"
                :placeholder="t('fieldPlaceholder')"
                size="small"
                class="field-select"
                :class="{ 'is-error': errors[idx]?.field }"
                :disabled="props.disabled"
                allow-clear
                @search="onSearchFields"
                @change="(val: any) => handleFieldChange(idx, val)"
                @blur="emitBlur"
              />

              <!-- 操作符选择 -->
              <ASelect
                v-model:value="(child as any).operator"
                :options="getOperatorOptionsSync(idx)"
                :placeholder="t('operatorPlaceholder')"
                size="small"
                class="operator-select"
                :class="{ 'is-error': errors[idx]?.operator }"
                :disabled="props.disabled"
                allow-clear
                @dropdown-visible-change="
                  (vis: boolean) => {
                    if (vis) refreshOperatorOptions(idx);
                  }
                "
                @change="() => handleOperatorChange(idx)"
                @blur="emitBlur"
              />

              <!-- 值输入 - BETWEEN操作符显示两个输入框 -->
              <div v-if="getOperatorKind(idx) === 'between'" class="between-inputs">
                <AAutoComplete
                  :value="getValueLabel(idx, betweenValues[idx] ? betweenValues[idx][0] : '')"
                  :options="valueOptionsMap[`${rootRef.children[idx]?.id}`] || []"
                  :placeholder="t('startPlaceholder')"
                  size="small"
                  class="value-input between-input"
                  :class="{ 'is-error': errors[idx]?.value }"
                  :disabled="props.disabled"
                  allow-clear
                  @search="q => onSearchValues(idx, q)"
                  @change="(val: any) => handleValueChange(idx, 0, val, 'between')"
                  @dropdown-visible-change="
                    (vis: boolean) => {
                      if (vis) onSearchValues(idx, '');
                    }
                  "
                  @blur="handleBetweenInput"
                />
                <span class="between-separator">{{ t('betweenSeparator') }}</span>
                <AAutoComplete
                  :value="getValueLabel(idx, betweenValues[idx] ? betweenValues[idx][1] : '')"
                  :options="valueOptionsMap[`${rootRef.children[idx]?.id}`] || []"
                  :placeholder="t('endPlaceholder')"
                  size="small"
                  class="value-input between-input"
                  :class="{ 'is-error': errors[idx]?.value }"
                  :disabled="props.disabled"
                  allow-clear
                  @search="q => onSearchValues(idx, q)"
                  @change="(val: any) => handleValueChange(idx, 1, val, 'between')"
                  @dropdown-visible-change="
                    (vis: boolean) => {
                      if (vis) onSearchValues(idx, '');
                    }
                  "
                  @blur="handleBetweenInput"
                />
              </div>

              <!-- 多选值输入 -->
              <ASelect
                v-else-if="getOperatorKind(idx) === 'multiple'"
                v-model:value="(child as any).value"
                :options="valueOptionsMap[`${rootRef.children[idx]?.id}`] || []"
                :placeholder="t('selectPlaceholder')"
                size="small"
                class="value-input"
                :class="{ 'is-error': errors[idx]?.value }"
                mode="tags"
                :disabled="props.disabled"
                allow-clear
                max-tag-count="responsive"
                @search="q => onSearchValues(idx, q)"
                @dropdown-visible-change="
                  (vis: boolean) => {
                    if (vis) onSearchValues(idx, '');
                  }
                "
                @blur="emitBlur"
              />

              <!-- 普通值输入 -->
              <AAutoComplete
                v-else-if="getOperatorKind(idx) !== 'none'"
                :value="getValueLabel(idx, (child as any).value)"
                :options="valueOptionsMap[`${rootRef.children[idx]?.id}`] || []"
                :placeholder="t('inputPlaceholder')"
                size="small"
                class="value-input"
                :class="{ 'is-error': errors[idx]?.value }"
                :disabled="props.disabled"
                allow-clear
                @search="q => onSearchValues(idx, q)"
                @change="(val: any) => handleValueChange(idx, -1, val, 'single')"
                @dropdown-visible-change="
                  (vis: boolean) => {
                    if (vis) onSearchValues(idx, '');
                  }
                "
                @blur="emitBlur"
              />

              <!-- 操作按钮 -->
              <div class="condition-actions">
                <AButton
                  type="text"
                  size="small"
                  class="action-btn add-btn"
                  :title="t('addSibling')"
                  :disabled="props.disabled"
                  @click="addLeafAfter(idx)"
                >
                  <template #icon>
                    <span>+</span>
                  </template>
                </AButton>
                <AButton
                  v-if="shouldShowRemoveButton(idx)"
                  type="text"
                  size="small"
                  class="action-btn remove-btn"
                  :title="t('remove')"
                  :disabled="props.disabled"
                  @click="onRemove([idx])"
                >
                  <template #icon>
                    <span>-</span>
                  </template>
                </AButton>
                <AButton
                  type="text"
                  size="small"
                  class="action-btn group-btn"
                  :disabled="props.disabled || getCurrentDepth() >= props.maxDepth + 2"
                  :title="t('addChild')"
                  @click="addChildGroup(idx)"
                >
                  {{ t('childGroup') }}
                </AButton>
              </div>
            </div>

            <!-- 嵌套条件组 -->
            <YConditionBuilder
              v-else-if="child.type === 'GROUP'"
              :ref="(el: any) => setNestedRef(el, idx)"
              :model-value="child as any"
              :operator-options="props.operatorOptions"
              :get-operators="props.getOperators"
              :load-fields="loadFieldsWrapper"
              :load-values="props.loadValues"
              :max-depth="props.maxDepth"
              :and-text="resolvedAndText"
              :or-text="resolvedOrText"
              :is-root="false"
              :disabled="props.disabled"
              :depth="props.depth + 1"
              @update:model-value="(val: any) => handleNestedChange(val, idx)"
              @blur="handleNestedBlur"
              @remove="onRemove([idx])"
            />
          </div>
        </div>

        <!-- 根级别添加按钮 -->
        <div v-if="isRoot && rootRef.children.length === 0" class="root-actions">
          <AButton type="primary" size="small" @click="addLeaf()">
            <template #icon>
              <span>+</span>
            </template>
            添加条件
          </AButton>
        </div>
      </div>

      <!-- 删除按钮（非根级别） -->
      <!-- <div v-if="!isRoot" class="group-actions">
        <button type="button" class="delete-group-btn" :title="t('removeGroup')" @click="$emit('remove')">
          <svg viewBox="0 0 1024 1024" width="12" height="12">
            <path
              d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 0 1 1.9-11.2c1.5-1.2 3.3-1.9 5.2-1.9l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130.1 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"
            />
          </svg>
        </button>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { AutoComplete as AAutoComplete, Select as ASelect, Button as AButton } from 'ant-design-vue';
import type { YConditionBuilderProps, YConditionExpose, OperatorInputKind } from './types';
import { DEFAULT_OPERATOR_OPTIONS, createEmptyGroup } from './types';
import type { ConditionGroup, OperatorOption, OptionItem } from '@yss-ui/components';
import { useLocale } from '../locale/useLocale';
import { useConditionTree } from './hooks/useConditionTree';
import { useLinkage } from './hooks/useLinkage';

defineOptions({
  name: 'YConditionBuilder',
});

const { t } = useLocale('conditionBuilder');

/**
 * 组件 Props
 */
const props = withDefaults(
  defineProps<YConditionBuilderProps & { andText?: string; orText?: string; isRoot?: boolean; depth?: number }>(),
  {
    maxDepth: 3,
    operatorOptions: undefined,
    andText: undefined,
    orText: undefined,
    isRoot: true,
    disabled: false,
    depth: 1,
    strictMode: true,
  }
);

/** 默认操作符随语言响应式更新，自定义业务标签由调用方负责。 */
const resolvedOperators = computed(
  () =>
    props.operatorOptions ??
    DEFAULT_OPERATOR_OPTIONS.map(option => ({
      ...option,
      label: t(`operators.${option.value}`),
    }))
);
const resolvedAndText = computed(() => props.andText ?? t('and'));
const resolvedOrText = computed(() => props.orText ?? t('or'));

const emit = defineEmits<{
  (e: 'update:modelValue', v: ConditionGroup): void;
  (e: 'change', v: ConditionGroup): void;
  (e: 'validate', valid: boolean): void;
  (e: 'blur', v: ConditionGroup): void;
  (e: 'remove'): void;
}>();

// 初始化数据
const initial = computed(() => props.modelValue || createEmptyGroup());
const rootRef = ref<ConditionGroup>(initial.value);

// 强制重渲染的键值，用于解决删除后的组件状态残留问题

// 树操作
const { root, addLeaf, addGroup, remove } = useConditionTree(initial.value, {
  maxDepth: props.maxDepth,
  operatorResolver: async field => {
    if (props.getOperators) {
      const val = await props.getOperators(field);
      return Array.isArray(val) ? val : [];
    }
    return resolvedOperators.value;
  },
  defaultOperator: resolvedOperators.value[0]?.value,
});

// 缓存字段选项，避免嵌套组件重复请求
const cachedFieldOptions = ref<OptionItem[]>([]);
const hasCached = ref(false);

// 错误状态
const errors = ref<Record<string, { field?: boolean; operator?: boolean; value?: boolean }>>({});
const nestedRefs = ref<any[]>([]);

const setNestedRef = (el: any, idx: number) => {
  if (el) nestedRefs.value[idx] = el;
};

const loadFieldsWrapper = async (q: string) => {
  // 如果是空查询且已有缓存，直接返回缓存
  if (!q && hasCached.value) {
    return cachedFieldOptions.value;
  }

  if (props.loadFields) {
    const res = await props.loadFields(q);
    // 如果是空查询（初始化或点击下拉），更新缓存
    if (!q) {
      cachedFieldOptions.value = res;
      hasCached.value = true;
    }
    return res;
  }
  return [];
};

// 联动与选项
const { fieldOptions, valueOptionsMap, fetchFields, fetchValues, getOperatorOptions, initializeFields } = useLinkage({
  getOperators: props.getOperators,
  get operatorOptions() {
    return resolvedOperators.value;
  },
  loadFields: loadFieldsWrapper,
  loadValues: props.loadValues,
});

// 操作符选项缓存
const operatorOptionsCache = ref<Record<string, OperatorOption[]>>({});

// operator kind/ options per line
const betweenValues = ref<Array<[string | undefined, string | undefined]>>([]);

const getOperatorKind = (idx: number): OperatorInputKind => {
  const child = rootRef.value.children[idx];
  if (child?.type !== 'LEAF') return 'single';
  const op = (child as any).operator;
  if (!op) return 'single';

  const id = (rootRef.value.children[idx] as any)?.id as string | undefined;
  const options = (props.getOperators && id && operatorOptionsCache.value[id]) || resolvedOperators.value;
  const found = options.find((o: any) => o.value === op);
  return found?.kind || 'single';
};

const getOperatorOptionsSync = (idx: number): OperatorOption[] => {
  const id = (rootRef.value.children[idx] as any)?.id as string | undefined;
  return (props.getOperators && id && operatorOptionsCache.value[id]) || resolvedOperators.value;
};

// 异步加载操作符选项
const refreshOperatorOptions = async (idx: number) => {
  const child = rootRef.value.children[idx];
  if (child?.type === 'LEAF') {
    const field = (child as any).field;
    const options = await getOperatorOptions(field);
    operatorOptionsCache.value[String((child as any).id)] = options;
  }
};

const ensureLineStates = () => {
  betweenValues.value = [];
  rootRef.value.children.forEach((child, idx) => {
    if (child.type === 'LEAF') {
      const kind = getOperatorKind(idx);
      if (kind === 'between') {
        const val = (child as any).value;
        const tuple: [string | undefined, string | undefined] = Array.isArray(val)
          ? [val[0], val[1]]
          : [undefined, undefined];
        betweenValues.value.push(tuple);
      } else {
        betweenValues.value.push([undefined, undefined]);
      }
    } else {
      betweenValues.value.push([undefined, undefined]);
    }
  });
};

// 清理缓存状态
const cleanupCacheStates = () => {
  // 清理操作符选项缓存
  operatorOptionsCache.value = {};
  // 重新初始化between值状态
  ensureLineStates();
};

/**
 * 校验单个节点
 * @param idx 节点索引
 */
const validateNode = (idx: number) => {
  // 如果非严格模式,不进行校验(允许为空)
  if (!props.strictMode) return;

  const child = rootRef.value.children[idx];
  if (!child || child.type !== 'LEAF') return;

  const leaf = child as any;
  const leafErrors: { field?: boolean; operator?: boolean; value?: boolean } = {};
  let hasError = false;

  if (!leaf.field) {
    leafErrors.field = true;
    hasError = true;
  }

  if (!leaf.operator) {
    leafErrors.operator = true;
    hasError = true;
  }

  const kind = getOperatorKind(idx);
  if (kind !== 'none') {
    if (kind === 'between') {
      if (!betweenValues.value[idx]?.[0] || !betweenValues.value[idx]?.[1]) {
        leafErrors.value = true;
        hasError = true;
      }
    } else if (kind === 'multiple') {
      if (!leaf.value || (Array.isArray(leaf.value) && leaf.value.length === 0)) {
        leafErrors.value = true;
        hasError = true;
      }
    } else {
      // 0 是有效值
      if (!leaf.value && leaf.value !== 0) {
        leafErrors.value = true;
        hasError = true;
      }
    }
  }

  if (hasError) {
    errors.value[idx] = leafErrors;
  } else {
    delete errors.value[idx];
  }
};

/**
 * 验证整个条件树
 * @returns 是否所有条件都有效
 */
const validate = (): boolean => {
  errors.value = {};
  let isValid = true;

  rootRef.value.children.forEach((child, idx) => {
    if (child.type === 'LEAF') {
      validateNode(idx);
      if (errors.value[idx]) {
        isValid = false;
      }
    } else if (child.type === 'GROUP') {
      // 递归验证嵌套组件
      const nestedComponent = nestedRefs.value[idx];
      if (nestedComponent && nestedComponent.validate) {
        const nestedValid = nestedComponent.validate();
        if (!nestedValid) {
          isValid = false;
        }
      }
    }
  });

  return isValid;
};

// 同步 root 到 rootRef
watch(
  () => root.value,
  newVal => {
    rootRef.value = newVal;
    ensureLineStates();
  },
  { immediate: true, deep: true }
);

// 监听外部 modelValue 变化
watch(
  () => props.modelValue,
  v => {
    if (!v) return;
    // 避免重复赋值与不必要的重渲染
    if (root.value !== v) {
      root.value = v as ConditionGroup;
    }
    emit('change', root.value);
  },
  { immediate: true, deep: true }
);

// 监听内部变化，向外发送
watch(
  () => root.value,
  v => {
    emit('update:modelValue', v);
    emit('change', v);
    // 在 change 时同步触发 validate,返回验证结果
    const isValid = validate();
    emit('validate', isValid);
    ensureLineStates();
  },
  { immediate: true, deep: true }
);

// 组件挂载时初始化字段选项
onMounted(() => {
  initializeFields();
  // 初始化已有数据的选项
  if (props.loadValues) {
    rootRef.value.children.forEach(child => {
      if (child.type === 'LEAF') {
        fetchValues(child as any, '');
      }
    });
  }
});

// 事件处理
const onToggleRoot = () => {
  // 直接修改 rootRef 以确保响应式更新
  rootRef.value.logicalOp = rootRef.value.logicalOp === 'AND' ? 'OR' : 'AND';
  // 同步到 root
  root.value = { ...rootRef.value };
  emitBlur();
};

const onRemove = (path: number[]) => {
  // 对于当前层级的删除，直接使用索引操作
  if (path.length === 1) {
    const index = path[0];
    if (index >= 0 && index < rootRef.value.children.length) {
      // 创建新的children数组，避免直接修改
      const newChildren = [...rootRef.value.children];

      // 仅当删除的是 LEAF 且其后紧跟一个 GROUP（通过“子级条件”添加的子级）时，联动删除
      const currentIsLeaf = newChildren[index] && newChildren[index].type === 'LEAF';
      const nextIsGroup = newChildren[index + 1] && newChildren[index + 1].type === 'GROUP';
      const currentLeafId = currentIsLeaf ? (newChildren[index] as any).id : undefined;
      const nextGroupLinkedFrom = nextIsGroup ? (newChildren[index + 1] as any).linkedFromLeafId : undefined;
      if (currentIsLeaf && nextIsGroup && nextGroupLinkedFrom && nextGroupLinkedFrom === currentLeafId) {
        newChildren.splice(index, 2);
      } else {
        newChildren.splice(index, 1);
      }

      // 更新rootRef
      rootRef.value = {
        ...rootRef.value,
        children: newChildren,
      };

      // 清理相关缓存状态
      cleanupCacheStates();

      // 智能清理：如果删除后条件组变为空，且不是根级，则删除整个条件组
      if (!props.isRoot && newChildren.length === 0) {
        emit('remove');
        return;
      }

      // 保持嵌套结构不变：删除后即便只剩一个嵌套组，也不进行提升，避免导致子级数据被清空

      // 同步到 root 并强制重渲染
      root.value = { ...rootRef.value };
    }
  } else {
    // 对于深层嵌套的删除，使用 useConditionTree 的 remove 方法
    remove(path);
    // no forced remounts
  }
  emitBlur();
  // 删除时清空所有错误状态，防止索引错位导致的“幽灵错误”
  errors.value = {};
};

const onSearchFields = (q: string) => {
  if (props.loadFields) {
    fetchFields(q);
  }
};

const onSearchValues = (idx: number, q: string) => {
  const child = rootRef.value.children[idx];
  if (child?.type === 'LEAF' && props.loadValues) {
    fetchValues(child as any, q);
  }
};

const addLeafAfter = (idx: number) => {
  const next = rootRef.value.children[idx + 1];
  const at = next && next.type === 'GROUP' ? idx + 2 : idx + 1;
  addLeaf(undefined, at);
};

// 添加与当前 LEAF 绑定的子级组，记录来源以便删除时精准联动
const addChildGroup = (idx: number) => {
  const beforeLeaf = rootRef.value.children[idx] as any;
  addGroup(undefined, idx + 1);
  const inserted = rootRef.value.children[idx + 1] as any;
  if (inserted && inserted.type === 'GROUP' && beforeLeaf && beforeLeaf.type === 'LEAF') {
    inserted.linkedFromLeafId = beforeLeaf.id;
  }
  // 同步 root
  root.value = { ...rootRef.value };
};

const clearValueOptions = (idx: number) => {
  const child = rootRef.value.children[idx] as any;
  if (!child || child.type !== 'LEAF') return;
  const key = String(child.id);
  valueOptionsMap.value[key] = [];
};

/**
 * 处理字段变化（显示 label，存储 value）
 * @param idx - 条件索引
 * @param val - 选择的值（可能是 label 或 value）
 */
const handleFieldChange = (idx: number, val: any) => {
  const child = rootRef.value.children[idx] as any;
  if (!child || child.type !== 'LEAF') return;

  // 如果 val 是空字符串，直接清空
  if (!val || val === '') {
    child.field = '';
    child.value = '';
    betweenValues.value[idx] = [undefined, undefined];
    clearValueOptions(idx);
  } else {
    // 尝试从 fieldOptions 中找到匹配的项
    // 先尝试按 value 匹配
    let matchedOption = fieldOptions.value.find((o: any) => o.value === val);
    // 如果没找到，尝试按 label 匹配
    if (!matchedOption) {
      matchedOption = fieldOptions.value.find((o: any) => o.label === val);
    }

    // 如果找到了匹配的选项，使用其 value；否则使用原始值
    const actualValue = matchedOption ? matchedOption.value : val;
    child.field = actualValue;

    // 清空当前值并刷新候选
    child.value = '';
    betweenValues.value[idx] = [undefined, undefined];
    clearValueOptions(idx);
    clearValueOptions(idx);
    if (props.loadValues) fetchValues(child, '');
  }

  // 触发更新
  root.value = { ...rootRef.value };

  // 触发校验
  validateNode(idx);
};

const handleOperatorChange = (idx: number) => {
  const child = rootRef.value.children[idx] as any;
  if (!child || child.type !== 'LEAF') return;
  // 操作符变化时同步清理候选与值
  const kind = getOperatorKind(idx);
  if (kind === 'between') {
    child.value = ['', ''];
    betweenValues.value[idx] = [undefined, undefined];
  } else if (kind === 'multiple') {
    child.value = [];
  } else if (kind === 'none') {
    child.value = '';
  } else {
    child.value = '';
  }
  clearValueOptions(idx);
  clearValueOptions(idx);
  if (props.loadValues) fetchValues(child, '');

  // 触发更新
  root.value = { ...rootRef.value };

  // 触发校验
  validateNode(idx);
};

// 嵌套条件变化处理
const handleNestedChange = (nestedCondition: any, index: number) => {
  // 创建新的children数组，确保响应式更新
  const newChildren = [...rootRef.value.children];
  newChildren[index] = nestedCondition;

  // 更新rootRef
  rootRef.value = {
    ...rootRef.value,
    children: newChildren,
  };

  // 同步到 root 并触发重渲染
  root.value = { ...rootRef.value };
  emitBlur();
};

// 嵌套组件失去焦点处理
const handleNestedBlur = () => {
  emitBlur();
};

/**
 * 根据字段 value 获取对应的 label
 * @param value - 字段值
 * @returns label 或 value（如果找不到对应的 label）
 */
const getFieldLabel = (value: string | undefined): string => {
  if (!value) return '';
  const option = fieldOptions.value.find((o: any) => o.value === value);
  return option?.label || value;
};

/**
 * 根据 value 获取对应的 label
 * @param idx - 条件索引
 * @param value - 值
 * @returns label 或 value（如果找不到对应的 label）
 */
const getValueLabel = (idx: number, value: string | undefined): string => {
  if (!value) return '';
  const child = rootRef.value.children[idx];
  if (!child || child.type !== 'LEAF') return value || '';
  const key = String(child.id);
  const options = valueOptionsMap.value[key] || [];
  const option = options.find((o: any) => o.value === value);
  return option?.label || value;
};

/**
 * 处理值变化（显示 label，存储 value）
 * @param idx - 条件索引
 * @param position - BETWEEN 操作符的位置（0 或 1），-1 表示普通值输入
 * @param val - 选择的值（可能是 label 或 value）
 * @param type - 类型：'between' 或 'single'
 */
const handleValueChange = (idx: number, position: number, val: any, type: 'between' | 'single') => {
  const child = rootRef.value.children[idx];
  if (!child || child.type !== 'LEAF') return;

  const key = String(child.id);
  const options = valueOptionsMap.value[key] || [];

  // 如果 val 是空字符串，直接清空
  if (!val || val === '') {
    if (type === 'between') {
      if (!betweenValues.value[idx]) {
        betweenValues.value[idx] = [undefined, undefined];
      }
      betweenValues.value[idx][position] = undefined;
      const tuple = betweenValues.value[idx];
      (child as any).value = [tuple[0] || '', tuple[1] || ''];
    } else {
      (child as any).value = '';
    }
  } else {
    // 尝试从 options 中找到匹配的项
    // 先尝试按 value 匹配
    let matchedOption = options.find((o: any) => o.value === val);
    // 如果没找到，尝试按 label 匹配
    if (!matchedOption) {
      matchedOption = options.find((o: any) => o.label === val);
    }

    // 如果找到了匹配的选项，使用其 value；否则使用原始值
    const actualValue = matchedOption ? matchedOption.value : val;

    if (type === 'between') {
      if (!betweenValues.value[idx]) {
        betweenValues.value[idx] = [undefined, undefined];
      }
      betweenValues.value[idx][position] = actualValue;
      const tuple = betweenValues.value[idx];
      (child as any).value = [tuple[0] || '', tuple[1] || ''];
    } else {
      (child as any).value = actualValue;
    }
  }

  // 触发更新
  root.value = { ...rootRef.value };

  // 触发校验
  validateNode(idx);
};

const handleBetweenInput = () => {
  emitBlur();
};

// const replaceChild = (idx: number, newChild: any) => {
//   rootRef.value.children[idx] = newChild;
//   emitBlur();
// };

const shouldShowRemoveButton = (_idx: number): boolean => {
  const count = rootRef.value.children.length;
  if (props.isRoot && count >= 1) return true;
  if (!props.isRoot && count === 1) return true;
  return count > 1;
};

const getCurrentDepth = (): number => {
  return props.depth;
};

// const emitChange = () => {
//   emit('change', rootRef.value);
//   // TODO: 实现验证逻辑
//   emit('validate', true);
// };

const emitBlur = () => {
  emit('blur', rootRef.value);
};

/**
 * 读取当前标准条件树。
 *
 * `legacy` 是历史兼容参数；仓库从未定义另一套旧结构，因此不得在没有契约的情况下猜测转换格式。
 */
const getValue = (_format: 'normalized' | 'legacy' = 'normalized'): ConditionGroup => rootRef.value;

const setValue = (v: ConditionGroup) => {
  root.value = v;
};

defineExpose<YConditionExpose>({
  validate,
  getValue,
  setValue,
  addLeaf: (path?: number[], index?: number) => addLeaf(path || [index || 0]),
  addGroup: (path?: number[], index?: number) => addGroup(path || [index || 0]),
  remove: (path: number[]) => remove(path),
});
</script>

<style scoped lang="less">
@import url('./style.less');
</style>
