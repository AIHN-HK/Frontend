// Inspired by React Bits CountUp; implemented with the existing GSAP runtime.
// Source and differences are documented in REACT_BITS_EXPERIMENT.md.
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './CountUp.module.css';

type CountUpProps = {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
};

export function CountUp({ value, decimals = 0, suffix = '', className = '' }: CountUpProps) {
  const display = useRef<HTMLSpanElement>(null);
  const precision = Number.isFinite(decimals) ? Math.min(6, Math.max(0, Math.trunc(decimals))) : 0;
  const finalText = Number.isFinite(value) ? `${value.toFixed(precision)}${suffix}` : '—';

  useLayoutEffect(() => {
    const node = display.current;
    if (!node) return;
    node.textContent = finalText;
    if (!Number.isFinite(value) || value === 0) return;
    // matchMedia owns its GSAP context, including cleanup on preference changes.
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      let active = true, started = false;
      let tween: gsap.core.Tween | undefined;
      const start = () => {
        if (!active || started) return;
        started = true;
        const counter = { value: 0 };
        const render = () => { node.textContent = `${counter.value.toFixed(precision)}${suffix}`; };
        render();
        tween = gsap.to(counter, {
          value, duration: .85, ease: 'power2.out', onUpdate: render,
          onComplete: () => { node.textContent = finalText; },
        });
      };
      // Keep the real text until the number enters view; only animate once.
      const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { observer?.disconnect(); start(); }
      });
      if (observer) observer.observe(node); else start();
      // The tween starts in an observer callback, so own and kill it explicitly.
      return () => { active = false; observer?.disconnect(); tween?.kill(); node.textContent = finalText; };
    }, display);
    return () => { media.revert(); node.textContent = finalText; };
  }, [value, precision, suffix, finalText]);

  // Expose the final value once; intermediate frames are purely visual.
  return <span className={`${styles.count} ${className}`} data-count-up="" role="img" aria-label={finalText}>
    <span ref={display} aria-hidden="true">{finalText}</span>
  </span>;
}
