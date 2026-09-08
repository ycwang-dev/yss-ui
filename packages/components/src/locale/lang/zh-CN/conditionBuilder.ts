import type { YssConditionBuilderLocale } from '../../types';

const conditionBuilder: YssConditionBuilderLocale = {
  removeGroup: '删除条件组',

  and: '且',
  or: '或',
  operators: {
    EQ: '等于',
    GT: '大于',
    LT: '小于',
    BETWEEN: '区间',
    IN: '包含',
    GTE: '大于等于',
    LTE: '小于等于',
    'IS NULL': '为空',
    'IS NOT NULL': '不为空',
  },
  fieldPlaceholder: '字段',
  operatorPlaceholder: '操作符',
  startPlaceholder: '起始值',
  endPlaceholder: '结束值',
  betweenSeparator: '至',
  selectPlaceholder: '请选择',
  inputPlaceholder: '请输入',
  addSibling: '添加同级条件',
  remove: '删除条件',
  addChild: '添加子级条件',
  childGroup: '子级条件',
};

export default conditionBuilder;
