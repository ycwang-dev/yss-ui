import 'vxe-pc-ui';
import { getCurrentInstance } from 'vue';

/**
 * 触达 vxe-pc-ui 依赖，确保表格相关 PC UI 组件在模块加载阶段可用。
 *
 * 注意：当前组件库入口会统一处理 VxeUI 全局安装；此 Hook 不主动执行 app.use，
 * 仅保留为表格组件的依赖检查入口和旧内部调用兼容。
 */
export function useVxeInstall(): void {
  const instance = getCurrentInstance();
  if (!instance) return;
}
