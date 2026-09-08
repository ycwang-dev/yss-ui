// 新文件
export type YssThemeOptions = {
  primary: string;
  success?: string;
  warning?: string;
  error?: string;
  mirrorToLegacy?: boolean; // 是否镜像到 --primary-color* 兼容变量
  target?: Document | HTMLElement; // 默认 document.documentElement
};

const toHex = (n: number) => n.toString(16).padStart(2, '0');
const clamp = (n: number, min = 0, max = 255) => Math.max(min, Math.min(max, n));
const normalizeHex = (hex: string) => {
  if (!hex) return '#3371ff';
  if (hex.startsWith('#') && (hex.length === 7 || hex.length === 4)) {
    if (hex.length === 4) {
      const r = hex[1],
        g = hex[2],
        b = hex[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return hex.toLowerCase();
  }
  return '#3371ff';
};

export const lightenColor = (hex: string, factor = 0.1) => {
  const h = normalizeHex(hex).slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const nr = clamp(Math.floor(r * (1 + factor)));
  const ng = clamp(Math.floor(g * (1 + factor)));
  const nb = clamp(Math.floor(b * (1 + factor)));
  return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
};

export const darkenColor = (hex: string, factor = 0.2) => {
  const h = normalizeHex(hex).slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const nr = clamp(Math.floor(r * (1 - factor)));
  const ng = clamp(Math.floor(g * (1 - factor)));
  const nb = clamp(Math.floor(b * (1 - factor)));
  return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
};

export const applyYssTheme = (opts: YssThemeOptions) => {
  const root =
    opts?.target instanceof HTMLElement
      ? opts.target
      : (opts?.target as Document)?.documentElement || document.documentElement;

  const primary = normalizeHex(opts.primary);
  const success = normalizeHex(opts.success ?? '#1db01d');
  const warning = normalizeHex(opts.warning ?? '#ffb800');
  const error = normalizeHex(opts.error ?? '#dc2626');

  const p5 = lightenColor(primary, 0.1);
  const p6 = primary;
  const p7 = darkenColor(primary, 0.2);

  root.style.setProperty('--yss-color-primary-5', p5);
  root.style.setProperty('--yss-color-primary-6', p6);
  root.style.setProperty('--yss-color-primary-7', p7);

  const s5 = lightenColor(success, 0.1);
  const s6 = success;
  const s7 = darkenColor(success, 0.1);
  root.style.setProperty('--yss-color-success-5', s5);
  root.style.setProperty('--yss-color-success-6', s6);
  root.style.setProperty('--yss-color-success-7', s7);

  const w5 = lightenColor(warning, 0.1);
  const w6 = warning;
  const w7 = darkenColor(warning, 0.1);
  root.style.setProperty('--yss-color-warning-5', w5);
  root.style.setProperty('--yss-color-warning-6', w6);
  root.style.setProperty('--yss-color-warning-7', w7);

  const e5 = lightenColor(error, 0.1);
  const e6 = error;
  const e7 = darkenColor(error, 0.1);
  root.style.setProperty('--yss-color-error-5', e5);
  root.style.setProperty('--yss-color-error-6', e6);
  root.style.setProperty('--yss-color-error-7', e7);

  if (opts.mirrorToLegacy !== false) {
    root.style.setProperty('--primary-color', p6);
    root.style.setProperty('--primary-color-hover', p5);
    root.style.setProperty('--primary-color-active', p7);
  }

  return {
    primary: { 5: p5, 6: p6, 7: p7 },
    success: { 5: s5, 6: s6, 7: s7 },
    warning: { 5: w5, 6: w6, 7: w7 },
    error: { 5: e5, 6: e6, 7: e7 },
  };
};
