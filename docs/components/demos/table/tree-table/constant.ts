import type { YTableActionConfig, YTableColumn } from '@yss-ui/components';
import type { VxeTablePropTypes } from 'vxe-table';

/**
 * 目录树节点数据
 */
export interface DirectoryTreeNode {
  id: string;
  parentId: string | null;
  nodeName: string;
  nodeLevel: number;
  tagNames: string;
  editTime: string;
  children?: DirectoryTreeNode[];
}

/**
 * 树形表格行配置
 */
export const TREE_ROW_CONFIG: VxeTablePropTypes.RowConfig = {
  keyField: 'id',
  useKey: true,
  isCurrent: true,
  isHover: true,
};

/**
 * 树形表格配置
 */
export const TREE_CONFIG: VxeTablePropTypes.TreeConfig = {
  rowField: 'id',
  parentField: 'parentId',
  childrenField: 'children',
  indent: 20,
};

/**
 * 树形表格列配置
 */
export const TREE_TABLE_COLUMNS: YTableColumn[] = [
  {
    field: 'nodeName',
    title: '节点名称',
    minWidth: 260,
    treeNode: true,
  },
  {
    field: 'nodeLevel',
    title: '节点层级',
    width: 120,
    align: 'center',
  },
  {
    field: 'tagNames',
    title: '关联标签',
    minWidth: 320,
  },
  {
    field: 'editTime',
    title: '编辑时间',
    width: 180,
  },
];

/**
 * 树形表格模拟数据
 */
export const TREE_TABLE_DATA: DirectoryTreeNode[] = [
  {
    id: 'internal',
    parentId: null,
    nodeName: '内部数据',
    nodeLevel: 1,
    tagNames: '内部数据',
    editTime: '2024-08-19 14:52:15',
    children: [
      {
        id: 'internal-sales',
        parentId: 'internal',
        nodeName: '销售数据',
        nodeLevel: 2,
        tagNames: '销售, 经营',
        editTime: '2024-08-20 09:18:31',
        children: [
          {
            id: 'internal-sales-month',
            parentId: 'internal-sales',
            nodeName: '月度销售明细',
            nodeLevel: 3,
            tagNames: '月报, 明细',
            editTime: '2024-08-21 11:09:42',
          },
          {
            id: 'internal-sales-region',
            parentId: 'internal-sales',
            nodeName: '区域销售汇总',
            nodeLevel: 3,
            tagNames: '区域, 汇总',
            editTime: '2024-08-21 15:36:27',
          },
        ],
      },
      {
        id: 'internal-finance',
        parentId: 'internal',
        nodeName: '财务数据',
        nodeLevel: 2,
        tagNames: '财务, 预算',
        editTime: '2024-08-22 10:12:03',
      },
    ],
  },
  {
    id: 'external',
    parentId: null,
    nodeName: '外部数据',
    nodeLevel: 1,
    tagNames: '外部数据',
    editTime: '2024-08-18 16:33:09',
    children: [
      {
        id: 'external-market',
        parentId: 'external',
        nodeName: '市场数据',
        nodeLevel: 2,
        tagNames: '市场, 行业',
        editTime: '2024-08-19 13:24:18',
      },
      {
        id: 'external-user',
        parentId: 'external',
        nodeName: '用户调研',
        nodeLevel: 2,
        tagNames: '用户, 调研',
        editTime: '2024-08-20 17:05:56',
      },
    ],
  },
];

/**
 * 创建树形表格操作列配置
 *
 * @param onEdit 编辑回调
 * @param onDelete 删除回调
 * @returns 操作列配置
 */
export const createTreeActionConfig = (
  onEdit: (row: DirectoryTreeNode) => void,
  onDelete: (row: DirectoryTreeNode) => void
): YTableActionConfig => ({
  title: '操作',
  width: 150,
  fixed: 'right',
  buttons: [
    {
      value: 'edit',
      label: '编辑',
      click: ({ row }) => onEdit(row as DirectoryTreeNode),
    },
    {
      value: 'delete',
      label: '删除',
      isConfirm: true,
      confirmProps: {
        title: '确认删除该节点及其子节点吗？',
      },
      click: ({ row }) => onDelete(row as DirectoryTreeNode),
    },
  ],
});
