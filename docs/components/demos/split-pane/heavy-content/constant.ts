import type { YTableColumn } from '@yss-ui/components';

/** 重内容演示树节点。 */
export interface HeavyTreeNode {
  key: string;
  title: string;
  children?: HeavyTreeNode[];
}

/** 重内容演示表格行。 */
export interface HeavyTableRow {
  id: number;
  productCode: string;
  status: string;
  [field: string]: string | number;
}

/** 树字段映射，保持引用稳定。 */
export const TREE_FIELD_NAMES = {
  title: 'title',
  key: 'key',
  children: 'children',
};

/** 横向虚拟滚动配置，30 列场景始终启用。 */
export const VIRTUAL_X_CONFIG = {
  enabled: true,
  gt: 0,
};

/** 表格行主键配置。 */
export const TABLE_ROW_CONFIG = {
  keyField: 'id',
};

/** 树虚拟滚动视口高度。 */
export const TREE_HEIGHT = 468;

/** 表格固定视口高度。 */
export const TABLE_HEIGHT = 474;

/** 生成千级树数据。 */
const createHeavyTreeData = (): HeavyTreeNode[] =>
  Array.from({ length: 20 }, (_, groupIndex) => ({
    key: `group-${groupIndex + 1}`,
    title: `产品分类 ${String(groupIndex + 1).padStart(2, '0')}`,
    children: Array.from({ length: 50 }, (_, itemIndex) => ({
      key: `product-${groupIndex + 1}-${itemIndex + 1}`,
      title: `委外产品 ${String(groupIndex + 1).padStart(2, '0')}-${String(itemIndex + 1).padStart(2, '0')}`,
    })),
  }));

/** 生成 30 列表格配置，并包含左右固定列。 */
const createHeavyTableColumns = (): YTableColumn[] => [
  { field: 'id', title: '序号', width: 80, fixed: 'left', align: 'center' },
  { field: 'productCode', title: '产品代码', width: 180, fixed: 'left' },
  ...Array.from({ length: 27 }, (_, index) => ({
    field: `field${index + 1}`,
    title: `估值字段 ${index + 1}`,
    width: 150,
    showOverflow: true,
  })),
  { field: 'status', title: '处理状态', width: 120, fixed: 'right' },
];

/** 生成 20 行宽表格数据。 */
const createHeavyTableData = (): HeavyTableRow[] =>
  Array.from({ length: 20 }, (_, rowIndex) => {
    const row: HeavyTableRow = {
      id: rowIndex + 1,
      productCode: `PRODUCT-${String(rowIndex + 1).padStart(4, '0')}`,
      status: rowIndex % 3 === 0 ? '待复核' : '已完成',
    };
    Array.from({ length: 27 }, (_, columnIndex) => {
      row[`field${columnIndex + 1}`] = `R${rowIndex + 1}-C${columnIndex + 1}`;
    });
    return row;
  });

/** 千级树演示数据。 */
export const HEAVY_TREE_DATA = createHeavyTreeData();

/** 30 列表格配置。 */
export const HEAVY_TABLE_COLUMNS = createHeavyTableColumns();

/** 20 行表格数据。 */
export const HEAVY_TABLE_DATA = createHeavyTableData();
