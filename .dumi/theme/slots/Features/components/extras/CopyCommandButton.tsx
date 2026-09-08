import { ReactComponent as CheckIcon } from '@ant-design/icons-svg/inline-svg/outlined/check.svg';
import { ReactComponent as CopyIcon } from '@ant-design/icons-svg/inline-svg/outlined/copy.svg';
import React, { useEffect, useRef, useState } from 'react';

/** 复制命令按钮属性。 */
interface CopyCommandButtonProps {
  command: string;
}

/** 把命令写入剪贴板，不支持 Clipboard API 时降级为 textarea 复制。 */
const writeClipboard = async (text: string): Promise<void> => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
};

/** 快速接入命令的一键复制按钮，复制成功后短暂显示确认态。 */
export const CopyCommandButton = ({ command }: CopyCommandButtonProps) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number>();

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const handleCopy = async () => {
    try {
      await writeClipboard(command);
      setCopied(true);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // 剪贴板不可用时保持静默，用户仍可手动选中命令复制
    }
  };

  return (
    <button
      type="button"
      className={`yss-qs-copy${copied ? ' is-copied' : ''}`}
      aria-label={copied ? '已复制' : `复制命令 ${command}`}
      onClick={handleCopy}
    >
      {copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
      <span>{copied ? '已复制' : '复制'}</span>
    </button>
  );
};
