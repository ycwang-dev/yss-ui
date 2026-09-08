import { useIntl, usePrefersColor, useSiteData } from 'dumi';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import './index.less';

const IconDark = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M8.218 1.455c3.527.109 6.327 3.018 6.327 6.545 0 3.6-2.945 6.545-6.545 6.545a6.562 6.562 0 0 1-6.036-4h.218c3.6 0 6.545-2.945 6.545-6.545 0-.91-.182-1.745-.509-2.545m0-1.455c-.473 0-.909.218-1.2.618-.29.4-.327.946-.145 1.382.254.655.4 1.31.4 2 0 2.8-2.291 5.09-5.091 5.09h-.218c-.473 0-.91.22-1.2.62-.291.4-.328.945-.146 1.38C1.891 14.074 4.764 16 8 16c4.4 0 8-3.6 8-8a7.972 7.972 0 0 0-7.745-8h-.037Z" />
  </svg>
);

const IconLight = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M8 13a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM8 3a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm7 4a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2h1ZM3 8a1 1 0 0 1-1 1H1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm9.95 3.536.707.707a1 1 0 0 1-1.414 1.414l-.707-.707a1 1 0 0 1 1.414-1.414Zm-9.9-7.072-.707-.707a1 1 0 0 1 1.414-1.414l.707.707A1 1 0 0 1 3.05 4.464Zm9.9 0a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 1.414l-.707.707Zm-9.9 7.072a1 1 0 0 1 1.414 1.414l-.707.707a1 1 0 0 1-1.414-1.414l.707-.707ZM8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 6.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
  </svg>
);

const IconAuto = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M14.595 8a6.595 6.595 0 1 1-13.19 0 6.595 6.595 0 0 1 13.19 0ZM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm0 2.014v11.972A5.986 5.986 0 0 0 8 2.014Z" />
  </svg>
);

/** Header 触发按钮使用的主题图标，避免按钮内继续出现圆形图标。 */
const IconTheme = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M3 4.2h4.8M3 8h6.7M3 11.8h4.8"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.45"
    />
    <path
      d="M11.45 2.8 12.05 5l2.15.6-2.15.6-.6 2.2-.6-2.2-2.15-.6 2.15-.6.6-2.2ZM11.9 9.7l.38 1.34 1.32.38-1.32.38-.38 1.34-.38-1.34-1.32-.38 1.32-.38.38-1.34Z"
      fill="currentColor"
    />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M6.7 11.43 3.56 8.3a.85.85 0 0 1 1.2-1.2l1.94 1.93 4.54-4.53a.85.85 0 1 1 1.2 1.2l-5.74 5.73Z" />
  </svg>
);

const ICON_MAPPING = {
  light: IconLight,
  dark: IconDark,
  auto: IconAuto,
} as const;

type ColorMode = keyof typeof ICON_MAPPING;

/** 将 dumi 的实际明暗主题同步给 vxe-ui，确保表格与 Teleport 弹层使用同一套主题变量。 */
const syncVxeTheme = () => {
  const root = document.documentElement;
  const resolvedTheme = root.getAttribute('data-prefers-color') === 'dark' ? 'dark' : 'light';
  root.setAttribute('data-vxe-ui-theme', resolvedTheme);
};

/** 主题选项补充说明；dumi 默认语言包仅提供标题，因此在本地完成中英文映射。 */
const COLOR_MODE_DESCRIPTIONS: Record<ColorMode, { zh: string; en: string }> = {
  light: { zh: '透明感更强，适合高亮阅读', en: 'Higher clarity for bright environments' },
  dark: { zh: '低亮环境更沉浸，层次更聚焦', en: 'Deeper focus in low-light environments' },
  auto: { zh: '保留三态智能切换，自动响应系统设置', en: 'Automatically follows the system appearance' },
};

