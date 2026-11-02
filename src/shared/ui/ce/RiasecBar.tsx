import { useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import gsap from 'gsap';
import type { RadarCode } from './radar.model';
import styles from './RiasecBar.module.css';

export function RiasecBar({ code, label, percentage, valueLabel, valueContent }: { code: RadarCode; label: string; percentage: number|null; valueLabel: string; valueContent?: ReactNode }) {
  const fill = useRef<HTMLSpanElement>(null);
  const valid = percentage !== null && Number.isFinite(percentage) && percentage >= 0 && percentage <= 100;
  const target = valid ? percentage : null;
  useEffect(() => {
    if (!fill.current || target === null) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(fill.current, { scaleX:0 }, { scaleX:1, duration:.45, ease:'power2.out', clearProps:'transform' });
      });
    }, fill);
    return () => ctx.revert();
  }, [target]);
  const color = { '--ce-trait':`var(--ce-${code.toLowerCase()})` } as CSSProperties;
  const barStyle: CSSProperties & { '--tw':string } = { '--tw':`${target ?? 0}%`, width:`${target ?? 0}%` };
  return <div className={styles.row} style={color}>
    <div className={styles.label}><span className={styles.badge}>{code}</span><span>{label}</span></div>
    <div className={styles.track} aria-hidden="true">{target !== null && <span ref={fill} className={styles.fill} data-ce-score-fill="" style={barStyle} />}</div>
    <span className={styles.value}>{valueContent ?? valueLabel}</span>
  </div>;
}
