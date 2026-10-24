import type { ReactNode } from 'react';
import styles from './CareerScreenFrame.module.css';

export function CareerScreenFrame({ children, sidebar }: { children: ReactNode; sidebar?: ReactNode }) {
  return <div className={sidebar ? styles.grid : styles.single}>
    <div className={styles.stage}>{children}</div>{sidebar}
  </div>;
}
