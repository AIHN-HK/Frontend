import type { KeyboardEvent, ReactNode } from 'react';
import styles from '../pages/HollandTestPage.module.css';

export function HollandKeyboard({ children, enabled }: { children: ReactNode; enabled: boolean }) {
  const shortcut = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!enabled) return;
    if (event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if ((event.target as HTMLElement).closest('textarea,select,input:not([type=radio])')) return;
    const root = event.currentTarget;
    if (!event.altKey && (event.key === '1' || event.key === '2')) {
      const radio = root.querySelectorAll<HTMLInputElement>('.holland-choice input')[Number(event.key) - 1];
      if (radio && !radio.disabled && !radio.closest('fieldset')?.disabled) { event.preventDefault(); radio.focus(); radio.click(); }
    }
    if (event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      const buttons = root.querySelectorAll<HTMLButtonElement>('nav[aria-label="Chuyển câu hỏi"] button');
      const button = buttons[event.key === 'ArrowLeft' ? 0 : 1];
      // A navigation shortcut never submits the last question.
      if (button && !button.disabled && (event.key === 'ArrowLeft' || button.getAttribute('aria-label') === 'Tiếp theo' || button.textContent === 'Tiếp theo')) { event.preventDefault(); button.click(); }
    }
  };
  return <div onKeyDown={shortcut}>{children}{enabled && <p className={styles.shortcuts}><span>Phím tắt</span> <kbd>1</kbd> Có <kbd>2</kbd> Không <span>·</span> <kbd>Alt + ← / →</kbd> chuyển câu</p>}</div>;
}
