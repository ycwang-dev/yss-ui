import { FormattedMessage, Link, useLocation, useRouteMeta, useSidebarData, useSiteData } from 'dumi';
import React, { useEffect, useLayoutEffect, useMemo, useState, type FC } from 'react';
import './index.less';

/**
 * 贡献者信息接口
 */
interface Contributor {
  name: string;
  email: string;
  commits: number;
  avatar: string | null;
  url?: string | null;
}

/**
 * 贡献者数据映射：routePath => Contributor[]
 */
type ContributorsMap = Record<string, Contributor[]>;

/**
 * 贡献者 Tooltip 的视口定位信息
 */
interface ContributorTooltip {
  text: string;
  left: number;
  top: number;
}

/**
 * 内联 SVG 图标组件 - 左箭头
 */
const IconLeft: FC = () => (
  <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
    <path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 000 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z" />
  </svg>
);

/**
 * 预定义的头像背景色
 */
const AVATAR_COLORS = [
  '#1677ff',
  '#52c41a',
  '#faad14',
  '#eb2f96',
  '#722ed1',
  '#13c2c2',
  '#fa541c',
  '#2f54eb',
  '#a0d911',
  '#fa8c16',
];

/**
 * 根据用户名生成稳定的颜色索引
 */
const getColorByName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

/**
 * 获取用户名首字母（支持中文取第一个字）
 */
const getInitial = (name: string): string => {
  if (!name) return '?';
  const first = name.charAt(0);
  if (/[a-zA-Z]/.test(first)) return first.toUpperCase();
  return first;
};

/**
 * 根据头像元素计算 Tooltip 在视口中的固定定位。
 *
 * @param target 头像所在列表项元素
 * @returns Tooltip 视口定位
 */
const getTooltipPosition = (target: HTMLElement): Pick<ContributorTooltip, 'left' | 'top'> => {
  const rect = target.getBoundingClientRect();

  return {
    left: rect.left + rect.width / 2,
    top: rect.top - 10,
  };
};

/**
 * 自定义 ContentFooter 组件
 *
 * 功能：
 * 1. 展示文档贡献者头像列表 + Tooltip
 * 2. 展示最后更新时间（来自 dumi 内置 frontmatter.lastUpdated）
 * 3. 保留上一篇/下一篇导航
 */
const ContentFooter: FC = () => {
  const { pathname } = useLocation();
  const sidebar = useSidebarData();
  const { themeConfig } = useSiteData();
  const { frontmatter } = useRouteMeta();

  const [prev, setPrev] = useState<any>(undefined);
  const [next, setNext] = useState<any>(undefined);
  const [lastUpdated, setLastUpdated] = useState('');
  const [contributorsData, setContributorsData] = useState<ContributorsMap>({});
  const [contributorTooltip, setContributorTooltip] = useState<ContributorTooltip | null>(null);

  const showLastUpdated = (themeConfig as any).lastUpdated !== false && frontmatter.lastUpdated;

  // 加载 contributors.json（仅首次加载）
  useEffect(() => {
    fetch('/contributors.json')
      .then(res => res.json())
      .then((data: ContributorsMap) => setContributorsData(data))
      .catch(() => setContributorsData({}));
  }, []);

  // 获取当前页面的贡献者
  const contributors: Contributor[] = useMemo(() => {
    const normalizedPath = pathname.replace(/\/$/, '') || '/';
    return contributorsData[normalizedPath] || [];
  }, [pathname, contributorsData]);

  // 计算上一篇/下一篇
  useLayoutEffect(() => {
    if (sidebar) {
      const items = sidebar.reduce<any[]>((ret: any[], group: any) => ret.concat(group.children), []);
      const current = items.findIndex((item: any) => item.link === pathname);
      setPrev(items[current - 1]);
      setNext(items[current + 1]);
    }
  }, [pathname, sidebar]);

  // 格式化最后更新时间
  useLayoutEffect(() => {
    if (showLastUpdated) {
      setLastUpdated(
        new Intl.DateTimeFormat('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(frontmatter.lastUpdated)
      );
    }
  }, [showLastUpdated, frontmatter.lastUpdated]);

  useEffect(() => {
    if (!contributorTooltip || typeof document === 'undefined') return;

    const tooltipElement = document.createElement('div');
    tooltipElement.className = 'yss-contributor-tooltip';
    tooltipElement.textContent = contributorTooltip.text;
    tooltipElement.style.top = `${contributorTooltip.top}px`;
    tooltipElement.style.visibility = 'hidden';
    document.body.appendChild(tooltipElement);

    const halfWidth = tooltipElement.offsetWidth / 2;
    const minLeft = halfWidth + 8;
    const maxLeft = window.innerWidth - halfWidth - 8;
    const safeLeft =
      maxLeft >= minLeft ? Math.min(Math.max(contributorTooltip.left, minLeft), maxLeft) : window.innerWidth / 2;

    tooltipElement.style.left = `${safeLeft}px`;
    tooltipElement.style.visibility = 'visible';

    return () => {
      tooltipElement.remove();
    };
  }, [contributorTooltip]);

  /**
   * 显示贡献者 Tooltip，并使用 body 级浮层避免被内容区或左侧菜单裁剪。
   *
   * @param target 头像所在列表项元素
   * @param contributor 当前贡献者信息
   */
  const showContributorTooltip = (target: HTMLElement, contributor: Contributor): void => {
    const position = getTooltipPosition(target);

    setContributorTooltip({
      text: `文档贡献者：${contributor.name}`,
      ...position,
    });
  };

  /**
   * 隐藏贡献者 Tooltip。
   */
  const hideContributorTooltip = (): void => {
    setContributorTooltip(null);
  };

  return (
    <footer className="dumi-default-content-footer">
      {/* 贡献者 & 最后更新时间区域 */}
      <div className="yss-contributors-section">
        {/* 贡献者头像列表 */}
        {contributors.length > 0 && (
          <div className="yss-contributors">
            <ul className="yss-contributors-list">
              {contributors.map((contributor: Contributor) => (
                <li
                  key={contributor.email}
                  onMouseEnter={event => showContributorTooltip(event.currentTarget, contributor)}
                  onMouseLeave={hideContributorTooltip}
                  onFocus={event => showContributorTooltip(event.currentTarget, contributor)}
                  onBlur={hideContributorTooltip}
                  onClick={() => {
                    if (contributor.url) {
                      window.open(contributor.url, '_blank');
                    }
                  }}
                >
                  {contributor.avatar ? (
                    <img className="yss-contributor-avatar" src={contributor.avatar} alt={contributor.name} />
                  ) : (
                    <span
                      className="yss-contributor-avatar yss-contributor-avatar--letter"
                      style={{ backgroundColor: getColorByName(contributor.name) }}
                    >
                      {getInitial(contributor.name)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 最后更新时间 */}
        {showLastUpdated && (
          <div className="yss-last-updated">
            <span>最后更新：{lastUpdated}</span>
          </div>
        )}
      </div>

      {/* 上一篇 / 下一篇导航 */}
      <nav>
        {prev && (
          <Link to={prev.link} data-prev>
            <small>
              <IconLeft />
              <FormattedMessage id="content.footer.actions.previous" />
            </small>
            {prev.title}
          </Link>
        )}
        {next && (
          <Link to={next.link} data-next>
            <small>
              <FormattedMessage id="content.footer.actions.next" />
              <IconLeft />
            </small>
            {next.title}
          </Link>
        )}
      </nav>
    </footer>
  );
};

export default ContentFooter;
