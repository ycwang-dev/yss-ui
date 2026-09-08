import React from 'react';
import { HOME_STATS } from '../../constants';

/** 首页数据指标带：数字在进入视口时滚动计数。 */
export const StatsBand = () => (
  <section className="yss-extras-section yss-extras-stats" data-extras-section="stats" aria-label="YSS UI 数据一览">
    <dl className="yss-extras-stats__grid">
      {HOME_STATS.map(stat => (
        <div className="yss-extras-stat" data-reveal key={stat.key}>
          <dd>
            <strong data-counter-value={stat.value} data-counter-suffix={stat.suffix}>
              {stat.value}
              {stat.suffix}
            </strong>
          </dd>
          <dt>{stat.label}</dt>
          <small>{stat.detail}</small>
        </div>
      ))}
    </dl>
  </section>
);
