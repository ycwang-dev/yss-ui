import { describe, it, expect } from 'vitest';
import { useConditionTree } from '../hooks/useConditionTree';
import type { ConditionGroup } from '../types';

const nestedWithValues: ConditionGroup = {
  id: 'root',
  type: 'GROUP',
  logicalOp: 'AND',
  children: [
    {
      id: 'leaf1',
      type: 'LEAF',
      field: 'age',
      operator: '=',
      value: '18',
      betweenValue1: '',
      betweenValue2: '',
    },
    {
      id: 'group2',
      type: 'GROUP',
      logicalOp: 'AND',
      children: [
        {
          id: 'leaf3',
          type: 'LEAF',
          field: 'name',
          operator: '=',
          value: 'John',
          betweenValue1: '',
          betweenValue2: '',
        },
      ],
      linkedFromLeafId: 'leaf1',
    },
  ],
};

describe('useConditionTree', () => {
  it('should preserve nested values', () => {
    const { root } = useConditionTree(nestedWithValues, {
      maxDepth: 5,
      operatorResolver: async () => [],
    });

    // console.log('DEBUG: root.value', JSON.stringify(root.value, null, 2));

    const secondChild = root.value.children[1] as ConditionGroup;
    const nestedLeaf = secondChild.children[0] as any;

    expect(nestedLeaf.field).toBe('name');
    expect(nestedLeaf.value).toBe('John');
  });
});
