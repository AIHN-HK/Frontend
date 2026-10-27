import { useState } from 'react';
import type { ReactNode } from 'react';
import styles from './CareerFitReason.module.css';

export function CareerFitReason({ children }: { children: ReactNode }) {
  const [pinned, setPinned] = useState(false), [hovered, setHovered] = useState(false);
  return <details className={styles.reason} open={pinned || hovered} onPointerEnter={event => {
    if (event.pointerType === 'mouse' && window.matchMedia('(hover:hover) and (pointer:fine)').matches) setHovered(true);
  }} onPointerLeave={() => setHovered(false)}>
    <summary onClick={event => { event.preventDefault(); setPinned(!pinned); setHovered(false); }}>Vì sao phù hợp <span aria-hidden="true">↗</span></summary>
    <div className={styles.content}>{children}</div>
  </details>;
}
