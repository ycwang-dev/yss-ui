import type { YssConditionBuilderLocale } from '../../types';

const conditionBuilder: YssConditionBuilderLocale = {
  removeGroup: 'Remove condition group',

  and: 'AND',
  or: 'OR',
  operators: {
    EQ: 'Equals',
    GT: 'Greater than',
    LT: 'Less than',
    BETWEEN: 'Between',
    IN: 'Includes',
    GTE: 'Greater than or equal',
    LTE: 'Less than or equal',
    'IS NULL': 'Is null',
    'IS NOT NULL': 'Is not null',
  },
  fieldPlaceholder: 'Field',
  operatorPlaceholder: 'Operator',
  startPlaceholder: 'Start Value',
  endPlaceholder: 'End Value',
  betweenSeparator: 'to',
  selectPlaceholder: 'Please select',
  inputPlaceholder: 'Please enter',
  addSibling: 'Add Sibling Condition',
  remove: 'Remove Condition',
  addChild: 'Add Child Condition',
  childGroup: 'Child Group',
  addCondition: 'Add Condition',
};

export default conditionBuilder;
