import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function useRoadmapMotion() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const contexts: gsap.Context[] = [], seen = new WeakSet<Element>();
      const reveal = (phase: Element) => {
        if (seen.has(phase)) return;
        seen.add(phase);
        contexts.push(gsap.context(() => {
          const node = phase.querySelector('[data-roadmap-node]'), path = phase.querySelector('[data-roadmap-path]');
          const timeline = gsap.timeline({ defaults: { duration: .35, ease: 'power2.out' } });
          if (node) timeline.from(node, { scale: .9, opacity: .5, clearProps: 'transform,opacity' }, 0);
          if (path) timeline.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .45 }, .05);
        }, host));
      };
      const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) { observer?.unobserve(entry.target); reveal(entry.target); } });
      }, { threshold: .08 });
      host.querySelectorAll('[data-phase-state]').forEach(phase => { if (observer) observer.observe(phase); else reveal(phase); });
      return () => { observer?.disconnect(); contexts.forEach(context => context.revert()); };
    }, root);
    return () => media.revert();
  }, []);
  return root;
}
