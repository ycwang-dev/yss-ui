import { ref, reactive } from 'vue';
import type { YTableColumn, YTableActionConfig } from '@yss-ui/components';
import { useTableHeight, useTreeHeight, YTREE_SEARCH_HEIGHT } from '@yss-ui/hooks';

/** 左树右表演示行数据。 */
export interface RowVO {
  id: number;
  name: string;
  type: string;
  host: string;
  createTime: string;
  status: number;
}

/**
 * 典型场景 Tree + Table 演示状态。
 * @returns 分割面板、树表高度与列表示例状态
 */
export const useTreeTable = () => {
  /** SplitPane 折叠状态。 */
  const collapsed = ref(false);
  /** 左侧面板宽度。 */
  const leftWidth = ref(260);

  /** 左侧树区域容器。 */
  const treeAreaRef = ref<HTMLDivElement>();
  /** 右侧表格区域容器。 */
  const tableAreaRef = ref<HTMLDivElement>();

  /** 树自适应高度（默认开启内置搜索，需扣除搜索区）。 */
  const { treeHeight } = useTreeHeight(treeAreaRef, {
    extraOffset: YTREE_SEARCH_HEIGHT,
  });
  /** 表格自适应高度（开启分页时扣除分页区）。 */
  const { tableHeight, isReady } = useTableHeight(tableAreaRef, {
    withPagination: true,
  });

  /** 当前选中的树节点。 */
  const selectedKeys = ref<string[]>(['1']);
  /** 资源树数据。 */
  const treeData = ref([
    {
      key: '1',
      title: '所有任务流',
      children: [
        { key: '1-1', title: 'test' },
        { key: '1-2', title: '委外管理平台' },
        { key: '1-3', title: '投资管理演示' },
        { key: '1-4', title: '数仓演示' },
        { key: '1-5', title: '数据质量V2' },
      ],
    },
  ]);

  /** 表格加载态。 */
  const loading = ref(false);
  /** 规则名称筛选。 */
  const searchName = ref('');

  /** 表格演示数据。 */
  const tableData = ref<RowVO[]>([
    {
      id: 1,
      name: '每日文件获取数量',
      type: '自定义SQL',
      host: '14.15.22.11',
      createTime: '2025-09-10 11:00:00',
      status: 1,
    },
    {
      id: 2,
      name: '每日数据接收统计',
      type: '自定义SQL',
      host: '14.15.16.21',
      createTime: '2025-09-10 11:00:00',
      status: 1,
    },
    {
      id: 3,
      name: '系统运行状态监控',
      type: 'Shell脚本',
      host: '14.15.22.12',
      createTime: '2025-09-11 09:30:00',
      status: 0,
    },
    {
      id: 4,
      name: '核心服务心跳检测',
      type: 'HTTP检测',
      host: '14.15.16.22',
      createTime: '2025-09-11 10:15:00',
      status: 1,
    },
    {
      id: 5,
      name: '数据库连接池监控',
      type: '自定义SQL',
      host: '14.15.22.13',
      createTime: '2025-09-12 14:20:00',
      status: 1,
    },
    {
      id: 6,
      name: '磁盘空间预警',
      type: 'Shell脚本',
      host: '14.15.16.23',
      createTime: '2025-09-13 16:45:00',
      status: 1,
    },
  ]);

  /** 表格列配置。 */
  const columns = ref<YTableColumn[]>([
    { type: 'checkbox', width: 50, align: 'center' },
    { field: 'name', title: '监控规则名称', minWidth: 180 },
    { field: 'type', title: '监控规则类型', width: 120 },
    { field: 'host', title: '主机地址', width: 140 },
    { field: 'createTime', title: '创建时间', width: 180 },
  ]);

  /** 操作列配置。 */
  const actionConfig = reactive<YTableActionConfig>({
    width: 80,
    align: 'left',
    fixed: 'right',
    displayLimit: 2,
    moreRenderType: 'moreButton',
    buttons: [
      {
        text: '查看',
        key: 'view',
        type: 'link',
        clickFn: ({ row }: { row: RowVO }) => alert(`查看：${row.name}`),
        disabledFn: ({ rowIndex }: { rowIndex: number }) => rowIndex % 2 === 0,
      },
    ],
  });

  /** 分页状态。 */
  const pagination = reactive({
    total: 1002,
    current: 1,
    pageSize: 20,
  });

  /**
   * 处理分页变化。
   * @param payload - 分页变更参数
   */
  const handlePageChange = ({ current, pageSize }: { current: number; pageSize: number }) => {
    pagination.current = current;
    pagination.pageSize = pageSize;
    loading.value = true;
    setTimeout(() => {
      loading.value = false;
    }, 500);
  };

  return {
    collapsed,
    leftWidth,
    treeAreaRef,
    tableAreaRef,
    treeHeight,
    tableHeight,
    isReady,
    selectedKeys,
    treeData,
    loading,
    searchName,
    tableData,
    columns,
    pagination,
    handlePageChange,
    actionConfig,
  };
};
