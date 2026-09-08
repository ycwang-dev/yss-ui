<script setup lang="ts">
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import { YButton, YFormily, type Form, type ISchema } from '@yss-ui/components';
import { message } from 'ant-design-vue';
import { ref } from 'vue';

/** 当前是否展开更多查询条件。 */
const expanded = ref(false);

/** 查询字段配置。 */
const searchFields = [
  ['keyword', '关键字', 'Input'],
  ['status', '状态', 'Select'],
  ['owner', '负责人', 'Input'],
  ['department', '所属部门', 'Input'],
  ['createdAt', '创建日期', 'DatePicker'],
  ['updatedAt', '更新日期', 'DatePicker'],
  ['remark', '备注', 'Input'],
] as const;

/** 响应式查询表单 Schema。 */
const schema: ISchema = {
  type: 'object',
  properties: {
    layout: {
      type: 'void',
      'x-component': 'FormLayout',
      'x-component-props': { layout: 'horizontal', labelWidth: 100, labelAlign: 'right' },
      properties: {
        grid: {
          type: 'void',
          'x-component': 'FormGrid',
          'x-component-props': { maxColumns: 3, minColumns: 1, minWidth: 260 },
          properties: Object.fromEntries(
            searchFields.map(([name, title, component]) => [
              name,
              {
                type: 'string',
                title,
                'x-decorator': 'FormItem',
                'x-component': component,
                'x-component-props': component === 'Select' ? { options: [{ label: '启用', value: 'enabled' }] } : {},
              },
            ])
          ),
        },
      },
    },
  },
};

/**
 * 执行查询。
 * @param form 当前 Formily Form 实例
 */
const handleQuery = (form: Form) => {
  message.success(`查询参数：${JSON.stringify(form.values)}`);
};

/**
 * 重置查询条件。
 * @param form 当前 Formily Form 实例
 */
const handleReset = async (form: Form) => {
  await form.reset('*', { forceClear: true });
};

/**
 * 接收组件展开/收起事件。
 * @param value 展开状态
 */
const handleToggle = (value: boolean) => {
  message.info(value ? '已展开筛选条件' : '已收起筛选条件');
};
</script>

<template>
  <YFormily v-model:expanded="expanded" :schema="schema" collapsible @toggle="handleToggle">
    <template #collapse-trigger="{ expanded: isExpanded, toggle }">
      <YButton type="link" @click="toggle">
        {{ isExpanded ? '收起筛选' : '更多筛选' }}
        <UpOutlined v-if="isExpanded" />
        <DownOutlined v-else />
      </YButton>
    </template>

    <template #actions="{ form }">
      <YButton type="primary" @click="handleQuery(form)">查询</YButton>
      <YButton @click="handleReset(form)">重置</YButton>
    </template>
  </YFormily>
</template>
