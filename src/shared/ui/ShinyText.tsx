// Inspired by React Bits ShinyText; a single CSS sweep without a frame loop.
// See REACT_BITS_EXPERIMENT.md for source and differences.
import type { ReactNode } from 'react';
import styles from './ShinyText.module.css';

export function ShinyText({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`${styles.shiny} ${className}`} data-shiny-text="">{children}</span>;
}
