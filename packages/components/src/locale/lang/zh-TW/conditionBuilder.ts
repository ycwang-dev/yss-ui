import type { YssConditionBuilderLocale } from '../../types';

const conditionBuilder: YssConditionBuilderLocale = {
  removeGroup: '刪除條件組',

  and: '且',
  or: '或',
  operators: {
    EQ: '等於',
    GT: '大於',
    LT: '小於',
    BETWEEN: '區間',
    IN: '包含',
    GTE: '大於等於',
    LTE: '小於等於',
    'IS NULL': '為空',
    'IS NOT NULL': '不為空',
  },
  fieldPlaceholder: '欄位',
  operatorPlaceholder: '運算子',
  startPlaceholder: '起始值',
  endPlaceholder: '結束值',
  betweenSeparator: '至',
  selectPlaceholder: '請選擇',
  inputPlaceholder: '請輸入',
  addSibling: '新增同級條件',
  remove: '刪除條件',
  addChild: '新增子級條件',
  childGroup: '子級條件',
  addCondition: '添加條件',
};

export default conditionBuilder;
