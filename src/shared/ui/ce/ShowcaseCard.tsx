import { useId } from 'react';
import type { ReactNode } from 'react';
import styles from './ShowcaseCard.module.css';

export function ShowcaseCard({ children, media, badge, className = '' }: { children: ReactNode; media?: ReactNode; badge?: ReactNode; className?: string }) {
  const gradient = useId();
  return <section className={`${styles.card} ${className}`} data-ce-enter="">
    <svg className={styles.waves} viewBox="0 0 720 300" fill="none" aria-hidden="true"><defs><linearGradient id={gradient}><stop stopColor="var(--ce-violet)" stopOpacity=".3"/><stop offset="1" stopColor="var(--ce-cyan)" stopOpacity=".04"/></linearGradient></defs><path d="M-40 180C140 80 320 260 560 120C680 50 760 160 800 200" stroke={`url(#${gradient})`} strokeWidth="2"/><path d="M-20 60C200 180 440 40 640 190C720 240 780 220 840 260" stroke={`url(#${gradient})`} strokeWidth="1.5"/><path d="M120 -20C280 200 480 280 720 80" stroke="var(--ce-c-border)"/><circle cx="620" cy="180" r="160" stroke="var(--ce-border-subtle)"/></svg>
    <div className={styles.content}>{children}</div>
    {media && <div className={styles.media}><div className={styles.frame} data-ce-photo-frame="">{media}{badge && <span className={styles.badge} data-ce-photo-badge="">{badge}</span>}</div></div>}
  </section>;
}
