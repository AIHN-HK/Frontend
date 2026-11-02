import { useEffect, useRef } from 'react';
import type { AnimationItem } from 'lottie-web';
import { lottieAssets } from './assets';
import type { LottieIllustrationKind } from './assets';
import styles from './LottieIllustration.module.css';

export function LottieIllustration({ kind, size = 120, animate = true }: {
  kind: LottieIllustrationKind; size?: number; animate?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null), canvas = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = root.current, target = canvas.current;
    if (!host || !target) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let cleanSession: (() => void) | undefined;
    const startSession = () => {
      let active = true, visible = false, started = false, loaded = false, finished = false;
      let animation: AnimationItem | undefined;
      const abort = new AbortController();
      const sync = () => {
        if (!active || !loaded || !animation) return;
        if (visible && !document.hidden && !finished) {
          animation.play(); host.dataset.lottieStatus = 'playing';
        } else {
          animation.pause(); host.dataset.lottieStatus = finished ? 'complete' : 'paused';
        }
      };
      const fail = () => {
        if (!active) return;
        loaded = false; animation?.destroy(); animation = undefined;
        host.dataset.lottieStatus = 'error';
      };
      const load = async () => {
        if (started || !active) return;
        started = true; host.dataset.lottieStatus = 'loading';
        try {
          const [{ default: player }, data] = await Promise.all([
            import('lottie-web/build/player/lottie_light'),
            fetch(`/animations/lottie/${kind}.json`, { signal: abort.signal }).then(response => {
              if (!response.ok) throw new Error('Animation unavailable');
              return response.json() as Promise<unknown>;
            }),
          ]);
          if (!active) return;
          animation = player.loadAnimation({ container: target, renderer: 'svg', loop: lottieAssets[kind].loop,
            autoplay: false, animationData: data, rendererSettings: { preserveAspectRatio: 'xMidYMid meet' } });
          const ready = () => { if (active) { loaded = true; animation?.setSubframe(false); sync(); } };
          animation.addEventListener('DOMLoaded', ready);
          animation.addEventListener('data_failed', fail);
          animation.addEventListener('error', fail);
          animation.addEventListener('complete', () => { if (active) { finished = true; sync(); } });
          if (animation.isLoaded) ready();
        } catch { if (!abort.signal.aborted) fail(); }
      };
      const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        if (visible) void load();
        sync();
      });
      if (observer) observer.observe(host); else { visible = true; void load(); }
      document.addEventListener('visibilitychange', sync);
      return () => {
        active = false; abort.abort(); observer?.disconnect();
        document.removeEventListener('visibilitychange', sync);
        animation?.destroy(); target.replaceChildren();
      };
    };
    const update = () => {
      cleanSession?.(); cleanSession = undefined;
      host.dataset.lottieStatus = 'static';
      if (animate && !preference.matches) cleanSession = startSession();
    };
    preference.addEventListener('change', update); update();
    return () => { preference.removeEventListener('change', update); cleanSession?.(); };
  }, [kind, animate]);

  return <div ref={root} className={styles.illustration} style={{ width: size }} aria-hidden="true"
    data-lottie-kind={kind} data-lottie-status="static">
    <img className={styles.poster} src={`/animations/lottie/${kind}.svg`} width={size} height={size} alt="" loading="lazy" />
    <div ref={canvas} className={styles.player} />
  </div>;
}
