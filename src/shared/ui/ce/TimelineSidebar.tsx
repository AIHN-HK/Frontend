import type { ReactNode } from 'react';
import styles from './TimelineSidebar.module.css';

type Step = { id:string; title:string; description:string; status:'pending'|'active'|'completed' };
export function TimelineSidebar({ steps, radar, radarTitle = 'Hồ sơ RIASEC của bạn', compact = false, title }: { steps: readonly Step[]; radar?: ReactNode; radarTitle?: string; compact?: boolean; title?: string }) {
  return <aside className={`${styles.sidebar} ${compact ? styles.compact : ''}`} aria-label="Tiến trình">
    {title && <h2 className={styles.heading}>{title}</h2>}
    <ol className={styles.track}>{steps.map(step => <li key={step.id} className={`${styles.step} ${styles[step.status]}`} aria-current={step.status === 'active' ? 'step' : undefined}>
      <span className={styles.node} data-ce-node="" aria-hidden="true">{step.status === 'completed' ? '✓' : compact ? steps.indexOf(step) + 1 : step.status === 'active' ? '•' : ''}</span>
      <div><p className={styles.title}>{step.title}</p><p className={styles.description}>{step.description}</p></div>
    </li>)}</ol>
    {radar && <section className={styles.radar}><h2>{radarTitle}</h2>{radar}</section>}
  </aside>;
}
