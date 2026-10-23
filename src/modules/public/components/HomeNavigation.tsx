import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { paths } from '@/routes/paths';
import styles from '../pages/HomePage.module.css';

export function HomeNavigation() {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1025px)');
    const closeOnResize = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', closeOnResize);
    return () => desktop.removeEventListener('change', closeOnResize);
  }, []);
  const close = () => setOpen(false);
  return <header className={styles['aihn-header']} data-home-header="" onKeyDown={event => {
    if (event.key === 'Escape' && open) { close(); opener.current?.focus(); }
  }}>
    <div className={styles['aihn-nav-container']}>
      <Link to={paths.home} className={styles['aihn-nav-brand']} aria-label="AIHN trang chủ" onClick={close}>
        <span className={styles['nav-brand-mark']} aria-hidden="true">AI</span>
        <span><span className={styles['nav-brand-text']}>AIHN</span><span className={styles['nav-brand-sub']}>Career</span></span>
      </Link>
      <nav aria-label="Điều hướng chính" className={styles.desktopNavigation}>
        <ul className={styles['aihn-nav-links']}>
          <li><Link to={paths.assessment} className={styles['nav-link']}>Khám phá</Link></li>
          <li><Link to={paths.careers} className={styles['nav-link']}>Nghề nghiệp</Link></li>
          <li><a href="#how-it-works" className={styles['nav-link']}>Về AIHN</a></li>
        </ul>
      </nav>
      <div className={styles['aihn-nav-actions']}>
        <Link to={paths.login} className={styles['nav-link-login']} onClick={close}>Đăng nhập</Link>
        <Link to={paths.assessment} className={styles['btn-nav-cta']}>Bắt đầu khám phá</Link>
        <button ref={opener} type="button" className={styles.menuTrigger} aria-label={open?'Đóng menu':'Mở menu'} aria-expanded={open} aria-controls="home-mobile-navigation" onClick={()=>setOpen(value=>!value)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
    </div>
    <nav id="home-mobile-navigation" className={styles.mobileNavigation} aria-label="Điều hướng di động" hidden={!open} key={location.pathname}>
      <Link to={paths.home} onClick={close}>Trang chủ</Link>
      <Link to={paths.assessment} onClick={close}>Khám phá</Link>
      <Link to={paths.careers} onClick={close}>Nghề nghiệp</Link>
      <a href="#how-it-works" onClick={close}>Về AIHN</a>
    </nav>
  </header>;
}
