/**
 * 存储相关工具函数
 */

/**
 * @description localStorage 操作
 */
export const localStorage = {
  /**
   * 设置值
   */
  set(key: string, value: any): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('localStorage.set failed:', error);
    }
  },

  /**
   * 获取值
   */
  get<T = any>(key: string, defaultValue?: T): T | null {
    try {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue || null;
    } catch (error) {
      console.warn('localStorage.get failed:', error);
      return defaultValue || null;
    }
  },

  /**
   * 删除值
   */
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage.remove failed:', error);
    }
  },

  /**
   * 清空
   */
  clear(): void {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.warn('localStorage.clear failed:', error);
    }
  },
};

/**
 * @description sessionStorage 操作
 */
export const sessionStorage = {
  /**
   * 设置值
   */
  set(key: string, value: any): void {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('sessionStorage.set failed:', error);
    }
  },

  /**
   * 获取值
   */
  get<T = any>(key: string, defaultValue?: T): T | null {
    try {
      const value = window.sessionStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue || null;
    } catch (error) {
      console.warn('sessionStorage.get failed:', error);
      return defaultValue || null;
    }
  },

  /**
   * 删除值
   */
  remove(key: string): void {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.warn('sessionStorage.remove failed:', error);
    }
  },

  /**
   * 清空
   */
  clear(): void {
    try {
      window.sessionStorage.clear();
    } catch (error) {
      console.warn('sessionStorage.clear failed:', error);
    }
  },
};
