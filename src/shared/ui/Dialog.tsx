import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { Button } from './Button';

export type DialogProps = {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  children: ReactNode;
  className?: string;
};

export function Dialog({ open, onOpenChange, title, children, className = '' }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const overflow = document.body.style.overflow;
    const opener = document.activeElement;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, [open]);
  return <dialog ref={ref} className={`dialog ${className}`} aria-labelledby={titleId}
    onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const dialog = event.currentTarget;
      const focusable = [...dialog.querySelectorAll<HTMLElement>('a[href],button,input,select,textarea,[tabindex]')]
        .filter(node => node.tabIndex >= 0 && !node.matches(':disabled') && node.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable.at(-1);
      const current = document.activeElement;
      if (event.shiftKey && (current === first || !dialog.contains(current))) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault(); first?.focus();
      }
    }}
    onCancel={event => { event.preventDefault(); onOpenChange(false); }}
    onClick={event => { if (event.target === event.currentTarget) {
      const box = event.currentTarget.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onOpenChange(false);
    } }}>
    <header className="dialog-header">
      <h2 id={titleId}>{title}</h2>
      <Button variant="ghost" aria-label="Đóng" onClick={() => onOpenChange(false)}>×</Button>
    </header>
    <div className="dialog-content">{children}</div>
  </dialog>;
}
