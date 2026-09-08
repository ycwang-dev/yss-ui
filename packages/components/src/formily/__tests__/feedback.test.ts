import { describe, expect, it } from 'vitest';
import { resolveFormItemFeedbackText } from '../components/formItemFeedback';

/** 创建带密码必填规则的字段状态。 */
const createPasswordField = (value: unknown, selfErrors: string[]) => ({
  value,
  selfErrors,
  validator: [{ required: true, whitespace: true, message: '请输入密码' }, { validator: () => true }],
});

describe('resolveFormItemFeedbackText', () => {
  it('joins multiple messages only once and removes empty or duplicated messages', () => {
    expect(
      resolveFormItemFeedbackText({
        selfErrors: ['错误1', '', '错误1', '错误2'],
      })
    ).toBe('错误1, 错误2');
  });

  it('keeps only the required message when the current value is empty', () => {
    expect(resolveFormItemFeedbackText(createPasswordField('', ['请输入密码', '密码长度需8-20位']))).toBe('请输入密码');
  });

  it('treats whitespace-only text as missing when the rule enables whitespace validation', () => {
    expect(resolveFormItemFeedbackText(createPasswordField('   ', ['请输入密码', '密码长度需8-20位']))).toBe(
      '请输入密码'
    );
  });

  it('removes stale required feedback when a non-empty value fails the length rule', () => {
    expect(resolveFormItemFeedbackText(createPasswordField('Aa1xxxx', ['请输入密码', '密码长度需8-20位']))).toBe(
      '密码长度需8-20位'
    );
  });

  it('removes stale required feedback when a non-empty value fails the strength rule', () => {
    expect(
      resolveFormItemFeedbackText(
        createPasswordField('abcdefgh', [
          '请输入密码',
          '至少一个大写字母、一个小写字母和一个数字，可包含特殊字符(下划线、破折号、感叹号)',
        ])
      )
    ).toBe('至少一个大写字母、一个小写字母和一个数字，可包含特殊字符(下划线、破折号、感叹号)');
  });

  it('keeps the upstream error, warning and success priority', () => {
    expect(
      resolveFormItemFeedbackText({
        selfErrors: [],
        selfWarnings: ['警告1', '警告2'],
        selfSuccesses: ['校验通过'],
      })
    ).toBe('警告1, 警告2');
  });
});
