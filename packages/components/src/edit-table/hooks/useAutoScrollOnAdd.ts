import { Ref } from 'vue';

/**
 * 添加行后自动滚动到新行的 Hook
 *
 * 提供 scrollToNewRow 方法，在添加按钮点击后调用。
 * 使用 setTimeout 确保 vxe-table 完成内部数据处理和渲染后，
 * 调用 vxe-table 原生的 scrollToEndRow / scrollToStartRow 进行滚动。
 *
 * @param tableRef - vxe-table 组件实例 ref
 * @param options - 配置项
 */
export function useAutoScrollOnAdd(
  tableRef: Ref<any>,
  options: {
    /** 新行添加位置：'top' 顶部 / 'bottom' 底部，默认 'bottom' */
    addPosition?: 'top' | 'bottom';
  } = {}
) {
  /**
   * 在添加行后调用此方法，滚动到新行位置
   *
   * 使用 setTimeout(50ms) 确保：
   * 1. Vue 响应式更新完成（nextTick）
   * 2. vxe-table 内部数据处理完成（可能包含自身的 nextTick 链）
   * 3. DOM 渲染完毕
   */
  const scrollToNewRow = () => {
    const position = options.addPosition ?? 'bottom';

    setTimeout(() => {
      const table = tableRef.value;
      if (!table) return;

      if (position === 'top') {
        // vxe-table 内置方法：滚动到第一行
        table.scrollToStartRow?.();
      } else {
        // vxe-table 内置方法：滚动到最后一行
        table.scrollToEndRow?.();
      }
    }, 50);
  };

  return { scrollToNewRow };
}
