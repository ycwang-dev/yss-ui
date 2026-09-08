import { Link, useLocale, useSiteData } from 'dumi';
import React, { type FC } from 'react';
import './index.less';

type ThemeConfigWithLogo = {
  logo?: string | false;
  logoDark?: string;
  name?: string;
};

/**
 * 自定义 Logo Slot
 * 覆盖 dumi 默认 Logo 组件，支持更大的 Logo 图片和品牌文字排版
 */
const Logo: FC = () => {
  const { themeConfig } = useSiteData();
  const locale = useLocale();
  const { logo, logoDark, name } = themeConfig as ThemeConfigWithLogo;
  const logoAlt = name || 'YSS UI';

  return (
    <Link className="dumi-default-logo yss-custom-logo" to={'base' in locale ? locale.base : '/'}>
      {logo !== false && (
        <span className="yss-custom-logo-mark" aria-hidden="true">
          <img className="yss-custom-logo-img yss-custom-logo-img-light" src={logo as string} alt={logoAlt} />
          <img
            className="yss-custom-logo-img yss-custom-logo-img-dark"
            src={logoDark || (logo as string)}
            alt={logoAlt}
          />
        </span>
      )}
      <span className="yss-custom-logo-text">
        <span className="yss-custom-logo-title">
          <span className="yss-custom-logo-word">DATA</span>
          <span className="yss-custom-logo-chip">UI</span>
        </span>
        <span className="yss-custom-logo-caption">Design System</span>
      </span>
    </Link>
  );
};

export default Logo;