const ColorSwitch: FC = () => {
  const { themeConfig } = useSiteData();
  const defaultColor = ((themeConfig as any)?.prefersColor?.default || 'auto') as ColorMode;
  const intl = useIntl();
  const [, prefersColorRaw, setPrefersColor] = usePrefersColor();
  const prefersColor = (prefersColorRaw || defaultColor || 'auto') as ColorMode;

  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const canHover =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(hover: hover)').matches
      : false;

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openMenu = () => {
    clearCloseTimer();
    setMenuOpen(true);
  };

  const closeMenuWithDelay = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setMenuOpen(false);
      closeTimerRef.current = null;
    }, 140);
  };

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', onClickOutside, true);
    document.addEventListener('keydown', onEsc, true);

    return () => {
      document.removeEventListener('click', onClickOutside, true);
      document.removeEventListener('keydown', onEsc, true);
    };
  }, [menuOpen]);

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    syncVxeTheme();

    const observer = new MutationObserver(syncVxeTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-prefers-color'],
    });

    return () => observer.disconnect();
  }, []);

  const options = useMemo(() => {
    const descriptionLocale = intl.locale?.toLowerCase().startsWith('en') ? 'en' : 'zh';

    return [
      {
        value: 'light' as ColorMode,
        label: intl.formatMessage({ id: 'header.color.mode.light', defaultMessage: '亮色模式' }),
        desc: COLOR_MODE_DESCRIPTIONS.light[descriptionLocale],
      },
      {
        value: 'dark' as ColorMode,
        label: intl.formatMessage({ id: 'header.color.mode.dark', defaultMessage: '暗色模式' }),
        desc: COLOR_MODE_DESCRIPTIONS.dark[descriptionLocale],
      },
      {
        value: 'auto' as ColorMode,
        label: intl.formatMessage({ id: 'header.color.mode.auto', defaultMessage: '跟随系统' }),
        desc: COLOR_MODE_DESCRIPTIONS.auto[descriptionLocale],
      },
    ] as const;
  }, [intl]);

  const currentOption = options.find(item => item.value === prefersColor) || options[2];

  return (
    <div
      className={`dumi-default-color-switch yss-color-switch${menuOpen ? ' is-open' : ''}`}
      ref={wrapperRef}
      onMouseEnter={() => {
        if (canHover) openMenu();
      }}
      onMouseLeave={() => {
        if (canHover) closeMenuWithDelay();
      }}
      onClick={event => event.stopPropagation()}
    >
      <button
        type="button"
        className="yss-color-switch-trigger"
        aria-label={currentOption.label}
        title={currentOption.label}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => {
          clearCloseTimer();
          setMenuOpen(value => !value);
        }}
      >
        <span className="yss-color-switch-trigger-icon" aria-hidden="true">
          <IconTheme />
        </span>
      </button>

      <div className="yss-color-switch-menu" role="menu" aria-hidden={!menuOpen}>
        <div className="yss-color-switch-menu-head">
          <span className="yss-color-switch-menu-title">Theme</span>
          <span className="yss-color-switch-menu-subtitle">Crystal Capsule</span>
        </div>

        {options.map(option => {
          const OptionIcon = ICON_MAPPING[option.value];
          const active = option.value === prefersColor;

          return (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              data-mode={option.value}
              className={`yss-color-switch-option${active ? ' is-active' : ''}`}
              onClick={() => {
                setPrefersColor(option.value);
                setMenuOpen(false);
              }}
            >
              <span className="yss-color-switch-option-preview" aria-hidden="true">
                <span className="yss-color-switch-preview-toolbar" />
                <span className="yss-color-switch-preview-card" />
                <span className="yss-color-switch-preview-orb" />
              </span>

              <span className="yss-color-switch-option-body">
                <span className="yss-color-switch-option-topline">
                  <span className="yss-color-switch-option-icon" aria-hidden="true">
                    <OptionIcon />
                  </span>
                  <span className="yss-color-switch-option-title">{option.label}</span>
                </span>
                <span className="yss-color-switch-option-desc">{option.desc}</span>
              </span>

              <span className="yss-color-switch-option-check" aria-hidden="true">
                <IconCheck />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ColorSwitch;
