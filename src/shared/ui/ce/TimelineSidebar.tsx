import type { ReactNode } from 'react';
import styles from './TimelineSidebar.module.css';

type Step = { id:string; title:string; description:string; status:'pending'|'active'|'completed' };
export function TimelineSidebar({ steps, radar, radarTitle = 'Hồ sơ RIASEC của bạn' }: { steps: readonly Step[]; radar?: ReactNode; radarTitle?: string }) {
  return <aside className={styles.sidebar} aria-label="Tiến trình">
    <ol className={styles.track}>{steps.map(step => <li key={step.id} className={`${styles.step} ${styles[step.status]}`} aria-current={step.status === 'active' ? 'step' : undefined}>
      <span className={styles.node} data-ce-node="" aria-hidden="true">{step.status === 'completed' ? '✓' : step.status === 'active' ? '•' : ''}</span>
      <div><p className={styles.title}>{step.title}</p><p className={styles.description}>{step.description}</p></div>
    </li>)}</ol>
    {radar && <section className={styles.radar}><h2>{radarTitle}</h2>{radar}</section>}
  </aside>;
}
