/** 树数据 */
export const treeData = [
  {
    code: 'root',
    name: '所有项目',
    children: [
      { code: 'project-1', name: '数据中台' },
      { code: 'project-2', name: '投资管理系统' },
      { code: 'project-3', name: '委外资产管理' },
      { code: 'project-4', name: '数据质量平台' },
      { code: 'project-5', name: '数据治理中心' },
      { code: 'project-6', name: '运营监控系统' },
      { code: 'project-7', name: '指标分析平台' },
      { code: 'project-8', name: '数据集成工具' },
      { code: 'project-9', name: '数据交换平台' },
      { code: 'project-10', name: '元数据管理' },
      { code: 'project-11', name: '数据血缘分析' },
      { code: 'project-12', name: '数据标准管理' },
    ],
  },
];

/** 操作菜单配置 */
export const getActions = () => [
  { key: 'edit', label: '编辑' },
  { key: 'delete', label: '删除', danger: true },
];

/** 字段名映射 */
export const fieldNames = { title: 'name', key: 'code', children: 'children' };
