/** Formily 校验规则的最小结构。 */
interface FormilyValidatorRuleLike {
  required?: boolean;
  whitespace?: boolean;
  message?: string;
}

/** FormItem 反馈归一化所需的字段最小结构。 */
interface FormilyFeedbackFieldLike {
  value?: unknown;
  validator?: unknown;
  selfErrors?: string[];
  selfWarnings?: string[];
  selfSuccesses?: string[];
}

/**
 * 判断校验配置是否为带必填声明的规则对象。
 * @param rule Formily 校验配置
 * @returns 是否为必填规则
 */
const isRequiredRule = (rule: unknown): rule is FormilyValidatorRuleLike =>
  !!rule && typeof rule === 'object' && (rule as FormilyValidatorRuleLike).required === true;

/**
 * 判断字段值是否满足指定必填规则。
 * @param value 当前字段值
 * @param rule 必填规则
 * @returns 是否已满足必填要求
 */
const satisfiesRequiredRule = (value: unknown, rule: FormilyValidatorRuleLike): boolean => {
  if (Array.isArray(value)) {
    return value.some(item => item !== undefined && item !== null && item !== '');
  }
  if (value === undefined || value === null || value === '') return false;
  if (rule.whitespace && typeof value === 'string' && /^\s+$/.test(value)) return false;
  return true;
};

/**
 * 获取字段内可识别的必填规则。
 * @param validator 字段校验配置
 * @returns 必填规则列表
 */
const getRequiredRules = (validator: unknown): FormilyValidatorRuleLike[] => {
  const rules = Array.isArray(validator) ? validator : [validator];
  return rules.filter(isRequiredRule);
};

/**
 * 对单组 FormItem 反馈做空值过滤、去重与必填语义归一化。
 * @param messages 原始反馈消息
 * @param field 当前字段状态
 * @returns 归一化后的消息数组
 */
const normalizeFeedbackMessages = (messages: string[], field: FormilyFeedbackFieldLike): string[] => {
  const uniqueMessages = Array.from(new Set(messages.filter(Boolean)));
  const requiredRules = getRequiredRules(field.validator).filter(rule => !!rule.message);
  if (!requiredRules.length) return uniqueMessages;

  const failedRequiredMessages = new Set(
    requiredRules.filter(rule => !satisfiesRequiredRule(field.value, rule)).map(rule => rule.message as string)
  );
  if (failedRequiredMessages.size) {
    const requiredMessages = uniqueMessages.filter(message => failedRequiredMessages.has(message));
    if (requiredMessages.length) return requiredMessages;
  }

  const satisfiedRequiredMessages = new Set(
    requiredRules.filter(rule => satisfiesRequiredRule(field.value, rule)).map(rule => rule.message as string)
  );
  return uniqueMessages.filter(message => !satisfiedRequiredMessages.has(message));
};

/**
 * 将 Formily 字段反馈转换为 FormItem 可直接渲染的文本。
 * 错误、警告、成功沿用上游优先级，同组消息仅拼接一次。
 * @param field 当前字段状态
 * @returns 反馈文本，无有效反馈时返回 undefined
 */
export const resolveFormItemFeedbackText = (field: FormilyFeedbackFieldLike): string | undefined => {
  const messageGroups = [field.selfErrors, field.selfWarnings, field.selfSuccesses];
  for (const messages of messageGroups) {
    if (!messages?.length) continue;
    const normalized = normalizeFeedbackMessages(messages, field);
    if (normalized.length) return normalized.join(', ');
  }
  return undefined;
};
