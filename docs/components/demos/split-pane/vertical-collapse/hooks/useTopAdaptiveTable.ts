import { ref } from 'vue';
import { useTableHeight } from '@yss-ui/hooks';
import type { YTableColumn } from '@yss-ui/components';

interface TopPanelRow {
  id: number;
  metric: string;
  value: string;
  updateTime: string;
}

interface SplitPaneResizePayload {
  size: number;
  width?: number;
  height?: number;
}

export const useTopAdaptiveTable = () => {
  // SplitPane 状态统一放在 hook，便于页面保持纯展示
  const topSize = ref<number>(300);
  const collapsed = ref<boolean>(false);

  // 绑定表格容器，用于自动计算可用高度
  const topTableAreaRef = ref<HTMLDivElement>();

  // 顶部区域存在标题和说明文本，预留最小高度，避免表格被压扁
  const { tableHeight: topTableHeight } = useTableHeight(topTableAreaRef, {
    minHeight: 120,
    defaultHeight: 220,
  });

  const topColumns = ref<YTableColumn[]>([
    { field: 'metric', title: '指标', minWidth: 140 },
    { field: 'value', title: '当前值', width: 120 },
    { field: 'updateTime', title: '更新时间', minWidth: 160 },
  ]);

  const topData = ref<TopPanelRow[]>([
    { id: 1, metric: '任务成功率', value: '99.2%', updateTime: '2026-04-17 10:01:12' },
    { id: 2, metric: '平均耗时', value: '312ms', updateTime: '2026-04-17 10:01:12' },
    { id: 3, metric: '活跃任务数', value: '28', updateTime: '2026-04-17 10:01:12' },
    { id: 4, metric: '失败重试数', value: '3', updateTime: '2026-04-17 10:01:12' },
    { id: 5, metric: '队列积压', value: '12', updateTime: '2026-04-17 10:01:12' },
  ]);

  const onResize = (payload: SplitPaneResizePayload): void => {
    topSize.value = payload.size;
  };

  return {
    topSize,
    collapsed,
    onResize,
    topTableAreaRef,
    topTableHeight,
    topColumns,
    topData,
  };
};
