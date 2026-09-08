import { nextTick, onMounted, onUpdated, shallowReactive, type Ref, type ComponentPublicInstance } from 'vue';

/**
 * 管理每个节点的文本溢出状态，用于显示 tooltip
 * 维护一个 nodeKey -> isOverflow 的映射
 * @param enabled - 是否启用溢出 tooltip 功能
 * @returns 绑定 refs 和查询溢出状态的辅助函数
 */
export const useEllipsisTooltip = (enabled: Ref<boolean>) => {
  const elementByKey = new Map<string, HTMLElement>();
  const overflowByKey = shallowReactive<Record<string, boolean>>({});

  const setTextRef = (key: string) => (el: Element | ComponentPublicInstance | null) => {
    const rawEl =
      (el && (el as ComponentPublicInstance).$el
        ? ((el as ComponentPublicInstance).$el as Element)
        : (el as Element | null)) || null;
    const htmlEl = rawEl as unknown as HTMLElement | null;
    if (htmlEl) {
      elementByKey.set(key, htmlEl);
    } else {
      elementByKey.delete(key);
      delete overflowByKey[key];
    }
    // Measure this single node ASAP after DOM update
    void nextTick().then(() => measureOne(key));
  };

  const measureOne = (key: string) => {
    const el = elementByKey.get(key);
    overflowByKey[key] = !!(enabled.value && el && el.scrollWidth > el.clientWidth);
  };

  const measureAll = () => {
    elementByKey.forEach((_el, k) => measureOne(k));
  };

  onMounted(() => {
    void nextTick().then(measureAll);
  });
  onUpdated(() => {
    void nextTick().then(measureAll);
  });

  const isOverflow = (key: string) => !!overflowByKey[key];

  return {
    setTextRef,
    isOverflow,
    measureAll,
  };
};
