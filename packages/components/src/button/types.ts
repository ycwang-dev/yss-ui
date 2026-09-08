import type { ButtonProps as AntButtonProps } from 'ant-design-vue';

// 注意：显式移除 onClick，避免在封装组件内被当作「属性」继续透传到 AButton，
// 从而与组件自身的 emit('click') 形成双触发。
export interface ButtonProps extends Omit<Partial<AntButtonProps>, 'onClick'> {
  /**
   * @description 按钮主题
   * @default 'primary'
   */
  theme?: 'primary' | 'success' | 'warning' | 'danger';
  /**
   * @description 权限码，传入则启用权限控制逻辑
   */
  permissionCode?: string;
  /**
   * @description 无权限时的处理：隐藏（hide，默认）或禁用（disable）
   * @default 'hide'
   */
  fallback?: 'hide' | 'disable';
  /**
   * @description 点击事件修饰：阻止冒泡、阻止默认
   */
  modifiers?: Array<'stop' | 'prevent'>;
}
