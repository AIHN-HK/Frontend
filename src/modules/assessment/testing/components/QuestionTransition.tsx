import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import gsap from 'gsap';
import styles from './QuestionTransition.module.css';

// The outgoing copy is inert presentation only; new answers are usable immediately.
export function QuestionTransition({ questionKey, children }: { questionKey: string | number; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null), stage = useRef<HTMLDivElement>(null);
  const snapshot = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const node = stage.current, host = root.current;
    if (!node || !host) return;
    const outgoing = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? null : snapshot.current;
    let played = false;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      if (played) return;
      played = true;
      if (outgoing) {
        outgoing.className = styles.outgoing!;
        outgoing.setAttribute('aria-hidden', 'true'); outgoing.inert = true;
        outgoing.querySelectorAll('input').forEach(input => { input.removeAttribute('name'); input.disabled = true; });
        outgoing.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
        outgoing.querySelectorAll('.holland-choice').forEach(element => element.classList.remove('holland-choice'));
        outgoing.querySelectorAll('[data-spotlight-card],[data-answer-card]').forEach(element => { element.removeAttribute('data-spotlight-card'); element.removeAttribute('data-answer-card'); });
        host.append(outgoing);
      }
      const timeline = gsap.timeline({ defaults: { ease: 'power2.out', duration: .3 }, onComplete: () => outgoing?.remove() });
      if (outgoing) timeline.to(outgoing, { x: -12, opacity: 0, duration: .18 }, 0);
      timeline.fromTo(node, { x: 12, opacity: .5 }, { x: 0, opacity: 1, clearProps: 'transform,opacity' }, outgoing ? .08 : 0);
      const answers = node.querySelectorAll('[data-answer-card]');
      if (answers.length) timeline.fromTo(answers, { y: 5 }, { y: 0, duration: .22, stagger: .035, clearProps: 'transform' }, .1);
      return () => outgoing?.remove();
    }, root);
    return () => { media.revert(); outgoing?.remove(); };
  }, [questionKey]);
  useLayoutEffect(() => {
    const copy = stage.current?.cloneNode(true) as HTMLElement | undefined;
    if (copy) {
      copy.removeAttribute('style');
      copy.querySelectorAll<HTMLElement>('[data-answer-card]').forEach(answer => { answer.style.removeProperty('transform'); });
      snapshot.current = copy;
    }
  });
  return <div ref={root} className={styles.root} data-question-transition=""><div ref={stage}>{children}</div></div>;
}
