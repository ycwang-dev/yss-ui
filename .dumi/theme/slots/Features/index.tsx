import { useRouteMeta } from 'dumi';
import React, { useRef } from 'react';
import { HomeExtras } from './components/extras';
import { FallbackWorkbench } from './components/FallbackWorkbench';
import { ProductShowcaseStage } from './components/showcase';
import { useProductShowcaseMotion } from './hooks/useProductShowcaseMotion';
import type { FeatureCard } from './types';
import './index.less';

/** YSS UI 首页中部产品能力工作台与补充区块。 */
export default function Features() {
  const { frontmatter } = useRouteMeta();
  const featureCards = ((frontmatter.featureCards || []) as FeatureCard[]).slice(0, 4);
  const scopeRef = useRef<HTMLElement>(null);
  const { activeIndex, selectChapter } = useProductShowcaseMotion({
    scopeRef,
    chapterCount: featureCards.length,
  });

  if (!featureCards.length) return null;

  return (
    <>
      <section ref={scopeRef} className="dumi-default-features yss-feature-stage" aria-label="YSS UI 产品能力">
        <ProductShowcaseStage cards={featureCards} activeIndex={activeIndex} onSelect={selectChapter} />
        <FallbackWorkbench cards={featureCards} />
      </section>
      <HomeExtras />
    </>
  );
}
