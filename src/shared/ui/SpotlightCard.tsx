// Adapted from React Bits SpotlightCard. Copyright (c) 2026 David Haz.
// See public/licenses/react-bits.txt and REACT_BITS_EXPERIMENT.md for source and changes.
import type { HTMLAttributes, PointerEvent, ReactNode } from 'react';
import styles from './SpotlightCard.module.css';

function moveLight(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  card.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`);
  card.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`);
}

type SpotlightCardProps = HTMLAttributes<HTMLElement> & {
  as?: 'article' | 'section' | 'div';
  children: ReactNode;
};

export function SpotlightCard({ as: Tag = 'article', children, className = '', onPointerMove, onPointerLeave, ...props }: SpotlightCardProps) {
  return <Tag {...props} className={`${className} ${styles.card}`} data-spotlight-card="" onPointerMove={event => {
    moveLight(event);
    onPointerMove?.(event);
  }} onPointerLeave={event => {
    event.currentTarget.style.removeProperty('--spotlight-x');
    event.currentTarget.style.removeProperty('--spotlight-y');
    onPointerLeave?.(event);
  }}>
    <span className={styles.light} aria-hidden="true" />
    {children}
  </Tag>;
}
