import type { ReactNode } from 'react';
import styles from './CareerScreenFrame.module.css';

export function CareerScreenFrame({ children, sidebar, layout }: { children: ReactNode; sidebar?: ReactNode; layout?: 'assessment' }) {
  return <div className={layout === 'assessment' ? styles.assessment : sidebar ? styles.grid : styles.single}>
    <div className={styles.stage}>{children}</div>{sidebar}
  </div>;
}
