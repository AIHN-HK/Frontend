import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { paths } from '@/routes/paths';
import { Icon } from '@/shared/ui/Icon';

const links = [
  [paths.home, 'Trang chủ'],
  [paths.careers, 'Khám phá nghề nghiệp'],
  [paths.assessment, 'Trắc nghiệm Holland'],
  [paths.roadmap, 'Lộ trình phát triển'],
  [paths.advisor, 'Cố vấn AI'],
] as const;

export function PublicNavigation() {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1281px)');
    const resize = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', resize);
    return () => desktop.removeEventListener('change', resize);
  }, []);

  const close = () => { setOpen(false); opener.current?.focus(); };
  const navigationLinks = links.map(([to, label]) => <Link key={to} to={to}
    className={`home-nav-item ${pathname === to ? 'active' : ''}`}
    aria-current={pathname === to ? 'page' : undefined}
    onClick={() => setOpen(false)}>{label}</Link>);

  return <header className="home-header-wrap" onKeyDown={event => {
    if (open && event.key === 'Escape') { event.preventDefault(); close(); }
  }}>
    <div className="home-navbar">
      <Link to={paths.home} className="brand-logo-group" aria-label="AIHN trang chủ" onClick={() => setOpen(false)}>
        <span className="brand-logo-icon" aria-hidden="true">AI</span><span className="brand-logo-text">AIHN</span>
      </Link>
      <nav className="home-nav-links" aria-label="Điều hướng chính">{navigationLinks}</nav>
      <div className="home-header-tools">
        <Link to={paths.careers} className="home-search-pill" aria-label="Tìm nghề nghiệp"><Icon name="search" /><span>Tìm nghề nghiệp...</span></Link>
        <Link to={paths.login} className="btn-pill-login" onClick={() => setOpen(false)}>Đăng nhập</Link>
        <Link to={paths.signup} className="btn-pill-cta" onClick={() => setOpen(false)}>Bắt đầu ngay →</Link>
        <button ref={opener} type="button" className="home-menu-trigger" aria-label={open ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={open} aria-controls="home-mobile-navigation" onClick={() => setOpen(value => !value)}><Icon name="menu" /></button>
      </div>
    </div>
    <nav id="home-mobile-navigation" className="home-mobile-navigation" aria-label="Điều hướng di động" hidden={!open}>
      {navigationLinks}
      <Link className="home-nav-item" to={paths.signup} onClick={() => setOpen(false)}>Tạo tài khoản →</Link>
    </nav>
  </header>;
}
