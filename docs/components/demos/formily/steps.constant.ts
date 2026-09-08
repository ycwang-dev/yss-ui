import type { ISchema } from '@yss-ui/components';

/** 单步表单数据。 */
export type StepValues = Record<string, unknown>;

/** 分步表单聚合数据。 */
export interface StepFormValues {
  basic: StepValues;
  contact: StepValues;
}

/** Steps 展示项。 */
export const STEP_ITEMS = [{ title: '基础信息' }, { title: '联系信息' }, { title: '确认提交' }];

/** 基础信息步骤 Schema。 */
export const BASIC_SCHEMA: ISchema = {
  type: 'object',
  properties: {
    layout: {
      type: 'void',
      'x-component': 'FormLayout',
      'x-component-props': { layout: 'horizontal', labelWidth: 90, labelAlign: 'right' },
      properties: {
        grid: {
          type: 'void',
          'x-component': 'FormGrid',
          'x-component-props': { maxColumns: 2, minColumns: 1, minWidth: 260 },
          properties: {
            name: {
              type: 'string',
              title: '姓名',
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-validator': [{ required: true, message: '请输入姓名' }],
            },
            gender: {
              type: 'string',
              title: '性别',
              'x-decorator': 'FormItem',
              'x-component': 'Radio.Group',
              enum: [
                { label: '男', value: 'male' },
                { label: '女', value: 'female' },
              ],
              'x-validator': [{ required: true, message: '请选择性别' }],
            },
          },
        },
      },
    },
  },
};

/** 联系信息步骤 Schema。 */
export const CONTACT_SCHEMA: ISchema = {
  type: 'object',
  properties: {
    layout: {
      type: 'void',
      'x-component': 'FormLayout',
      'x-component-props': { layout: 'horizontal', labelWidth: 90, labelAlign: 'right' },
      properties: {
        grid: {
          type: 'void',
          'x-component': 'FormGrid',
          'x-component-props': { maxColumns: 2, minColumns: 1, minWidth: 260 },
          properties: {
            phone: {
              type: 'string',
              title: '电话',
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-validator': [{ required: true, message: '请输入电话' }],
            },
            email: {
              type: 'string',
              title: '邮箱',
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-validator': [{ format: 'email', message: '请输入正确的邮箱' }],
            },
          },
        },
      },
    },
  },
};

/** 确认步骤详情 Schema。 */
export const CONFIRM_SCHEMA: ISchema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: '姓名', 'x-decorator': 'FormItem', 'x-component': 'Input' },
    gender: { type: 'string', title: '性别', 'x-decorator': 'FormItem', 'x-component': 'Input' },
    phone: { type: 'string', title: '电话', 'x-decorator': 'FormItem', 'x-component': 'Input' },
    email: { type: 'string', title: '邮箱', 'x-decorator': 'FormItem', 'x-component': 'Input' },
  },
};
