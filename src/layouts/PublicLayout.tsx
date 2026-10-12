import { Link, Outlet } from 'react-router';
import { Brand } from '@/shared/ui/Brand';
import { paths } from '@/routes/paths';

export function PublicLayout() {
  return <div className="public-shell">
    <a className="skip-link" href="#main-content">Bỏ qua điều hướng</a>
    <header className="public-header"><Link to={paths.home}><Brand /></Link><Link className="btn btn-secondary" to={paths.login}>Đăng nhập</Link></header>
    <main id="main-content" className="public-content" tabIndex={-1}><Outlet /></main>
    <footer className="public-footer"><span>AIHN Career · Định hướng tương lai</span>
      <nav aria-label="Bản xem trước giao diện"><Link to={paths.previewStudent}>Giao diện sinh viên</Link><Link to={paths.previewAdmin}>Giao diện quản trị</Link><Link to={paths.previewAuth}>Giao diện tài khoản</Link></nav>
    </footer>
  </div>;
}
