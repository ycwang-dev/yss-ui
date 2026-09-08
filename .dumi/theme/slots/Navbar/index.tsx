import { Link, useLocation, useNavData } from 'dumi';
import React, { CSSProperties, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './index.less';

const BREAKPOINTS = {
  FULL: 960,
  MOBILE: 768,
};

const VISIBLE_COUNT_COMPACT = 4;
const DEFAULT_ACCENT = '#4f8cff';

interface INavItem {
  title: string;
  link?: string;
  activePath?: string;
  children?: INavItem[];
  badge?: string;
  highlight?: boolean;
  icon?: string;
  accent?: string;
}

const getVisibleCount = (totalCount: number): number => {
  if (typeof window === 'undefined') return -1;
  const width = window.innerWidth;

  if (width >= BREAKPOINTS.FULL) return -1;
  if (width >= BREAKPOINTS.MOBILE) return Math.min(VISIBLE_COUNT_COMPACT, totalCount);

  return -1;
};

const getItemKey = (data: INavItem) => data.activePath || data.link || data.title;
const isExternalLink = (link?: string) => Boolean(link && /^(\w+):\/\/|^(mailto|tel):/.test(link));

const resolveAccent = (accent?: string) => {
  const accentMap: Record<string, string> = {
    sky: '#43a3ff',
    violet: '#4f46e5',
    amber: '#ff9b45',
    cyan: '#45c9ff',
    emerald: '#3dd38c',
    rose: '#ff6b9d',
  };

  return (accent && accentMap[accent]) || accent || DEFAULT_ACCENT;
};

const isItemActive = (data: INavItem, pathname: string): boolean => {
  const activePath = data.activePath || data.link;
  if (activePath && pathname.startsWith(activePath)) return true;
  return Boolean(data.children?.some(child => isItemActive(child, pathname)));
};

const IconChevron: FC = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="m4.5 6 3.5 4 3.5-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

const IconCompass: FC = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="m10.7 5.3-1.6 4-4 1.4 1.6-4 4-1.4Z"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.4"
    />
  </svg>
);

const IconGrid: FC = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <rect x="2.25" y="2.25" width="4.5" height="4.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <rect x="9.25" y="2.25" width="4.5" height="4.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <rect x="2.25" y="9.25" width="4.5" height="4.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <rect x="9.25" y="9.25" width="4.5" height="4.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

const IconToolbox: FC = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M5.25 4.5V4A1.75 1.75 0 0 1 7 2.25h2A1.75 1.75 0 0 1 10.75 4v.5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.35"
    />
    <path
      d="M2.5 5.5h11v5.25a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V5.5Z"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.35"
    />
    <path d="M6.4 8h3.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" />
  </svg>
);

const IconNodes: FC = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <circle cx="4" cy="4" r="1.75" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="12" cy="4" r="1.75" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="8" cy="12" r="1.75" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <path
      d="M5.45 5.15 7 9.8m3.55-4.65L9 9.8M5.7 4h4.6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.3"
    />
  </svg>
);

const IconSpark: FC = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M8 2.2 9.2 6.8 13.8 8 9.2 9.2 8 13.8 6.8 9.2 2.2 8 6.8 6.8 8 2.2Z"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.3"
    />
    <path d="m12.6 2.8.45 1.15 1.15.45-1.15.45-.45 1.15-.45-1.15-1.15-.45 1.15-.45.45-1.15Z" fill="currentColor" />
  </svg>
);

const IconPulse: FC = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M2.2 8h2.3l1.2-2.2 2.1 5 2-4 1.1 1.2h3.9"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.35"
    />
    <path
      d="M3 12.5h10"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeOpacity=".35"
      strokeWidth="1.2"
    />
  </svg>
);

const NAV_ICON_MAP: Record<string, FC> = {
  compass: IconCompass,
  grid: IconGrid,
  toolbox: IconToolbox,
  nodes: IconNodes,
  spark: IconSpark,
  pulse: IconPulse,
};

const renderNavTitle = (data: INavItem, showIcon = false) => {
  const Icon = data.icon ? NAV_ICON_MAP[data.icon] : null;
  const hasIcon = Boolean(showIcon && Icon);

  return (
    <span className={`yss-nav-item-inner${hasIcon ? '' : ' is-iconless'}`}>
      {hasIcon && (
        <span className="yss-nav-icon" aria-hidden="true">
          <Icon />
        </span>
      )}
      <span className="yss-nav-label">
        <span className="yss-nav-text">{data.title}</span>
        {data.badge && <span className="yss-nav-badge">{data.badge}</span>}
        {data.highlight && <span className="yss-nav-dot" aria-hidden="true" />}
      </span>
    </span>
  );
};

