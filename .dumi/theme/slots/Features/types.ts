import type React from 'react';

/** 首页能力卡片的布局层级。 */
export type FeatureCardVariant = 'anchor' | 'support' | 'workflow';

/** 首页能力卡片的预览类型。 */
export type FeatureCardPreview = 'component-table' | 'hook-code' | 'utility-actions' | 'skill-flow';

/** 首页能力卡片配置。 */
export interface FeatureCard {
  key?: string;
  title?: string;
  description?: string;
  emoji?: string;
  link?: string;
  tone?: string;
  count?: string;
  eyebrow?: string;
  accent?: string;
  ctaText?: string;
  capabilities?: string[];
  scenes?: string[];
  tags?: string[];
  variant?: FeatureCardVariant;
  preview?: FeatureCardPreview;
  iconSrc?: string;
}

/** 主能力卡片的指针交互属性。 */
export interface AnchorPointerHandlers {
  onPointerMove: React.PointerEventHandler<HTMLElement>;
  onPointerLeave: React.PointerEventHandler<HTMLElement>;
}

/** 首页版本动态卡片数据结构。 */
export interface HomeReleaseItem {
  key: string;
  pkg: string;
  version: string;
  date: string;
  highlight: string;
  link: string;
  tone: string;
}
