import { ReactComponent as IconClose } from '@ant-design/icons-svg/inline-svg/outlined/close.svg';
import { ReactComponent as IconGitHub } from '@ant-design/icons-svg/inline-svg/outlined/github.svg';
import { ReactComponent as IconMenu } from '@ant-design/icons-svg/inline-svg/outlined/menu.svg';
import { useLocation, useRouteMeta, useSiteData } from 'dumi';
import ColorSwitch from 'dumi/theme/slots/ColorSwitch';
import Logo from 'dumi/theme/slots/Logo';
import Navbar from 'dumi/theme/slots/Navbar';
import SearchBar from 'dumi/theme/slots/SearchBar';
import React, { FC, useEffect, useState } from 'react';
import './index.less';

const GITHUB_REPO_URL = 'https://github.com/ycwang-dev/yss-ui';

const Header: FC = () => {
  const { frontmatter } = useRouteMeta();
  const { pathname } = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const { themeConfig } = useSiteData();

  useEffect(() => {
    const routeRoot = pathname.split('/').filter(Boolean)[0] || 'home';
    document.body.setAttribute('data-route-root', routeRoot);
    setShowMenu(false);

    return () => {
      document.body.removeAttribute('data-route-root');
    };
  }, [pathname]);

  return (
    <div
      className={`dumi-default-header yss-header${frontmatter.hero ? ' yss-header-home' : ''}`}
      data-mobile-active={showMenu || undefined}
      onClick={() => setShowMenu(false)}
    >
      <div className="dumi-default-header-content yss-header-content" onClick={ev => ev.stopPropagation()}>
        <section className="dumi-default-header-left yss-header-left">
          <Logo />
          <div className="yss-header-search-wrap">
            <SearchBar />
          </div>
        </section>

        <section className="dumi-default-header-right yss-header-right">
          <div className="yss-header-nav-wrap">
            <Navbar />
          </div>

          <div className="dumi-default-header-right-aside yss-header-utility-dock">
            {themeConfig.prefersColor.switch && <ColorSwitch />}
            <a
              className="yss-header-social-orb yss-header-social-orb-github"
              aria-label="GitHub"
              title="GitHub"
              target="_blank"
              href={GITHUB_REPO_URL}
              rel="noreferrer"
            >
              <span className="yss-header-social-orb-icon" aria-hidden="true">
                <IconGitHub focusable="false" />
              </span>
            </a>
          </div>
        </section>

        <button
          type="button"
          className="dumi-default-header-menu-btn yss-header-menu-btn"
          aria-label={showMenu ? '关闭导航菜单' : '打开导航菜单'}
          aria-expanded={showMenu}
          onClick={ev => {
            ev.stopPropagation();
            setShowMenu(v => !v);
          }}
        >
          {showMenu ? <IconClose /> : <IconMenu />}
        </button>
      </div>
    </div>
  );
};

export default Header;