const NavbarItem: FC<{ data: INavItem; showIcon?: boolean }> = ({ data, showIcon = false }) => {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() =>
    Boolean(data.children?.some(item => isItemActive(item, pathname)))
  );
  const isActive = isItemActive(data, pathname);
  const hasChildren = Boolean(data.children?.length);
  const className = `${isActive ? 'active' : ''}${data.highlight ? ' is-nav-highlight' : ''}`.trim();

  const content = (
    <>
      {renderNavTitle(data, showIcon)}
      {hasChildren && (
        <span className="yss-nav-chevron" aria-hidden="true">
          <IconChevron />
        </span>
      )}
    </>
  );

  const dropdown = hasChildren ? (
    <ul className="dumi-default-navbar-dropdown" data-collapsed={isCollapsed || undefined}>
      <NavbarContent data={data.children ?? []} />
    </ul>
  ) : null;

  return (
    <>
      {data.link ? (
        isExternalLink(data.link) ? (
          <a
            className={className}
            href={data.link}
            target="_blank"
            rel="noreferrer"
            aria-current={isActive ? 'page' : undefined}
          >
            {content}
          </a>
        ) : (
          <Link className={className} to={data.link} aria-current={isActive ? 'page' : undefined}>
            {content}
          </Link>
        )
      ) : (
        <button className={className} type="button" onClick={() => setIsCollapsed(v => !v)}>
          {content}
        </button>
      )}

      {hasChildren && (
        <button
          className="dumi-default-navbar-collapse-btn"
          type="button"
          aria-label={`${data.title} 子菜单`}
          onClick={event => {
            event.stopPropagation();
            setIsCollapsed(v => !v);
          }}
          data-collapsed={isCollapsed || undefined}
        >
          <IconChevron />
        </button>
      )}

      {dropdown}
    </>
  );
};

const NavbarContent: FC<{
  data: INavItem[];
  showIcon?: boolean;
  registerTarget?: (key: string, node: HTMLLIElement | null) => void;
}> = ({ data, showIcon = false, registerTarget }) => {
  return (
    <>
      {data.map(item => {
        const itemStyle = {
          '--yss-item-accent': resolveAccent(item.accent),
        } as CSSProperties;

        return (
          <li
            key={getItemKey(item)}
            data-accent={item.accent || undefined}
            ref={node => registerTarget?.(getItemKey(item), node)}
            style={itemStyle}
          >
            <NavbarItem data={item} showIcon={showIcon} />
          </li>
        );
      })}
    </>
  );
};

