import { Ref } from 'vue';

/**
 * useLoading Hook 返回值类型
 */
export interface UseLoadingReturn {
  /** 加载状态 */
  loading: Ref<boolean>;
  /** 设置加载状态 */
  setLoading: (value: boolean) => void;
  /** 切换加载状态 */
  toggleLoading: () => void;
  /** 包装异步函数，自动控制加载状态。默认情况下会捕获错误，防止白屏 */
  withLoading: <T>(fn: () => Promise<T>, options?: WithLoadingOptions<T>) => Promise<T | undefined>;
}

/**
 * withLoading 方法配置选项
 */
export interface WithLoadingOptions<T = any> {
  /** 成功回调（异步函数执行成功后触发） */
  onSuccess?: (result: T) => void;
  /** 错误回调（异步函数抛出错误时触发） */
  onError?: (error: Error) => void;
  /** 完成回调（无论成功或失败都会触发，类似 try-catch-finally 的 finally） */
  onFinally?: () => void;
  /** 发生错误时是否保持 loading 状态，默认 false */
  keepLoadingOnError?: boolean;
  /** 是否重新抛出错误，默认 false（防止未捕获的 Promise rejection） */
  rethrowError?: boolean;
}
