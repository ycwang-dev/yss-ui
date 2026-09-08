import type { ActionButtonConfig, MoreRenderType } from '../type';

/**
 * 测量单个文本在默认 14px 字体下的近似渲染像素宽度
 *
 * @param text 待测量的文本内容
 * @returns 预估的像素宽度
 */
export function measureTextWidth(text?: string): number {
  if (!text) return 0;
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = text.charCodeAt(i);

    // CJK 统一表意文字（汉字）、中文全角符号等
    if (
      (code >= 0x4e00 && code <= 0x9fa5) ||
      (code >= 0x3000 && code <= 0x303f) ||
      (code >= 0xff01 && code <= 0xff5e)
    ) {
      width += 14;
    } else if (char === 'W' || char === 'M' || char === 'Q' || char === '@' || char === '%') {
      // 较宽的英文字母与符号
      width += 9.5;
    } else if (
      char === 'i' ||
      char === 'l' ||
      char === 'j' ||
      char === 't' ||
      char === '!' ||
      char === ':' ||
      char === ';' ||
      char === '.' ||
      char === ',' ||
      char === ' ' ||
      char === '|'
    ) {
      // 较窄的半角字符
      width += 4.5;
    } else {
      // 普通半角英文、数字与符号
      width += 7.8;
    }
  }
  return Math.ceil(width);
}

/**
 * 预估单个操作按钮的所需像素宽度（包含内边距与呼吸安全值）
 *
 * @param btn 按钮配置项
 * @returns 预估的按钮占用像素
 */
export function measureButtonWidth(btn?: ActionButtonConfig): number {
  if (!btn) return 0;
  const label = String(btn.label ?? btn.text ?? '');
  const textWidth = measureTextWidth(label);
  // a-button link 类型的 padding 为左右各 2px (共 4px)
  return Math.max(20, textWidth + 4);
}

/**
 * 计算多语言环境下操作列智能自适应直显数量（Adaptive displayLimit）
 *
 * @param options 参数配置项
 * @returns 最终生效的直显按钮数量
 */
export function resolveAdaptiveDisplayLimit(options: {
  buttons?: ActionButtonConfig[];
  userDisplayLimit?: number;
  isEn?: boolean;
}): number {
  const { buttons = [], userDisplayLimit, isEn = false } = options;

  // 用户显式指定了有效的直显数量时，严格尊重用户配置
  if (userDisplayLimit !== undefined && !Number.isNaN(userDisplayLimit) && userDisplayLimit >= 0) {
    return Math.floor(userDisplayLimit);
  }

  // 中文环境默认直显 3 个
  if (!isEn) {
    return 3;
  }

  // 英文等多语言环境下：若按钮总数超过 2 个，且按钮整体字符偏长，默认收窄为直显 2 个以避免过度占用表格横向宽度
  if (buttons.length > 2) {
    const lengths = buttons.map(b => String(b.label ?? b.text ?? '').length).sort((a, b) => b - a);
    const top3Total = lengths.slice(0, 3).reduce((sum, len) => sum + len, 0);

    // 如果最长的 3 项按钮字符总长超过 14 个字符（如 Authorize/Deactivate 等长词），自适应折叠为 2 个
    if (top3Total >= 14 || lengths.some(len => len >= 8)) {
      return 2;
    }
  }

  return 3;
}

/**
 * 计算操作列的最小安全像素宽度及纠偏
 *
 * @param options 计算选项
 * @returns 最终生效的操作列像素宽度
 */
export function calcActionColumnWidth(options: {
  buttons?: ActionButtonConfig[];
  displayLimit?: number;
  userWidth?: number;
  isEn?: boolean;
  title?: string;
  moreRenderType?: MoreRenderType;
  moreText?: string;
}): number {
  const {
    buttons = [],
    displayLimit = 3,
    userWidth,
    isEn = false,
    title,
    moreRenderType = 'moreButton',
    moreText,
  } = options;

  const validLimit = Math.max(0, Math.floor(displayLimit));

  // 为保证表格各数据行在存在 hideFn 条件显示/互斥操作时均不发生文本截断，
  // 按照候选按钮中最宽的前 validLimit 项组合预估最大所需宽度
  const measuredButtons = buttons.map(btn => ({
    btn,
    width: measureButtonWidth(btn),
  }));
  const sortedButtons = [...measuredButtons].sort((a, b) => b.width - a.width);
  const longestHeadButtons = sortedButtons.slice(0, validLimit);

  // 1. 计算直显最宽按钮组合所需宽度
  const headButtonsWidth = longestHeadButtons.reduce((sum, item) => sum + item.width, 0);

  // 2. 计算直显按钮之间的间距（gap: 8px）
  const gapsCount = Math.max(0, longestHeadButtons.length - 1);
  const gapsWidth = gapsCount * 8;

  // 3. 计算“更多”按钮宽度（如果存在收纳按钮）
  let moreWidth = 0;
  if (buttons.length > validLimit) {
    const moreGap = longestHeadButtons.length > 0 ? 8 : 0;
    if (moreRenderType === 'ellipsis') {
      // 更多图标（24px 宽）
      moreWidth = 24 + moreGap;
    } else {
      // 更多文本按钮
      const defaultMoreText = isEn ? 'More' : '更多';
      const labelText = moreText || defaultMoreText;
      const textWidth = measureTextWidth(labelText);
      moreWidth = Math.max(28, textWidth + 4) + moreGap;
    }
  }

  // 4. 表头标题宽度（确保操作列表头文字不被省略或换行）
  const defaultTitle = isEn ? 'Action' : '操作';
  const headerTitle = title || defaultTitle;
  const headerTextWidth = measureTextWidth(headerTitle);

  // 5. 单元格内边距与安全缓冲（vxe-table 单元格左右 padding 共 20px，附加 6px 渲染容差）
  const cellPaddingAndBuffer = 26;

  const contentWidth = headButtonsWidth + gapsWidth + moreWidth;
  const requiredByContent = contentWidth > 0 ? contentWidth + cellPaddingAndBuffer : 0;
  const requiredByHeader = headerTextWidth + cellPaddingAndBuffer;

  // 纯中文保底 100px，英文等多语言保底 120px
  const minFloor = isEn ? 120 : 100;
  const safeCalculatedWidth = Math.ceil(Math.max(minFloor, requiredByContent, requiredByHeader) / 2) * 2;

  // 6. 安全纠偏（Safety Clamp）：
  // 如果用户未配置宽度，返回安全计算宽度；
  // 如果用户配置了宽度：若用户配置过小（无法容纳），向上纠偏至 safeCalculatedWidth；若用户配置足够宽，保持用户配置
  if (userWidth === undefined || userWidth === null || Number.isNaN(userWidth) || userWidth <= 0) {
    return safeCalculatedWidth;
  }

  return Math.max(userWidth, safeCalculatedWidth);
}