const MoreDropdown: FC<{
  items: INavItem[];
  activeItem?: INavItem;
  triggerRef: React.RefObject<HTMLButtonElement>;
}> = ({ items, activeItem, triggerRef }) => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('click', handleClickOutside, true);
    document.addEventListener('keydown', handleEsc, true);

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
      document.removeEventListener('keydown', handleEsc, true);
    };
  }, [open]);

  const triggerStyle = {
    '--yss-item-accent': resolveAccent(activeItem?.accent),
  } as CSSProperties;

  return (
    <li className="dumi-default-navbar-more" ref={ref} style={triggerStyle}>
      <button
        ref={triggerRef}
        className={`dumi-default-navbar-more-trigger${activeItem ? ' active' : ''}`}
        type="button"
        aria-expanded={open}
        onClick={event => {
          event.stopPropagation();
          setOpen(value => !value);
        }}
      >
        <span className="yss-nav-item-inner is-iconless">
          <span className="yss-nav-label">
            <span className="yss-nav-text">更多</span>
          </span>
        </span>
        <span className="yss-nav-chevron" aria-hidden="true">
          <IconChevron />
        </span>
      </button>

      {open && (
        <ul className="dumi-default-navbar-more-dropdown">
          {items.map(item => {
            const active = isItemActive(item, pathname);
            const itemStyle = {
              '--yss-item-accent': resolveAccent(item.accent),
            } as CSSProperties;

            return (
              <li key={getItemKey(item)} style={itemStyle}>
                {item.link && !isExternalLink(item.link) ? (
                  <Link className={active ? 'active' : ''} to={item.link} onClick={() => setOpen(false)}>
                    {renderNavTitle(item, true)}
                  </Link>
                ) : (
                  <a
                    className={active ? 'active' : ''}
                    href={item.link}
                    target={isExternalLink(item.link) ? '_blank' : undefined}
                    rel={isExternalLink(item.link) ? 'noreferrer' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {renderNavTitle(item, true)}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

const Navbar: FC = () => {
  const { pathname } = useLocation();
  const nav = useNavData() as INavItem[];
  const railRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const moreTriggerRef = useRef<HTMLButtonElement>(null);
  const indicatorSnapshotRef = useRef<{ left: number; width: number; visible: boolean } | null>(null);
  const glideTimerRef = useRef<number | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(-1);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false, accent: DEFAULT_ACCENT });
  const [glideState, setGlideState] = useState<{ active: boolean; direction: 'forward' | 'backward' }>({
    active: false,
    direction: 'forward',
  });

  const updateVisibleCount = useCallback(() => {
    if (typeof window === 'undefined') return;
    setVisibleCount(getVisibleCount(nav.length));
    setIsMobileViewport(window.innerWidth < BREAKPOINTS.MOBILE);
  }, [nav.length]);

  useEffect(() => {
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, [updateVisibleCount]);

  const showMore = visibleCount > 0 && visibleCount < nav.length;
  const visibleItems = showMore ? nav.slice(0, visibleCount) : nav;
  const overflowItems = showMore ? nav.slice(visibleCount) : [];
  const activeVisibleItem = visibleItems.find(item => isItemActive(item, pathname));
  const activeOverflowItem = overflowItems.find(item => isItemActive(item, pathname));

  const registerTarget = useCallback((key: string, node: HTMLLIElement | null) => {
    itemRefs.current[key] = node;
  }, []);

  /**
   * 记录指针在导航轨道内的位置，用于驱动玻璃材质的跟随高光。
   *
   * @param event 当前指针移动事件
   */
  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLUListElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    event.currentTarget.style.setProperty('--yss-nav-spot-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--yss-nav-spot-y', `${event.clientY - rect.top}px`);
    event.currentTarget.style.setProperty('--yss-nav-spot-opacity', '1');
  }, []);

  /**
   * 指针离开后收起跟随高光，避免 Header 静止时产生多余视觉噪声。
   *
   * @param event 当前指针离开事件
   */
  const handlePointerLeave = useCallback((event: React.PointerEvent<HTMLUListElement>) => {
    event.currentTarget.style.setProperty('--yss-nav-spot-opacity', '0');
  }, []);

  const triggerGlide = useCallback((nextIndicator: { left: number; width: number; visible: boolean }) => {
    const previous = indicatorSnapshotRef.current;
    indicatorSnapshotRef.current = nextIndicator;

    if (!previous?.visible || !nextIndicator.visible) return;

    const movedEnough =
      Math.abs(nextIndicator.left - previous.left) > 2 || Math.abs(nextIndicator.width - previous.width) > 2;

    if (!movedEnough) return;

    const direction = nextIndicator.left >= previous.left ? 'forward' : 'backward';
    setGlideState({ active: true, direction });

    if (glideTimerRef.current) {
      window.clearTimeout(glideTimerRef.current);
    }

    glideTimerRef.current = window.setTimeout(() => {
      setGlideState(state => ({ ...state, active: false }));
      glideTimerRef.current = null;
    }, 620);
  }, []);

  const updateIndicator = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const activeItem = activeVisibleItem || activeOverflowItem;
    let target: HTMLElement | null = null;

    if (activeVisibleItem) {
      target = itemRefs.current[getItemKey(activeVisibleItem)];
    } else if (activeOverflowItem) {
      target = moreTriggerRef.current;
    }

    if (!target) {
      indicatorSnapshotRef.current = { left: 0, width: 0, visible: false };
      setIndicator(prev => ({ ...prev, visible: false }));
      return;
    }

    const railRect = rail.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const nextIndicator = {
      left: targetRect.left - railRect.left,
      width: targetRect.width,
      visible: true,
      accent: resolveAccent(activeItem?.accent),
    };

    triggerGlide(nextIndicator);
    setIndicator(nextIndicator);
  }, [activeOverflowItem, activeVisibleItem, triggerGlide]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const raf = window.requestAnimationFrame(updateIndicator);
    const handleResize = () => window.requestAnimationFrame(updateIndicator);

    window.addEventListener('resize', handleResize);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, [pathname, visibleCount, updateIndicator]);

  useEffect(
    () => () => {
      if (glideTimerRef.current) {
        window.clearTimeout(glideTimerRef.current);
      }
    },
    []
  );

  const railStyle = useMemo(
    () =>
      ({
        '--yss-nav-active-left': `${indicator.left}px`,
        '--yss-nav-active-width': `${indicator.width}px`,
        '--yss-nav-active-opacity': indicator.visible ? 1 : 0,
        '--yss-nav-active-accent': indicator.accent,
      }) as CSSProperties,
    [indicator]
  );

  return (
    <ul
      className={`dumi-default-navbar${glideState.active ? ' is-gliding' : ''}`}
      data-glide-direction={glideState.direction}
      ref={railRef}
      style={railStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <NavbarContent data={visibleItems} registerTarget={registerTarget} showIcon={isMobileViewport} />
      {showMore && <MoreDropdown activeItem={activeOverflowItem} items={overflowItems} triggerRef={moreTriggerRef} />}
    </ul>
  );
};

export default Navbar;
