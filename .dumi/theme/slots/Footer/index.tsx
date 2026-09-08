import { ReactComponent as ArrowRightIcon } from '@ant-design/icons-svg/inline-svg/outlined/arrow-right.svg';
import { ReactComponent as BookIcon } from '@ant-design/icons-svg/inline-svg/outlined/book.svg';
import { ReactComponent as ClusterIcon } from '@ant-design/icons-svg/inline-svg/outlined/cluster.svg';
import { ReactComponent as ExportIcon } from '@ant-design/icons-svg/inline-svg/outlined/export.svg';
import { ReactComponent as LinkIcon } from '@ant-design/icons-svg/inline-svg/outlined/link.svg';
import { Link, useLocation } from 'dumi';
import React, { type FC, useRef } from 'react';
import BackToTop from './BackToTop';
import {
  CURRENT_YEAR,
  FOOTER_DOCS_HEADINGS,
  FOOTER_MARQUEE_ITEMS,
  FOOTER_SECTIONS,
  type FooterLink,
  type FooterSection,
} from './constant';
import { useFooterMotion } from './hooks/useFooterMotion';
import './index.less';

const sectionIconMap = {
  guides: BookIcon,
  dependencies: ClusterIcon,
  network: LinkIcon,
} as const;

/** 根据链接类型渲染内部路由或外部链接。 */
const FooterLinkItem = ({ link }: { link: FooterLink }) => {
  const content = (
    <>
      <span>
        <strong>{link.label}</strong>
        {link.description ? <small>{link.description}</small> : null}
      </span>
      {link.external ? <ExportIcon aria-hidden="true" /> : <ArrowRightIcon aria-hidden="true" />}
    </>
  );

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return <Link to={link.href}>{content}</Link>;
};

/** 渲染 Footer 单个资源分组。 */
const FooterResourceSection = ({ section }: { section: FooterSection }) => {
  const Icon = sectionIconMap[section.key];

  return (
    <section className={`yss-footer-directory__section yss-footer-directory__section--${section.key}`}>
      <header>
        <span className="yss-footer-directory__icon">
          <Icon aria-hidden="true" />
        </span>
        <span>
          <small>{section.eyebrow}</small>
          <h3>{section.title}</h3>
        </span>
      </header>
      <p>{section.description}</p>
      <nav aria-label={section.title}>
        {section.links.map(link => (
          <FooterLinkItem key={link.label} link={link} />
        ))}
      </nav>
    </section>
  );
};

/** 首页专属：按产品线着色的能力关键词无限滚动带。 */
const FooterMarquee = () => (
  <div className="yss-footer-marquee" aria-hidden="true">
    <div className="yss-footer-marquee__track">
      {[0, 1].map(duplicate => (
        <ul key={duplicate}>
          {FOOTER_MARQUEE_ITEMS.map(item => (
            <li className={`is-${item.tone}`} key={item.label}>
              <i />
              {item.label}
            </li>
          ))}
        </ul>
      ))}
    </div>
  </div>
);

/** YSS UI 全局资源目录 Footer。 */
const Footer: FC = () => {
  const { pathname } = useLocation();
  const scopeRef = useRef<HTMLElement>(null);
  const isHomepage = pathname === '/';
  const isGuideDocs = pathname === '/guide' || pathname.startsWith('/guide/');
  const docsHeading = FOOTER_DOCS_HEADINGS[isGuideDocs ? 'guide' : 'default'];
  useFooterMotion(scopeRef, pathname);

  return (
    <div ref={scopeRef} className={`dumi-default-footer${isHomepage ? '' : ' dumi-default-footer--docs'}`}>
      {isHomepage ? <FooterMarquee /> : null}
      <div className="yss-footer-directory">
        <header className="yss-footer-directory__heading">
          <span>Resources &amp; Support</span>
          {isHomepage ? (
            <>
              <h2>
                把下一个页面，交给 <em>YSS&nbsp;UI</em>
              </h2>
              <p>组件、Hooks、Utils 与 AI Skills 的全部入口，都在这里。</p>
            </>
          ) : (
            <>
              <h2>{docsHeading.title}</h2>
              <p>{docsHeading.description}</p>
            </>
          )}
        </header>
        <div className="yss-footer-directory__grid">
          {FOOTER_SECTIONS.map(section => (
            <FooterResourceSection key={section.key} section={section} />
          ))}
        </div>
        {isHomepage ? (
          <div className="yss-footer-bottom yss-footer-bottom--home">
            <span>Copyright © {CURRENT_YEAR} YSS UI. All Rights Reserved.</span>
            <span className="yss-footer-bottom__stack">Vue 3 · Ant Design Vue · VXE-Table · GSAP</span>
          </div>
        ) : (
          <div className="yss-footer-bottom">Copyright © {CURRENT_YEAR} YSS UI. All Rights Reserved.</div>
        )}
      </div>
      <BackToTop />
    </div>
  );
};

export default Footer;
