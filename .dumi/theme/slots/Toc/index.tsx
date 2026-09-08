import { history, Link, useLocation, useRouteMeta, useSiteData, useTabMeta } from 'dumi';
import React, { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './index.less';

type TocItem = {
  id: string;
  title: string;
  depth: number;
};

type ResolvedHeading = {
  index: number;
  top: number;
};

type HashTargetLock = {
  id: string;
  index: number;
};

type ProgressOptions = {
  preferHash?: boolean;
};

const HASH_SCROLL_HANDLED_DURATION = 1600;

const noop = (): void => undefined;

const noopUpdate = (_options?: ProgressOptions): void => undefined;

/**
 * 安全解析当前 hash，避免中文锚点或异常编码导致运行时报错。
 */
const getHashId = (hash: string): string => {
  try {
    return decodeURIComponent(hash).slice(1);
  } catch {
    return hash.slice(1);
  }
};

/**
 * 按 id 查找标题元素，兼容包含特殊字符的锚点 id。
 */
const getHeadingElement = (id: string): HTMLElement | null => {
  const heading = document.getElementById(id);

  if (heading instanceof HTMLElement) {
    return heading;
  }

  if (!window.CSS?.escape) {
    return null;
  }

  return document.querySelector<HTMLElement>(`#${window.CSS.escape(id)}`);
};

/**
 * 标记当前 hash 滚动已由右侧目录处理，避免 dumi DocLayout 再执行一次 animated-scroll-to。
 */
const markHashScrollHandled = (): void => {
  (window as any).__YSS_TOC_HANDLED_HASH_SCROLL_UNTIL__ = Date.now() + HASH_SCROLL_HANDLED_DURATION;
};

const Toc: FC = () => {
  const { pathname, search, hash } = useLocation();
  const meta = useRouteMeta();
  const tabMeta = useTabMeta();
  const { loading } = useSiteData();
  const resolvedHeadingsRef = useRef<ResolvedHeading[]>([]);
  const headerHeightRef = useRef(0);
  const ignoreScrollSpyUntilRef = useRef(0);
  const hashTargetLockRef = useRef<HashTargetLock | null>(null);
  const refreshHeadingOffsetsRef = useRef<() => void>(noop);
  const updateProgressRef = useRef<(options?: ProgressOptions) => void>(noopUpdate);
  const copyTimerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const memoToc = useMemo(() => {
    const toc = (tabMeta?.toc || meta.toc || []) as TocItem[];

    return toc.filter(({ depth }) => depth > 1 && depth < 4);
  }, [meta, tabMeta]);

  /**
   * 锁定当前 hash 对应的目录项，避免点击后的平滑滚动或 Demo 异步挂载抢占 active。
   */
  const lockHashTarget = useCallback((id: string, index: number) => {
    hashTargetLockRef.current = { id, index };
    ignoreScrollSpyUntilRef.current = Number.POSITIVE_INFINITY;
  }, []);

  /**
   * 用户主动滚动或切换页面时解除 hash 锁定，恢复滚动位置驱动的目录高亮。
   */
  const unlockHashTarget = useCallback(() => {
    hashTargetLockRef.current = null;
    ignoreScrollSpyUntilRef.current = 0;
  }, []);

  /**
   * 判断当前锁定项是否仍与地址栏 hash 一致。
   */
  const getLockedHashIndex = useCallback(() => {
    const lockedTarget = hashTargetLockRef.current;

    if (!lockedTarget || lockedTarget.id !== getHashId(window.location.hash)) {
      return -1;
    }

    return lockedTarget.index;
  }, []);

  /**
   * 按固定头部偏移滚动到指定标题。
   */
  const scrollToHeading = useCallback((id: string, behavior: ScrollBehavior = 'smooth') => {
    const heading = getHeadingElement(id);

    if (!heading) {
      return false;
    }

    const header = document.querySelector<HTMLElement>('.dumi-default-header');
    const headerHeight = header ? header.clientHeight : headerHeightRef.current;
    const targetTop = Math.max(0, heading.getBoundingClientRect().top + window.scrollY - headerHeight - 12);

    window.scrollTo({ top: targetTop, behavior });

    return true;
  }, []);

  useEffect(() => {
    let updateFrame = 0;
    let refreshFrame = 0;
    let resizeObserver: ResizeObserver | null = null;

    /**
     * 批量刷新标题位置，只在 resize / 内容尺寸变化 / 锚点点击时执行。
     */
    const refreshHeadingOffsets = () => {
      const header = document.querySelector<HTMLElement>('.dumi-default-header');
      const nextHeaderHeight = header ? header.clientHeight : 0;
      const nextResolvedHeadings = memoToc.flatMap((item, index) => {
        const heading = getHeadingElement(item.id);

        if (!heading) {
          return [];
        }

        return [
          {
            index,
            top: heading.getBoundingClientRect().top + window.scrollY,
          },
        ];
      });

      headerHeightRef.current = nextHeaderHeight;
      resolvedHeadingsRef.current = nextResolvedHeadings;
    };

    /**
     * 根据 URL hash 获取当前目录索引。
     */
    const findHashIndex = () => {
      const currentId = getHashId(window.location.hash);

      if (!currentId) {
        return -1;
      }

      return memoToc.findIndex(item => item.id === currentId);
    };

    /**
     * 用二分查找当前滚动位置对应的标题，避免滚动时逐个测量 DOM。
     */
    const findActiveIndex = (targetTop: number) => {
      const headings = resolvedHeadingsRef.current;

      if (!headings.length) {
        return 0;
      }

      let low = 0;
      let high = headings.length - 1;
      let match = headings[0].index;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);

        if (headings[mid].top <= targetTop) {
          match = headings[mid].index;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      return match;
    };

    /**
     * 更新阅读进度和激活目录项。
     */
    const updateProgress = (options?: ProgressOptions) => {
      const scrollRoot = document.documentElement;
      const scrollable = scrollRoot.scrollHeight - window.innerHeight;
      const nextProgress = scrollable <= 0 ? 0 : Math.round((window.scrollY / scrollable) * 100);
      const hashIndex = findHashIndex();
      const lockedHashIndex = getLockedHashIndex();
      const shouldPreferHash =
        hashIndex >= 0 && (lockedHashIndex >= 0 || options?.preferHash || Date.now() < ignoreScrollSpyUntilRef.current);
      const nextIndex =
        lockedHashIndex >= 0
          ? lockedHashIndex
          : shouldPreferHash
            ? hashIndex
            : findActiveIndex(window.scrollY + headerHeightRef.current + 12);

      setProgress(prev => (prev === nextProgress ? prev : Math.max(0, Math.min(100, nextProgress))));
      setActiveIndex(prev => (prev === nextIndex ? prev : nextIndex));
      updateFrame = 0;
    };

    /**
     * 把滚动更新收敛到每帧一次。
     */
    const scheduleUpdate = () => {
      if (updateFrame) return;
      updateFrame = window.requestAnimationFrame(() => updateProgress());
    };

    /**
     * 把布局测量收敛到每帧一次。
     */
    const scheduleRefresh = () => {
      if (refreshFrame) return;
      refreshFrame = window.requestAnimationFrame(() => {
        refreshFrame = 0;
        refreshHeadingOffsets();
        const lockedHashIndex = getLockedHashIndex();

        if (lockedHashIndex >= 0) {
          const lockedTarget = hashTargetLockRef.current;

          if (lockedTarget) {
            scrollToHeading(lockedTarget.id, 'auto');
          }

          updateProgress({ preferHash: true });
          return;
        }

        updateProgress();
      });
    };

    refreshHeadingOffsetsRef.current = refreshHeadingOffsets;
    updateProgressRef.current = updateProgress;

    if (!loading) {
      scheduleRefresh();
    }

    const content = document.querySelector<HTMLElement>('.dumi-default-doc-layout .dumi-default-content');

    if (content && typeof window.ResizeObserver !== 'undefined') {
      resizeObserver = new window.ResizeObserver(scheduleRefresh);
      resizeObserver.observe(content);
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleRefresh);

    return () => {
      window.cancelAnimationFrame(updateFrame);
      window.cancelAnimationFrame(refreshFrame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleRefresh);
      resizeObserver?.disconnect();
    };
  }, [pathname, search, loading, memoToc, getLockedHashIndex, scrollToHeading]);

  useEffect(() => {
    setMobileOpen(false);
    unlockHashTarget();
  }, [pathname, unlockHashTarget]);

  useEffect(() => {
    const currentId = getHashId(hash);

    if (!currentId) {
      unlockHashTarget();
      return;
    }

    const nextIndex = memoToc.findIndex(item => item.id === currentId);

    if (nextIndex >= 0) {
      lockHashTarget(currentId, nextIndex);
      setActiveIndex(nextIndex);
      window.requestAnimationFrame(() => {
        refreshHeadingOffsetsRef.current();
        updateProgressRef.current({ preferHash: true });
      });
    }
  }, [hash, memoToc, lockHashTarget, unlockHashTarget]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const scrollKeys = new Set(['ArrowDown', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp', ' ']);

    /**
     * 用户主动滚动后，目录高亮应重新交给滚动监听计算。
     */
    const cancelLockByUserScroll = () => {
      unlockHashTarget();
    };

    /**
     * 键盘滚动同样视为用户主动接管页面位置。
     */
    const cancelLockByKeyboard = (event: KeyboardEvent) => {
      if (scrollKeys.has(event.key)) {
        unlockHashTarget();
      }
    };

    /**
     * 文档区域点击通常意味着用户开始阅读或操作内容，可解除点击锚点时的锁定。
     */
    const cancelLockByPointer = (event: PointerEvent) => {
      const target = event.target;

      if (target instanceof Element && target.closest('.yss-toc-console')) {
        return;
      }

      unlockHashTarget();
    };

    window.addEventListener('wheel', cancelLockByUserScroll, { passive: true });
    window.addEventListener('touchstart', cancelLockByUserScroll, { passive: true });
    window.addEventListener('keydown', cancelLockByKeyboard);
    window.addEventListener('pointerdown', cancelLockByPointer, true);

    return () => {
      window.removeEventListener('wheel', cancelLockByUserScroll);
      window.removeEventListener('touchstart', cancelLockByUserScroll);
      window.removeEventListener('keydown', cancelLockByKeyboard);
      window.removeEventListener('pointerdown', cancelLockByPointer, true);
    };
  }, [unlockHashTarget]);

  /**
   * 复制当前页面链接。
   */
  const copyPageLink = async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement('textarea');
      input.value = url;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }

    setCopied(true);
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopied(false), 1400);
  };

  /**
   * 处理目录点击，避免 dumi 默认 hash 滚动和自定义滚动重复执行。
   */
  const handleTocClick = (event: React.MouseEvent<HTMLAnchorElement>, item: TocItem, index: number) => {
    const encodedId = encodeURIComponent(item.id);
    const nextUrl = `${pathname}${search}#${encodedId}`;
    const currentId = getHashId(hash);

    event.preventDefault();
    event.stopPropagation();

    setMobileOpen(false);
    lockHashTarget(item.id, index);
    setActiveIndex(index);
    markHashScrollHandled();

    if (currentId !== item.id) {
      history.push(nextUrl);
    }

    refreshHeadingOffsetsRef.current();
    scrollToHeading(item.id);
    updateProgressRef.current({ preferHash: true });
  };

  if (!memoToc.length) return null;

  const activeItem = memoToc[activeIndex] || memoToc[0];

  return (
    <nav className="yss-toc-console" aria-label="页面目录">
      <div className="yss-toc-console__panel">
        <div className="yss-toc-console__head">
          <div className="yss-toc-console__title-block">
            <span className="yss-toc-console__eyebrow">PAGE CONSOLE</span>
            <strong className="yss-toc-console__current" title={activeItem?.title}>
              {activeItem?.title || '当前页面'}
            </strong>
          </div>
          <button className="yss-toc-console__copy" type="button" onClick={copyPageLink} title="复制当前页面链接">
            {copied ? '已复制' : '复制链接'}
          </button>
        </div>

        <div className="yss-toc-console__progress" aria-label={`浏览进度 ${progress}%`}>
          <span className="yss-toc-console__progress-label">浏览 {progress}%</span>
          <span className="yss-toc-console__progress-track">
            <span className="yss-toc-console__progress-bar" style={{ width: `${progress}%` }} />
          </span>
        </div>

        <button
          className="yss-toc-console__mobile-toggle"
          type="button"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(open => !open)}
        >
          本页目录
        </button>

        <ul className="dumi-default-toc yss-toc-console__list" data-mobile-open={mobileOpen || undefined}>
          {memoToc.map((item, index) => {
            const link = `${search}#${encodeURIComponent(item.id)}`;
            const isActive = activeIndex === index;

            return (
              <li key={item.id} data-depth={item.depth}>
                <Link
                  to={link}
                  onClick={(event: React.MouseEvent<HTMLAnchorElement>) => handleTocClick(event, item, index)}
                  title={item.title}
                  className={isActive ? 'active' : undefined}
                >
                  <span className="yss-toc-console__link-text">{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Toc;
