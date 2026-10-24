import { useEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useHomeStoryMotion(root: RefObject<HTMLElement | null>, select: (index:number)=>void) {
  const track = useRef<ScrollTrigger | null>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add('(min-width: 1025px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)', () => {
        const trigger = ScrollTrigger.create({
          trigger: root.current,
          start: 'top 70px', end: '+=3000', pin: true, pinSpacing: true, anticipatePin: 1,
          onUpdate: self => select(Math.min(5, Math.floor(self.progress * 6))),
        });
        track.current = trigger;
        return () => { track.current = null; };
      });
    }, root);
    return () => { media.revert(); context.revert(); track.current = null; };
  }, [root, select]);
  return (index:number) => {
    const trigger = track.current;
    if (trigger) window.scrollTo({top:trigger.start + ((index+.3)/6)*(trigger.end-trigger.start),behavior:'smooth'});
  };
}
