import { Outlet } from 'react-router';
import { CareerThemeBoundary } from './components/CareerThemeBoundary';
import styles from './AuthLayout.module.css';

export function AuthLayout() {
  return <CareerThemeBoundary><div className={styles.stage}>
    <a className="skip-link" href="#main-content">Bỏ qua giới thiệu</a>
    <svg className={styles.waves} viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M-100 650C200 200 650 850 1500 250"/><path d="M-100 350C350 900 900 100 1600 600"/><path d="M100 -100C700 250 750 800 1400 1000"/></svg>
    <main id="main-content" className={styles.card} tabIndex={-1}><Outlet /></main>
  </div></CareerThemeBoundary>;
}
