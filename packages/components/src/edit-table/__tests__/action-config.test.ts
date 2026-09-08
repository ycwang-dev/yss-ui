// @vitest-environment happy-dom
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { useActionConfig } from '../hooks/useActionConfig';
import { useColumns } from '../hooks/useColumns';

describe('YEditTable 操作列多语言自适应与纠偏', () => {
  it('useActionConfig 正确计算并纠偏操作列宽度', () => {
    let config: any;
    mount(
      defineComponent({
        setup() {
          const { resolveActionConfig } = useActionConfig({
            actionConfig: {
              width: 140, // 模拟老业务固定传 140
              buttons: [{ label: 'Authorize' }, { label: 'Edit' }, { label: 'Delete' }],
            },
          });
          config = resolveActionConfig();
          return () => null;
        },
      })
    );

    expect(config.buttons.length).toBe(3);
    // 英文长词必须大于等于安全宽度
    expect(config.width).toBeGreaterThanOrEqual(140);
  });

  it('useColumns 同步操作列自适应宽度', () => {
    let col: any;
    mount(
      defineComponent({
        setup() {
          const { getColumnProps } = useColumns({
            actionConfig: {
              buttons: [{ label: '编辑' }, { label: '删除' }],
            },
          });
          col = getColumnProps({ type: 'action' });
          return () => null;
        },
      })
    );

    expect(col.title).toBe('操作');
    expect(col.width).toBeGreaterThanOrEqual(100);
    expect(col.fixed).toBe('right');
  });
});
