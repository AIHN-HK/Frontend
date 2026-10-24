import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from '../pages/HomePage.module.css';

gsap.registerPlugin(ScrollTrigger);

export function useHomeMotion() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const page = root.current;
    if (!page) return;
    const header = page.querySelector<HTMLElement>('[data-home-header]');
    const sections = [...page.querySelectorAll<HTMLElement>('[data-home-surface]')];
    let frame = 0, active = true;
    const contrast = () => {
      frame = 0;
      if (!header) return;
      const point = Math.min(header.getBoundingClientRect().height, 70);
      const section = sections.find(element => { const rect=element.getBoundingClientRect(); return rect.top<=point && rect.bottom>point; });
      header.dataset.surface = section?.dataset.homeSurface ?? 'dark';
      header.dataset.compact = String(window.scrollY > 20);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(contrast); };
    window.addEventListener('scroll', schedule, {passive:true});
    window.addEventListener('resize', schedule);
    contrast();
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from(['hero-pill-badge','aihn-hero__title','aihn-hero__desc','aihn-hero__actions'].map(name=>`.${styles[name]}`), {y:30,opacity:0,duration:.8,stagger:.12,ease:'power3.out',clearProps:'transform,opacity'});
        gsap.from(`.${styles['journey-card']}`, {y:40,opacity:0,duration:1,stagger:.16,delay:.3,ease:'power3.out',clearProps:'transform,opacity'});
        for (const [section,items] of [['aihn-intro','intro-column'],['aihn-matches','editorial-career-card'],['aihn-trust','trust-card']]) {
          gsap.from(`.${styles[items!]}`, {y:30,opacity:0,duration:.7,stagger:.12,ease:'power2.out',clearProps:'transform,opacity',scrollTrigger:{trigger:`.${styles[section!]}`,start:'top 80%',once:true}});
        }
        gsap.from(`.${styles['riasec-bar-fill']}`, {scaleX:0,transformOrigin:'left',duration:1,stagger:.06,clearProps:'transform,transformOrigin',scrollTrigger:{trigger:`.${styles['aihn-riasec']}`,start:'top 80%',once:true}});
        gsap.to(`.${styles['roadmap-progress-fill']}`, {height:'calc(100% - 60px)',ease:'none',scrollTrigger:{trigger:`.${styles['vertical-roadmap-path']}`,start:'top 70%',end:'bottom 70%',scrub:true}});
        page.querySelectorAll(`.${styles['roadmap-milestone']}`).forEach(element => ScrollTrigger.create({trigger:element,start:'top 80%',toggleClass:{targets:element,className:styles.active!}}));
      });
    }, root);
    void document.fonts.ready.then(() => { if (active) { ScrollTrigger.refresh(); schedule(); } });
    return () => {
      active = false;
      window.removeEventListener('scroll',schedule);
      window.removeEventListener('resize',schedule);
      cancelAnimationFrame(frame);
      media.revert(); context.revert();
    };
  }, []);
  return root;
}
