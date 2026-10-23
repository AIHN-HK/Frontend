import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { paths } from '@/routes/paths';
import { studentNavigation } from '../navigation';
import styles from './AppHeader.module.css';

export function AppHeader({ account }: { account?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const { key } = useLocation();
  useEffect(() => {
    const media = matchMedia('(min-width: 1025px)');
    const close = () => setOpen(false);
    media.addEventListener('change', close);
    return () => media.removeEventListener('change', close);
  }, []);
  const primaryPaths: readonly string[] = [paths.assessment, paths.recommendations, paths.careers, paths.advisor];
  const primary = studentNavigation.filter(item => primaryPaths.includes(item.path));
  return <header className={styles.header} onKeyDown={event => {
    if (event.key === 'Escape' && open) { setOpen(false); opener.current?.focus(); }
  }}>
    <div className={styles.container}>
      <Link to={paths.dashboard} className={styles.brand} aria-label="AIHN Career · Trang của tôi"><span aria-hidden="true" />AIHN Career</Link>
      <nav className={styles.primary} aria-label="Điều hướng AIHN">{primary.map(item => <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? styles.active : undefined}>{item.label}</NavLink>)}</nav>
      <div className={styles.actions}>
        {account}
        <button ref={opener} className={styles.toggle} type="button" aria-label={open ? 'Đóng menu phụ' : 'Mở menu phụ'} aria-expanded={open} aria-controls="career-navigation" onClick={() => setOpen(value => !value)}>☰</button>
      </div>
    </div>
    {open && <nav key={key} id="career-navigation" className={styles.menu} aria-label="Điều hướng bổ sung">{studentNavigation.map(item => <NavLink key={item.path} to={item.path} onClick={() => setOpen(false)}>{item.label}</NavLink>)}</nav>}
  </header>;
}
