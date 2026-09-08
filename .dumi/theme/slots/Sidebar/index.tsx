import { history, NavLink, useLocation, useRouteMeta, useSidebarData } from 'dumi';
import Toc from 'dumi/theme/slots/Toc';
import React, { type CSSProperties, type FC, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import './index.less';

const SIDEBAR_ACCENT = '#4f7cff';
const SIDEBAR_MENU_LINK_SELECTOR = ':scope > dl > dd > a';
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * 规范化路径，避免尾随斜杠、查询参数导致左侧菜单匹配失败。
 *
 * @param path 待处理路径
 * @returns 可用于比较的路径
 */
const normalizeSidebarPath = (path: string): string => {
  const [pathname = '/'] = path.split(/[?#]/);
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

  return normalized || '/';
};

/**
 * 获取左侧一级菜单链接集合，排除 Toc 内部锚点，避免高亮测量取错元素。
 *
 * @param shell 左侧菜单滚动容器
 * @returns 一级菜单链接集合
 */
const getSidebarMenuLinks = (shell: HTMLDivElement): HTMLAnchorElement[] => {
  return Array.from(shell.querySelectorAll<HTMLAnchorElement>(SIDEBAR_MENU_LINK_SELECTOR));
};

/**
 * 读取菜单链接对应的路由路径。
 *
 * @param link 菜单链接
 * @returns 链接路径
 */
const getSidebarLinkPath = (link: HTMLAnchorElement): string => {
  return link.dataset.yssSidebarLink ?? link.getAttribute('href') ?? '';
};

/**
 * 根据当前路径和备选链接查找左侧菜单应该高亮的链接。
 *
 * @param shell 左侧菜单滚动容器
 * @param pathname 当前路由路径
 * @param preferredLink 用户刚刚交互的目标链接
 * @returns 应该高亮的菜单链接
 */
const resolveSidebarActiveLink = (
  shell: HTMLDivElement,
  pathname?: string,
  preferredLink?: HTMLAnchorElement | null
): HTMLAnchorElement | null => {
  const menuLinks = getSidebarMenuLinks(shell);

  if (preferredLink && menuLinks.includes(preferredLink)) {
    return preferredLink;
  }

  if (pathname) {
    const normalizedPathname = normalizeSidebarPath(pathname);
    const pathnameLink = menuLinks.find(link => normalizeSidebarPath(getSidebarLinkPath(link)) === normalizedPathname);

    if (pathnameLink) {
      return pathnameLink;
    }
  }

  const pendingLink = menuLinks.find(link => link.hasAttribute('data-yss-sidebar-pending'));

  if (pendingLink) {
    return pendingLink;
  }

  return menuLinks.find(link => link.classList.contains('active')) ?? null;
};

/**
 * 移动左侧菜单高亮滑块到指定链接位置。
 *
 * @param shell 左侧菜单滚动容器
 * @param link 目标菜单链接
 * @param pathname 当前路由路径
 */
const updateSidebarGlider = (
  shell: HTMLDivElement | null,
  link?: HTMLAnchorElement | null,
  pathname?: string
): void => {
  if (!shell) return;

  const activeLink = resolveSidebarActiveLink(shell, pathname, link);

  if (!activeLink) {
    shell.style.setProperty('--yss-sidebar-glider-opacity', '0');
    return;
  }

  const shellRect = shell.getBoundingClientRect();
  const activeRect = activeLink.getBoundingClientRect();

  shell.style.setProperty('--yss-sidebar-glider-opacity', '1');
  shell.style.setProperty('--yss-sidebar-glider-top', `${activeRect.top - shellRect.top + shell.scrollTop}px`);
  shell.style.setProperty('--yss-sidebar-glider-height', `${activeRect.height}px`);
};

/**
 * 直接在 DOM 层设置左侧选中态，让反馈早于右侧路由内容渲染。
 *
 * @param shell 左侧菜单滚动容器
 * @param activeLink 当前点击的菜单链接
 */
const activateSidebarLinkImmediately = (shell: HTMLDivElement | null, activeLink: HTMLAnchorElement): void => {
  if (!shell) return;

  getSidebarMenuLinks(shell).forEach(link => {
    if (link === activeLink) return;

    link.classList.remove('active');
    link.removeAttribute('data-yss-sidebar-pending');
  });

  activeLink.classList.add('active');
  activeLink.setAttribute('data-yss-sidebar-pending', 'true');
  updateSidebarGlider(shell, activeLink);
};

const splitTitle = (title: string) => {
  const hasChinese = /[\u4e00-\u9fa5]/.test(title);

  if (hasChinese) {
    const match = title.match(/^([a-zA-Z0-9-.\s]+?)\s+([\u4e00-\u9fa5].*)$/);
    if (match) {
      return (
        <span className="sidebar-item-title">
          <span className="title-en">{match[1]}</span>
          <span className="title-zh">{match[2]}</span>
        </span>
      );
    }
  }

  if (/^[a-zA-Z0-9-.\s]+$/.test(title)) {
    return (
      <span className="sidebar-item-title">
        <span className="title-en">{title}</span>
      </span>
    );
  }

  // 纯中文菜单没有副标题，中文本身就是主标题，需使用主标题视觉层级
  return (
    <span className="sidebar-item-title">
      <span className="title-zh title-zh--primary">{title}</span>
    </span>
  );
};

const Sidebar: FC = () => {
  const { pathname } = useLocation();
  const meta = useRouteMeta();
  const sidebar = useSidebarData();
  const shellRef = useRef<HTMLDivElement>(null);
  const navPaintFrameRef = useRef<number | null>(null);
  const navCommitFrameRef = useRef<number | null>(null);
  const shellStyle = {
    '--yss-sidebar-accent': SIDEBAR_ACCENT,
  } as CSSProperties;

  useIsomorphicLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    let syncFrame: number | null = null;

    const updateGlider = () => {
      updateSidebarGlider(shell, null, pathname);
    };

    updateGlider();
    shell.querySelectorAll<HTMLAnchorElement>('a[data-yss-sidebar-pending]').forEach(link => {
      if (normalizeSidebarPath(getSidebarLinkPath(link)) === normalizeSidebarPath(pathname)) {
        link.removeAttribute('data-yss-sidebar-pending');
      }
    });
    syncFrame = window.requestAnimationFrame(updateGlider);
    shell.addEventListener('scroll', updateGlider, { passive: true });
    window.addEventListener('resize', updateGlider);

    return () => {
      if (syncFrame) {
        window.cancelAnimationFrame(syncFrame);
      }

      shell.removeEventListener('scroll', updateGlider);
      window.removeEventListener('resize', updateGlider);
    };
  }, [pathname, sidebar]);

  useEffect(() => {
    return () => {
      if (navPaintFrameRef.current) {
        window.cancelAnimationFrame(navPaintFrameRef.current);
      }

      if (navCommitFrameRef.current) {
        window.cancelAnimationFrame(navCommitFrameRef.current);
      }
    };
  }, []);

  /**
   * 指针按下时直接更新 DOM 高亮，不等待 React 路由状态变更。
   *
   * @param event 菜单链接指针事件
   */
  const handleNavPointerDown = useCallback((event: React.PointerEvent<HTMLAnchorElement>) => {
    if (event.button !== 0) return;
    activateSidebarLinkImmediately(shellRef.current, event.currentTarget);
  }, []);

  /**
   * 点击菜单时先让左侧高亮绘制出来，再延后启动右侧页面路由渲染。
   *
   * @param event 菜单链接点击事件
   * @param link 目标路由
   */
  const handleNavClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    if (normalizeSidebarPath(pathname) === normalizeSidebarPath(link)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    activateSidebarLinkImmediately(shellRef.current, event.currentTarget);

    if (navPaintFrameRef.current) {
      window.cancelAnimationFrame(navPaintFrameRef.current);
    }

    if (navCommitFrameRef.current) {
      window.cancelAnimationFrame(navCommitFrameRef.current);
    }

    navPaintFrameRef.current = window.requestAnimationFrame(() => {
      navPaintFrameRef.current = null;

      navCommitFrameRef.current = window.requestAnimationFrame(() => {
        navCommitFrameRef.current = null;
        history.push(link);
      });
    });
  }, []);

  if (!sidebar) return null;

  return (
    <div className="dumi-default-sidebar">
      <div className="yss-sidebar-shell" ref={shellRef} style={shellStyle}>
        {sidebar.map((item, i) => (
          <dl className="dumi-default-sidebar-group" key={String(i)}>
            {item.title && <dt>{item.title}</dt>}
            {item.children.map(child => (
              <dd key={child.link}>
                <NavLink
                  to={child.link}
                  title={child.title}
                  data-yss-sidebar-link={child.link}
                  end
                  onPointerDownCapture={handleNavPointerDown}
                  onClick={(event: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(event, child.link)}
                >
                  {splitTitle(child.title)}
                  {(child as any).frontmatter?.badge && (
                    <span className="sidebar-badge">{(child as any).frontmatter.badge}</span>
                  )}
                </NavLink>
                {child.link === pathname && !pathname.startsWith('/skills') && meta.frontmatter.toc === 'menu' && (
                  <Toc />
                )}
              </dd>
            ))}
          </dl>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
