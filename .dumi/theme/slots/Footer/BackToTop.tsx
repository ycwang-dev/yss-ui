import React, { useEffect, useState } from 'react';
import './BackToTop.less';

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 当页面向下滚动超过 400px 时显示按钮
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // 初始化时主动检查一次
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      className={`yss-back-to-top ${visible ? 'yss-back-to-top-visible' : ''}`}
      onClick={scrollToTop}
      title="返回顶部"
    >
      <div className="yss-btt-icon-wrapper">
        <svg className="yss-btt-svgIcon yss-btt-svgIcon-main" viewBox="0 0 384 512" aria-hidden="true">
          <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
        </svg>
        <svg className="yss-btt-svgIcon yss-btt-svgIcon-hover" viewBox="0 0 384 512" aria-hidden="true">
          <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
        </svg>
      </div>
    </button>
  );
};

export default BackToTop;
