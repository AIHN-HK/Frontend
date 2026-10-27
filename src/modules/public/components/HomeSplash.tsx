import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from '../pages/HomePage.module.css';

gsap.registerPlugin(ScrollTrigger);

export function HomeSplash() {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = layer.current, opening = host?.parentElement;
    const hero = opening?.querySelector('section'), intro = hero?.nextElementSibling;
    if (!host || !opening || !hero || !intro) return;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add('(min-width: 1025px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        let active = true, visible = false, faded = false, loading = false, failed = false, generation = 0;
        let canvas: HTMLCanvasElement | undefined, dispose: (() => void) | undefined;
        host.dataset.splashState = 'idle';
        const stop = () => {
          generation++; loading = false;
          canvas?.removeEventListener('webglcontextlost', stop);
          dispose?.(); dispose = undefined;
          canvas?.remove(); canvas = undefined;
          host.dataset.splashState = 'idle';
        };
        const allowed = () => active && visible && !faded && !document.hidden;
        const sync = () => { if (!allowed()) stop(); };
        const load = async (event: PointerEvent) => {
          if (!allowed() || failed || loading || canvas || event.pointerType !== 'mouse') return;
          loading = true;
          const version = ++generation;
          host.dataset.splashState = 'loading';
          try {
            const { createSplashCursor } = await import('./splash-cursor/splash-cursor');
            if (!allowed() || version !== generation) return;
            canvas = document.createElement('canvas');
            canvas.setAttribute('aria-hidden', 'true');
            host.append(canvas);
            dispose = createSplashCursor(canvas, opening, event);
            if (dispose) canvas.addEventListener('webglcontextlost', stop, { once: true });
            host.dataset.splashState = dispose ? 'ready' : 'unavailable';
            if (!dispose) {
              failed = true;
              canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();
              canvas.remove(); canvas = undefined;
            }
          } catch {
            if (version !== generation) return;
            failed = true;
            dispose?.(); dispose = undefined;
            canvas?.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();
            canvas?.remove(); canvas = undefined;
            host.dataset.splashState = 'unavailable';
          } finally { if (version === generation) loading = false; }
        };
        const observer = new IntersectionObserver(entries => {
          visible = entries.some(entry => entry.isIntersecting);
          sync();
        });
        observer.observe(opening);
        const fade = gsap.fromTo(host, { opacity: 0.38 }, {
          opacity: 0, ease: 'none',
          scrollTrigger: {
            trigger: hero, start: 'top top', endTrigger: intro, end: 'bottom 65%', scrub: 0.7,
            invalidateOnRefresh: true,
            onUpdate: trigger => { faded = trigger.progress >= 0.99; sync(); },
          },
        });
        opening.addEventListener('pointermove', load, { passive: true });
        document.addEventListener('visibilitychange', sync);
        return () => {
          active = false; stop(); observer.disconnect(); fade.scrollTrigger?.kill(); fade.kill();
          opening.removeEventListener('pointermove', load);
          document.removeEventListener('visibilitychange', sync);
          host.dataset.splashState = 'static';
        };
      });
    }, opening);
    return () => { media.revert(); context.revert(); };
  }, []);
  return <div ref={layer} className={styles.splashLayer} aria-hidden="true" data-home-splash="" data-splash-state="static" />;
}
