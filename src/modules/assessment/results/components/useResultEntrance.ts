import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Observe late analysis/snapshot sections too, without replaying already seen content.
export function useResultEntrance(key: string | number | undefined) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = root.current;
    if (!host || key === undefined) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const seen = new WeakSet<Element>(), observed = new WeakSet<Element>();
      const contexts: gsap.Context[] = [];
      const reveal = (element: Element) => {
        if (seen.has(element)) return;
        seen.add(element);
        contexts.push(gsap.context(() => {
          const items = element.querySelectorAll('[data-result-item]');
          const timeline = gsap.timeline({ defaults: { duration: .35, ease: 'power2.out', clearProps: 'transform,opacity' } });
          timeline.from(element, { opacity: .5, y: 12 });
          if (items.length) timeline.from(items, { opacity: .6, y: 6, stagger: .045, duration: .25 }, .1);
        }, host));
      };
      const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) { observer?.unobserve(entry.target); reveal(entry.target); } });
      }, { threshold: .08 });
      const collect = () => {
        host.querySelectorAll('[data-result-enter]').forEach(element => {
          if (observed.has(element)) return;
          observed.add(element);
          if (observer) observer.observe(element); else reveal(element);
        });
      };
      collect();
      // CountUp replaces text every frame: only new elements need discovery.
      const mutations = new MutationObserver(records => {
        if (records.some(record => Array.from(record.addedNodes).some(node => node.nodeType === Node.ELEMENT_NODE))) collect();
      });
      mutations.observe(host, { childList: true, subtree: true });
      return () => { observer?.disconnect(); mutations.disconnect(); contexts.forEach(context => context.revert()); };
    }, root);
    return () => media.revert();
  }, [key]);
  return root;
}
