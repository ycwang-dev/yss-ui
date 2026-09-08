import React, { useEffect, type ReactNode } from 'react';

export interface MaskProps {
  visible: boolean;
  onMaskClick?: () => void;
  onClose?: () => void;
  children?: ReactNode;
}

export const Mask: React.FC<MaskProps> = props => {
  useEffect(() => {
    if (props.visible) {
      document.body.style.overflow = 'hidden';
    } else if (document.body.style.overflow) {
      document.body.style.overflow = '';
      props.onClose?.();
    }
  }, [props.visible, props.onClose]);

  return props.visible ? (
    <div className="dumi-default-search-modal">
      <div className="dumi-default-search-modal-mask" onClick={props.onMaskClick} />
      <div className="dumi-default-search-modal-content">{props.children}</div>
    </div>
  ) : null;
};
