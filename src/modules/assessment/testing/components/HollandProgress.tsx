import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from '../pages/HollandTestPage.module.css';

export function HollandProgress({ answered, total }: { answered: number; total: number }) {
  const fill = useRef<HTMLSpanElement>(null), previous = useRef(0);
  const ratio = total > 0 ? answered / total : 0;
  useLayoutEffect(() => {
    const node = fill.current;
    if (!node) return;
    const from = previous.current; previous.current = ratio;
    // Previous context cleanup can restore the earlier render's inline transform.
    // Establish the real current value before GSAP captures its revert state.
    node.style.transform = `scaleX(${ratio})`;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(node, { scaleX: from }, { scaleX: ratio, duration: .35, ease: 'power2.out' });
      return () => { node.style.transform = `scaleX(${ratio})`; };
    }, fill);
    return () => { media.revert(); node.style.transform = `scaleX(${ratio})`; };
  }, [ratio]);
  return <div className={styles.progress} role="progressbar" aria-label="Số câu đã trả lời" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered}><span ref={fill} style={{ transform: `scaleX(${ratio})` }} /></div>;
}
