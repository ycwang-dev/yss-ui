// @vitest-environment happy-dom
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import {
  calcActionColumnWidth,
  measureButtonWidth,
  measureTextWidth,
  resolveAdaptiveDisplayLimit,
} from '../utils/calcActionWidth';
import { useActionConfig } from '../hooks/useTableProps';
import type { ActionButtonConfig } from '../type';

describe('操作列多语言宽度自适应与纠偏算法 (calcActionWidth)', () => {
  describe('measureTextWidth 文本字符宽度测量', () => {
    it('正确测量中文字符（每个汉字 14px）', () => {
      expect(measureTextWidth('编辑')).toBe(28);
      expect(measureTextWidth('授权操作')).toBe(56);
    });

    it('正确测量英文字符与半角符号', () => {
      const editWidth = measureTextWidth('Edit');
      // E(7.8) + d(7.8) + i(4.5) + t(4.5) = 24.6 => ceil 25
      expect(editWidth).toBeGreaterThanOrEqual(24);
      expect(editWidth).toBeLessThanOrEqual(30);

      const authorizeWidth = measureTextWidth('Authorize');
      expect(authorizeWidth).toBeGreaterThanOrEqual(60);
      expect(authorizeWidth).toBeLessThanOrEqual(75);
    });

    it('处理空字符串与 undefined', () => {
      expect(measureTextWidth('')).toBe(0);
      expect(measureTextWidth(undefined)).toBe(0);
    });
  });

  describe('measureButtonWidth 按钮像素宽度估算', () => {
    it('包含按钮 padding 与容差余量', () => {
      const btn: ActionButtonConfig = { label: 'Edit' };
      const width = measureButtonWidth(btn);
      // 文本宽度 (~25px) + 4px 边距 >= 28px
      expect(width).toBeGreaterThanOrEqual(28);
    });

    it('无文案时有保底宽度', () => {
      expect(measureButtonWidth({})).toBe(20);
    });
  });

  describe('resolveAdaptiveDisplayLimit 自适应直显数量', () => {
    const longEnButtons: ActionButtonConfig[] = [{ label: 'Authorize' }, { label: 'Edit' }, { label: 'Delete' }];

    it('中文环境下默认直显 3 个', () => {
      const limit = resolveAdaptiveDisplayLimit({
        buttons: [{ label: '授权' }, { label: '编辑' }, { label: '删除' }],
        isEn: false,
      });
      expect(limit).toBe(3);
    });

    it('英文环境下前 3 项为长单词时，自适应收窄为 2 个直显以防过度撑宽', () => {
      const limit = resolveAdaptiveDisplayLimit({
        buttons: longEnButtons,
        isEn: true,
      });
      expect(limit).toBe(2);
    });

    it('英文环境下短单词按钮保持直显 3 个', () => {
      const limit = resolveAdaptiveDisplayLimit({
        buttons: [{ label: 'Add' }, { label: 'Del' }, { label: 'Get' }],
        isEn: true,
      });
      expect(limit).toBe(3);
    });

    it('用户显式指定 displayLimit 时严格尊重用户意图', () => {
      expect(
        resolveAdaptiveDisplayLimit({
          buttons: longEnButtons,
          userDisplayLimit: 3,
          isEn: true,
        })
      ).toBe(3);

      expect(
        resolveAdaptiveDisplayLimit({
          buttons: longEnButtons,
          userDisplayLimit: 1,
          isEn: false,
        })
      ).toBe(1);
    });
  });

  describe('calcActionColumnWidth 最小安全宽度与安全下限纠偏', () => {
    const zhButtons: ActionButtonConfig[] = [{ label: '授权' }, { label: '编辑' }, { label: '删除' }];

    const enButtons: ActionButtonConfig[] = [{ label: 'Authorize' }, { label: 'Edit' }, { label: 'Delete' }];

    it('中文场景下计算出的安全宽度适合中文紧凑排版', () => {
      const width = calcActionColumnWidth({
        buttons: zhButtons,
        displayLimit: 3,
        isEn: false,
      });
      expect(width).toBeGreaterThanOrEqual(110);
      expect(width).toBeLessThanOrEqual(160);
    });

    it('英文场景且直显 3 个长按钮时，自动计算出足够宽的安全宽度防截断', () => {
      const width = calcActionColumnWidth({
        buttons: enButtons,
        displayLimit: 3,
        isEn: true,
      });
      // 3 个长英文直显总宽需 >= 180px
      expect(width).toBeGreaterThanOrEqual(180);
    });

    it('核心纠偏：老业务写死 width: 140 时，在英文环境下自动纠偏撑大，杜绝截断', () => {
      const width = calcActionColumnWidth({
        buttons: enButtons,
        displayLimit: 3,
        userWidth: 140, // 老业务写死的固定宽度
        isEn: true,
      });
      // 自动提升至安全宽度，绝对不能被 140 压住
      expect(width).toBeGreaterThanOrEqual(180);
      expect(width).toBeGreaterThan(140);
    });

    it('核心纠偏：老业务写死 width: 140 时，在中文环境下保持 140，不破坏原有视觉', () => {
      const width = calcActionColumnWidth({
        buttons: zhButtons,
        displayLimit: 3,
        userWidth: 140,
        isEn: false,
      });
      // 中文下安全宽度约 120-130 <= 140，因此取用户指定的 140
      expect(width).toBe(140);
    });

    it('业务故意配置超大宽度（如 300）时，严格尊重业务意图', () => {
      const width = calcActionColumnWidth({
        buttons: enButtons,
        displayLimit: 3,
        userWidth: 300,
        isEn: true,
      });
      expect(width).toBe(300);
    });

    it('存在折叠“更多”按钮时正确累加更多宽度', () => {
      const manyButtons: ActionButtonConfig[] = [
        { label: 'View' },
        { label: 'Edit' },
        { label: 'Delete' },
        { label: 'Export' },
      ];

      const widthWithMoreButton = calcActionColumnWidth({
        buttons: manyButtons,
        displayLimit: 2,
        isEn: true,
        moreRenderType: 'moreButton',
      });

      const widthWithEllipsis = calcActionColumnWidth({
        buttons: manyButtons,
        displayLimit: 2,
        isEn: true,
        moreRenderType: 'ellipsis',
      });

      expect(widthWithMoreButton).toBeGreaterThanOrEqual(widthWithEllipsis);
    });

    it('当按钮列表中存在条件隐藏长词时（如 Edit, Enable, Deactivate, Delete），自动按最宽组合预估宽度', () => {
      const dictButtons: ActionButtonConfig[] = [
        { label: 'Edit' },
        { label: 'Enable' },
        { label: 'Deactivate' },
        { label: 'Delete' },
      ];

      const width = calcActionColumnWidth({
        buttons: dictButtons,
        displayLimit: 2,
        isEn: true,
      });

      // 预估宽度必须能容纳 Edit + Deactivate + More，绝不能因为 Enable 排在前面而少算
      expect(width).toBeGreaterThanOrEqual(180);
    });
  });

  describe('useActionConfig 在组件层级的集成表现', () => {
    it('正确解析默认操作列并返回自适应宽度与直显数量', () => {
      let config: any;
      mount(
        defineComponent({
          setup() {
            const { resolveActionConfig } = useActionConfig({
              actionConfig: {
                buttons: [{ label: 'Authorize' }, { label: 'Edit' }, { label: 'Delete' }],
              },
            });
            config = resolveActionConfig();
            return () => null;
          },
        })
      );

      expect(config.buttons.length).toBe(3);
      expect(config.width).toBeDefined();
      expect(config.width).toBeGreaterThanOrEqual(110);
      expect(config.displayLimit).toBeDefined();
    });

    it('合并列级别与表格级别的 actionConfig', () => {
      let config: any;
      mount(
        defineComponent({
          setup() {
            const { resolveActionConfig } = useActionConfig({
              actionConfig: {
                title: '全局操作',
                buttons: [{ label: '全局1' }],
              },
            });
            config = resolveActionConfig({
              actionConfig: {
                title: '列专属操作',
                buttons: [{ label: '专属1' }, { label: '专属2' }],
              },
            } as any);
            return () => null;
          },
        })
      );

      expect(config.title).toBe('列专属操作');
      expect(config.buttons.length).toBe(2);
    });
  });
});
