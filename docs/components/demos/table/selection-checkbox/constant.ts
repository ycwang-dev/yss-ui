import type { YTableColumn } from '@yss-ui/components';

/**
 * 示例数据项类型定义
 */
export interface SelectionUserItem {
  id: number;
  name: string;
  department: string;
  role: string;
  status: number;
  email: string;
  createTime: string;
}

/**
 * 表格列配置
 */
export const SELECTION_COLUMNS: YTableColumn[] = [
  { type: 'checkbox', width: 50, fixed: 'left', align: 'center' },
  { type: 'seq', title: '序号', width: 60, align: 'center' },
  { field: 'name', title: '姓名', width: 120 },
  { field: 'department', title: '所属部门', width: 130 },
  { field: 'role', title: '岗位角色', width: 130 },
  { field: 'status', title: '状态', width: 90, align: 'center' },
  { field: 'email', title: '电子邮箱', minWidth: 180 },
  { field: 'createTime', title: '创建时间', width: 160 },
];

/**
 * 示例初始表格数据
 */
export const INITIAL_TABLE_DATA: SelectionUserItem[] = [
  {
    id: 1,
    name: '张三',
    department: '研发中心',
    role: '前端架构师',
    status: 1,
    email: 'zhangsan@ysstech.com',
    createTime: '2024-01-15 10:00:00',
  },
  {
    id: 2,
    name: '李四',
    department: '产品中心',
    role: '高级产品经理',
    status: 1,
    email: 'lisi@ysstech.com',
    createTime: '2024-01-16 11:30:00',
  },
  {
    id: 3,
    name: '王五',
    department: '体验设计部',
    role: 'UI 设计师',
    status: 0,
    email: 'wangwu@ysstech.com',
    createTime: '2024-01-17 14:20:00',
  },
  {
    id: 4,
    name: '赵六',
    department: '研发中心',
    role: '后端开发工程师',
    status: 1,
    email: 'zhaoliu@ysstech.com',
    createTime: '2024-01-18 16:45:00',
  },
  {
    id: 5,
    name: '孙七',
    department: '质量保障部',
    role: '测试专家',
    status: 0,
    email: 'sunqi@ysstech.com',
    createTime: '2024-01-19 09:15:00',
  },
  {
    id: 6,
    name: '周八',
    department: '运营中心',
    role: '数据运营专员',
    status: 1,
    email: 'zhouba@ysstech.com',
    createTime: '2024-01-20 15:10:00',
  },
];
