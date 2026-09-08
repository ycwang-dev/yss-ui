import { ref } from 'vue';
import { useTableHeight } from '@yss-ui/hooks';
import type { YTableColumn } from '@yss-ui/components';
import type { EChartsCoreOption } from 'echarts';

interface SplitPaneResizePayload {
  size: number;
  width?: number;
  height?: number;
}

interface MetricRow {
  id: number;
  metric: string;
  value: string;
  updateTime: string;
}

export const useVerticalQuickActionsDemo = () => {
  const topSize = ref<number>(320);
  const collapsed = ref<boolean>(false);

  // 上侧表格自适应
  const topTableAreaRef = ref<HTMLDivElement>();
  const { tableHeight: topTableHeight } = useTableHeight(topTableAreaRef, {
    minHeight: 120,
    defaultHeight: 220,
  });

  // 下侧图表自适应
  const bottomChartAreaRef = ref<HTMLDivElement>();
  const { tableHeight: bottomChartHeight } = useTableHeight(bottomChartAreaRef, {
    minHeight: 160,
    defaultHeight: 260,
  });

  const topColumns = ref<YTableColumn[]>([
    { field: 'metric', title: '指标', minWidth: 140 },
    { field: 'value', title: '当前值', width: 120 },
    { field: 'updateTime', title: '更新时间', minWidth: 170 },
  ]);

  const topData = ref<MetricRow[]>([
    { id: 1, metric: '任务成功率', value: '99.1%', updateTime: '2026-04-17 11:10:20' },
    { id: 2, metric: '平均处理时长', value: '298ms', updateTime: '2026-04-17 11:10:20' },
    { id: 3, metric: '活跃任务数', value: '31', updateTime: '2026-04-17 11:10:20' },
    { id: 4, metric: '失败重试数', value: '2', updateTime: '2026-04-17 11:10:20' },
    { id: 5, metric: '队列积压', value: '9', updateTime: '2026-04-17 11:10:20' },
  ]);

  const lineOption = ref<EChartsCoreOption>({
    title: { text: '任务吞吐趋势', left: 'center', textStyle: { fontSize: 13, color: 'inherit' } },
    tooltip: { trigger: 'axis' },
    grid: { top: 42, right: 18, bottom: 24, left: 40 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
      axisLabel: { color: 'inherit' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: 'inherit' },
      splitLine: { lineStyle: { type: 'dashed', opacity: 0.25 } },
    },
    series: [
      {
        type: 'line',
        name: '吞吐量',
        smooth: true,
        data: [120, 132, 121, 148, 139, 160, 172],
        areaStyle: { opacity: 0.12 },
      },
    ],
  });

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
    bottomChartAreaRef,
    bottomChartHeight,
    lineOption,
  };
};
