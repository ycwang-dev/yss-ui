import type { FormProps as AntFormProps, Rule } from 'ant-design-vue/es/form';

export interface FormField {
  /**
   * @description 字段名称
   */
  name: string;
  /**
   * @description 字段标签
   */
  label: string;
  /**
   * @description 字段类型
   */
  type: 'input' | 'password' | 'select' | 'date' | 'textarea';
  /**
   * @description 字段属性
   */
  props?: Record<string, any>;
  /**
   * @description 占位符
   */
  placeholder?: string;
  /**
   * @description 默认值
   */
  defaultValue?: any;
  /**
   * @description 是否必填
   */
  required?: boolean;
  /**
   * @description 验证规则
   */
  rules?: Rule[];
}

export interface FormProps extends Partial<AntFormProps> {
  /**
   * @description 表单字段配置
   */
  formFields?: FormField[];
  /**
   * @description 是否显示提交重置按钮
   * @default true
   */
  showButtons?: boolean;
  /**
   * @description 提交按钮文本
   * @default '提交'
   */
  submitText?: string;
  /**
   * @description 重置按钮文本
   * @default '重置'
   */
  resetText?: string;
  /**
   * @description 提交按钮加载状态
   * @default false
   */
  loading?: boolean;
}
