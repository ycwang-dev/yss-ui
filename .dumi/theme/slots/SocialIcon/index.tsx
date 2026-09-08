import { ReactComponent as IconGitHub } from '@ant-design/icons-svg/inline-svg/outlined/github.svg';
import { ReactComponent as IconGitlab } from '@ant-design/icons-svg/inline-svg/outlined/gitlab.svg';
import { ReactComponent as IconLinkedin } from '@ant-design/icons-svg/inline-svg/outlined/linkedin.svg';
import { ReactComponent as IconWeiBo } from '@ant-design/icons-svg/inline-svg/outlined/weibo.svg';
import { ReactComponent as IconX } from '@ant-design/icons-svg/inline-svg/outlined/x.svg';
import { ReactComponent as IconYuque } from '@ant-design/icons-svg/inline-svg/outlined/yuque.svg';
import { ReactComponent as IconZhihu } from '@ant-design/icons-svg/inline-svg/outlined/zhihu.svg';
import { useIntl } from 'dumi';
import React, { FC, useMemo } from 'react';

const PRESET_ICONS = {
  github: IconGitHub,
  gitlab: IconGitlab,
  linkedin: IconLinkedin,
  weibo: IconWeiBo,
  twitter: IconX,
  x: IconX,
  yuque: IconYuque,
  zhihu: IconZhihu,
} as const;

export type SocialIconProps = {
  icon: keyof typeof PRESET_ICONS | string;
  link: string;
};

const SocialIcon: FC<SocialIconProps> = ({ icon, link }) => {
  const intl = useIntl();
  const Icon = useMemo(() => PRESET_ICONS[icon as keyof typeof PRESET_ICONS] || IconGitHub, [icon]);
  const label = intl.formatMessage({ id: `header.social.${icon}`, defaultMessage: icon });

  return (
    <a
      className={`yss-header-social-orb yss-header-social-orb-${icon}`}
      aria-label={label}
      title={label}
      target="_blank"
      href={link}
      rel="noreferrer"
    >
      <Icon aria-hidden="true" focusable="false" />
    </a>
  );
};

export default SocialIcon;
