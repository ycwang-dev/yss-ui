/**
 * 废弃方法代理兼容处理函数
 * 用于拦截 vxe-table 原生实例的废弃方法，将其重定向到新方法以避免触发 vxe-table 内置警告。
 *
 * @param instance vxe-table 原生实例
 * @returns 经过 Proxy 包装后的实例，或原实例
 */
export function makeProxyTableInstance(instance: any): any {
  if (!instance) return instance;

  const methodMap: Record<string, string> = {
    setActiveCell: 'setEditCell',
    setActiveRow: 'setEditRow',
    getActiveRecord: 'getEditCell',
    getEditRecord: 'getEditCell',
    clearActived: 'clearEdit',
    isActiveByRow: 'isEditByRow',
    confirmFilter: 'saveFilterPanelByEvent',
    getParentRow: 'getTreeParentRow',
    resetColumn: 'resetCustom',
    reloadExpandContent: 'reloadRowExpand',
    isExpandByRow: 'isRowExpandByRow',
    isRowGroupRecord: 'isAggregateRecord',
    isRowGroupExpandByRow: 'isAggregateExpandByRow',
    reloadTreeChilds: 'reloadTreeExpand',
  };

  return new Proxy(instance, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && prop in methodMap) {
        const newMethod = methodMap[prop];
        if (typeof target[newMethod] === 'function') {
          return target[newMethod].bind(target);
        }
      }
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === 'function') {
        return value.bind(target);
      }
      return value;
    },
  });
}

export * from './utils/calcActionWidth';
