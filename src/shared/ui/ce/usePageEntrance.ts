import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function usePageEntrance(key: string | number | undefined) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current || key === undefined) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const targets = root.current?.querySelectorAll('[data-ce-enter], .platform-card');
        if (targets?.length) gsap.from(targets, {opacity:0,y:16,duration:.5,stagger:.07,ease:'power2.out'});
      });
    },root);
    return () => ctx.revert();
  },[key]);
  return root;
}
