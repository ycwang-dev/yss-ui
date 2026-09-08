import { localStorage as storage } from './storage';

export interface AuthBtn {
  btnCode: string;
  btnName?: string;
  [k: string]: any;
}

const AUTH_KEY = 'auth_btns';

export const getAuthBtns = (): AuthBtn[] => {
  return (storage.get<AuthBtn[]>(AUTH_KEY, []) as AuthBtn[]) || [];
};

export const hasAuth = (code?: string): boolean => {
  if (!code) return true;
  const list = getAuthBtns();
  return list.some(item => item?.btnCode === code);
};

export const getBtnInfo = (code?: string): AuthBtn | null => {
  if (!code) return null;
  const list = getAuthBtns();
  return list.find(item => item?.btnCode === code) || null;
};

/**
 * @description 清除本地认证相关信息（localStorage）
 */
export const clearAuthInfo = (): void => {
  const keys: string[] = [
    'access_token',
    'token_expires',
    'user_info',
    'auth_routes',
    'is_reset',
    'header_spaces_routes',
    'active_space_code',
    'yss_tabs_v1',
    'auth_btns',
  ];
  keys.forEach(k => storage.remove(k));
};
