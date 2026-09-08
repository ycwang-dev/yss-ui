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

export const useNestedVerticalQuickActions = () => {
  // 外层左右分割
  const outerLeftWidth = ref<number>(260);
  const outerCollapsed = ref<boolean>(false);

  // 内层上下分割
  const innerTopSize = ref<number>(300);
  const innerCollapsed = ref<boolean>(false);

  // 左侧树
  const selectedKeys = ref<string[]>(['root-1']);
  const treeData = ref([
    {
      key: 'root-1',
      title: '监控目录',
      children: [
        { key: 'node-1', title: '任务监控' },
        { key: 'node-2', title: '资源监控' },
        { key: 'node-3', title: '质量监控' },
      ],
    },
  ]);

  // 上侧表格自适应
  const topTableAreaRef = ref<HTMLDivElement>();
  const { tableHeight: topTableHeight } = useTableHeight(topTableAreaRef, {
    minHeight: 120,
    defaultHeight: 220,
  });

  const topColumns = ref<YTableColumn[]>([
    { field: 'metric', title: '指标', minWidth: 150 },
    { field: 'value', title: '当前值', width: 120 },
    { field: 'updateTime', title: '更新时间', minWidth: 170 },
  ]);

  const topData = ref<MetricRow[]>([
    { id: 1, metric: '任务成功率', value: '99.4%', updateTime: '2026-04-17 16:10:20' },
    { id: 2, metric: '平均处理耗时', value: '276ms', updateTime: '2026-04-17 16:10:20' },
    { id: 3, metric: '活跃任务数', value: '29', updateTime: '2026-04-17 16:10:20' },
    { id: 4, metric: '失败重试数', value: '1', updateTime: '2026-04-17 16:10:20' },
    { id: 5, metric: '队列积压', value: '7', updateTime: '2026-04-17 16:10:20' },
    { id: 6, metric: '任务成功率', value: '99.4%', updateTime: '2026-04-17 16:10:20' },
    { id: 7, metric: '平均处理耗时', value: '276ms', updateTime: '2026-04-17 16:10:20' },
    { id: 8, metric: '活跃任务数', value: '29', updateTime: '2026-04-17 16:10:20' },
    { id: 9, metric: '失败重试数', value: '1', updateTime: '2026-04-17 16:10:20' },
    { id: 10, metric: '队列积压', value: '7', updateTime: '2026-04-17 16:10:20' },
    { id: 11, metric: '任务成功率', value: '99.4%', updateTime: '2026-04-17 16:10:20' },
    { id: 12, metric: '平均处理耗时', value: '276ms', updateTime: '2026-04-17 16:10:20' },
    { id: 13, metric: '活跃任务数', value: '29', updateTime: '2026-04-17 16:10:20' },
    { id: 14, metric: '失败重试数', value: '1', updateTime: '2026-04-17 16:10:20' },
    { id: 15, metric: '队列积压', value: '7', updateTime: '2026-04-17 16:10:20' },
  ]);

  // 下侧图表自适应
  const bottomChartAreaRef = ref<HTMLDivElement>();
  const { tableHeight: bottomChartHeight } = useTableHeight(bottomChartAreaRef, {
    minHeight: 160,
    defaultHeight: 260,
  });

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
        data: [102, 120, 118, 143, 136, 154, 168],
        areaStyle: { opacity: 0.12 },
      },
    ],
  });

  const onInnerResize = (payload: SplitPaneResizePayload): void => {
    innerTopSize.value = payload.size;
  };

  return {
    outerLeftWidth,
    outerCollapsed,
    innerTopSize,
    innerCollapsed,
    selectedKeys,
    treeData,
    topTableAreaRef,
    topTableHeight,
    topColumns,
    topData,
    bottomChartAreaRef,
    bottomChartHeight,
    lineOption,
    onInnerResize,
  };
};
