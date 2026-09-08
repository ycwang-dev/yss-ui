/** 树数据 */
export const treeData = [
  {
    key: 'root',
    title: '数据资产目录',
    children: [
      { key: '1', title: '用户数据' },
      { key: '2', title: '交易数据' },
      { key: '3', title: '产品数据' },
      { key: '4', title: '订单数据' },
      { key: '5', title: '日志数据' },
      { key: '6', title: '配置数据' },
      { key: '7', title: '权限数据' },
      { key: '8', title: '报表数据' },
      { key: '9', title: '统计数据' },
      { key: '10', title: '归档数据' },
      { key: '11', title: '备份数据' },
      { key: '12', title: '历史数据' },
      { key: '13', title: '实时数据' },
      { key: '14', title: '离线数据' },
      { key: '15', title: '增量数据' },
    ],
  },
];

/** 数据源下拉选项 */
export const dataSourceOptions = [
  { label: '测试 MySQL', value: 'mysql-test' },
  { label: '生产 MySQL', value: 'mysql-prod' },
  { label: 'Hive 数仓', value: 'hive-dw' },
];

/** 数据库下拉选项 */
export const databaseOptions = [
  { label: 'yss_data', value: 'yss_data' },
  { label: 'yss_report', value: 'yss_report' },
  { label: 'yss_config', value: 'yss_config' },
];
