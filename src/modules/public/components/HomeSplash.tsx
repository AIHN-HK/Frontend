import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from '../pages/HomePage.module.css';

gsap.registerPlugin(ScrollTrigger);

export function HomeSplash() {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = layer.current, scope = host?.parentElement;
    const hero = scope?.querySelector<HTMLElement>('[data-home-surface]');
    if (!host || !scope || !hero) return;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add('(min-width: 1025px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        let active = true, visible = false, loading = false, failed = false, generation = 0;
        let canvas: HTMLCanvasElement | undefined, dispose: (() => void) | undefined;
        let section: HTMLElement | null = hero, strength = -1;
        const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
        const opacity = gsap.quickTo(host, 'opacity', { duration: 0.35, ease: 'power2.out' });
        gsap.set(host, { opacity: 0.38 });
        host.dataset.splashState = 'idle';
        const stop = () => {
          generation++; loading = false;
          canvas?.removeEventListener('webglcontextlost', stop);
          dispose?.(); dispose = undefined;
          canvas?.remove(); canvas = undefined;
          host.dataset.splashState = 'idle';
        };
        const allowed = () => active && visible && section !== null && !document.hidden;
        const sync = () => { if (!allowed()) stop(); };
        const selectSurface = (target: Element | null) => {
          const candidate = target?.closest<HTMLElement>('[data-home-surface]');
          section = candidate && scope.contains(candidate) ? candidate : null;
          const light = section?.dataset.homeSurface === 'light';
          host.dataset.splashSurface = light ? 'light' : 'dark';
          let next = section ? light ? 0.24 : 0.38 : 0;
          if (section === hero) {
            const rect = hero.getBoundingClientRect();
            next *= 1 - 0.5 * Math.min(1, Math.max(0, -rect.top) / Math.max(1, rect.height));
          }
          if (next !== strength) { strength = next; opacity(next); }
          if (canvas && section) {
            const area = section.getBoundingClientRect(), frame = canvas.getBoundingClientRect();
            canvas.style.clipPath = `inset(${Math.max(0, area.top - frame.top)}px 0 ${Math.max(0, frame.bottom - area.bottom)}px 0)`;
          }
          sync();
        };
        const load = async (event: PointerEvent) => {
          if (event.pointerType !== 'mouse') return;
          pointer.x = event.clientX; pointer.y = event.clientY;
          selectSurface(event.target instanceof Element ? event.target : null);
          if (!allowed() || failed || loading || canvas) return;
          loading = true;
          const version = ++generation;
          host.dataset.splashState = 'loading';
          try {
            const { createSplashCursor } = await import('./splash-cursor/splash-cursor');
            if (!allowed() || version !== generation) return;
            canvas = document.createElement('canvas');
            canvas.setAttribute('aria-hidden', 'true');
            host.append(canvas);
            dispose = createSplashCursor(canvas, scope, event);
            if (dispose) canvas.addEventListener('webglcontextlost', stop, { once: true });
            host.dataset.splashState = dispose ? 'ready' : 'unavailable';
            if (!dispose) {
              failed = true;
              canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();
              canvas.remove(); canvas = undefined;
            }
            selectSurface(document.elementFromPoint(pointer.x, pointer.y));
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
        observer.observe(scope);
        const scroll = ScrollTrigger.create({
          trigger: scope, start: 'top bottom', end: 'bottom top', invalidateOnRefresh: true,
          onUpdate: () => selectSurface(document.elementFromPoint(pointer.x, pointer.y)),
          onRefresh: () => selectSurface(document.elementFromPoint(pointer.x, pointer.y)),
        });
        const leave = () => { section = null; opacity(0); strength = 0; sync(); };
        scope.addEventListener('pointermove', load, { passive: true });
        scope.addEventListener('pointerleave', leave);
        document.addEventListener('visibilitychange', sync);
        return () => {
          active = false; stop(); observer.disconnect(); scroll.kill(); opacity.tween.kill();
          scope.removeEventListener('pointermove', load);
          scope.removeEventListener('pointerleave', leave);
          document.removeEventListener('visibilitychange', sync);
          host.dataset.splashState = 'static';
        };
      });
    }, scope);
    return () => { media.revert(); context.revert(); };
  }, []);
  return <div ref={layer} className={styles.splashLayer} aria-hidden="true" data-home-splash="" data-splash-state="static" />;
}
