import { useEffect, useRef } from 'react';
import styles from './AmbientParticles.module.css';

const PRESETS = {
  career:     { count: 80,  spread: 10, speed: 0.06, colors: ['#c4b5fd', '#93c5fd', '#e0d7ff'], opacity: 0.9, size: 135, glow: 0.2, twinkle: 0.15, hoverEffect: 'repel' as const, hoverRadius: 160, hoverFactor: 1.2, clickBurst: true },
  assessment: { count: 60,  spread: 9,  speed: 0.05, colors: ['#bda8f5', '#d6c7ff', '#93c5fd'], opacity: 0.8, size: 115, glow: 0.15, twinkle: 0.1, hoverEffect: 'repel' as const, hoverRadius: 150, hoverFactor: 1.0, clickBurst: true },
  result:     { count: 100, spread: 11, speed: 0.07, colors: ['#c4b5fd', '#e0d7ff', '#93c5fd'], opacity: 0.9, size: 140, glow: 0.2, twinkle: 0.2, hoverEffect: 'repel' as const, hoverRadius: 180, hoverFactor: 1.3, clickBurst: true },
  advisor:    { count: 50,  spread: 8,  speed: 0.04, colors: ['#bda8f5', '#d6c7ff', '#93c5fd'], opacity: 0.8, size: 115, glow: 0.15, twinkle: 0.1, hoverEffect: 'repel' as const, hoverRadius: 150, hoverFactor: 1.0, clickBurst: true },
} as const;

export type ParticlesPreset = keyof typeof PRESETS;

export function AmbientParticles({ preset }: { preset: ParticlesPreset }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = container.current;
    if (!host) return;
    const media = window.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)');
    let generation = 0;
    let canvas: HTMLCanvasElement | undefined;
    let dispose: (() => void) | undefined;
    const stop = () => {
      generation++;
      canvas?.removeEventListener('webglcontextlost', stop);
      dispose?.(); dispose = undefined;
      canvas?.remove(); canvas = undefined;
      host.dataset.particlesState = 'static';
    };
    const sync = async () => {
      stop();
      if (!media.matches) return;
      const version = generation;
      host.dataset.particlesState = 'loading';
      try {
        const { createParticlesEngine } = await import('./particles-engine');
        if (version !== generation) return;
        canvas = document.createElement('canvas');
        canvas.className = styles.canvas!;
        canvas.setAttribute('aria-hidden', 'true');
        host.append(canvas);
        dispose = createParticlesEngine(canvas, host, PRESETS[preset]);
        if (dispose) {
          canvas.addEventListener('webglcontextlost', stop, { once: true });
          host.dataset.particlesState = 'ready';
        } else {
          stop(); host.dataset.particlesState = 'unavailable';
        }
      } catch {
        if (version === generation) { stop(); host.dataset.particlesState = 'unavailable'; }
      }
    };
    void sync();
    media.addEventListener('change', sync);
    return () => { media.removeEventListener('change', sync); stop(); };
  }, [preset]);

  return (
    <div ref={container} className={styles.layer} aria-hidden="true" data-ambient-particles={preset} />
  );
}
