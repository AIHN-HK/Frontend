import { Link, Outlet, useLocation } from 'react-router';
import { paths } from '@/routes/paths';
import { PublicNavigation } from './components/PublicNavigation';
import './public.css';

export function PublicLayout() {
  const location = useLocation();
  return <div className="public-shell">
    <a className="skip-link" href="#main-content">Bỏ qua điều hướng</a>
    <PublicNavigation key={location.key} />
    <main id="main-content" className="public-content" tabIndex={-1}><Outlet /></main>
    <footer className="home-footer">
      <div className="home-footer-inner">
        <div className="home-footer-brand"><span className="brand-logo-icon" aria-hidden="true">AI</span><strong>AIHN Career Guidance Platform</strong></div>
        <p>© 2026 AIHN. Nền tảng định hướng nghề nghiệp thông minh cho học sinh &amp; sinh viên Việt Nam.</p>
        <Link to={paths.dashboard}>Vào Bàn làm việc →</Link>
      </div>
    </footer>
  </div>;
}
