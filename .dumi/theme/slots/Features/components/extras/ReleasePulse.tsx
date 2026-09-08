import { ReactComponent as ArrowRightIcon } from '@ant-design/icons-svg/inline-svg/outlined/arrow-right.svg';
import { Link } from 'dumi';
import React from 'react';
import { HOME_RELEASES } from '../../constants';

/** 首页版本动态：组件库、Skills 与 MCP 三条产品线的最新发布。 */
export const ReleasePulse = () => (
  <section
    className="yss-extras-section yss-extras-release"
    data-extras-section="release"
    aria-labelledby="yss-release-title"
  >
    <div className="yss-release-panel">
      <div className="yss-release-summary" data-reveal>
        <span className="yss-extras-head__eyebrow">RELEASE PULSE</span>
        <h2 id="yss-release-title">
          持续发布中
          <i aria-hidden="true" />
        </h2>
        <strong className="yss-release-version">{HOME_RELEASES[0]?.version || 'v1.0.0'}</strong>
        <p>组件库 · Skills · MCP 三线并进，索引与规范随组件库发版同步更新。</p>
        <Link className="yss-extras-link yss-release-all-link" to="/changelog">
          查看全部更新
          <ArrowRightIcon aria-hidden="true" />
        </Link>
      </div>

      <ol className="yss-release-list">
        {HOME_RELEASES.map(item => {
          return (
            <li className="yss-release-item" data-reveal data-tone={item.tone} key={item.key}>
              <header>
                <b>{item.pkg}</b>
                <span>{item.version}</span>
                <time dateTime={item.date}>{item.date}</time>
              </header>
              <p>{item.highlight}</p>
              <Link className="yss-extras-link yss-extras-link--quiet" to={item.link}>
                更新详情
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  </section>
);
