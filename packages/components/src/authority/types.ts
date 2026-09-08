/** AuthorityDropdown 下拉操作项。 */
export interface AuthorityDropdownItem {
  [key: string]: any;
  permissionCode?: string;
}

/** AuthorityDropdown 组件 Props。 */
export interface AuthorityDropdownProps {
  permissionCode?: string;
  dropdownItems?: AuthorityDropdownItem[];
  options?: { label?: string; value?: string };
  buttonProps?: Record<string, any>;
  /** 无权限时的处理：隐藏（默认）或禁用。 */
  fallback?: 'hide' | 'disable';
}
