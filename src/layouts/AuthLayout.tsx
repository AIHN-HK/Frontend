import { Link, Outlet } from 'react-router';
import { Brand } from '@/shared/ui/Brand';
import { Icon } from '@/shared/ui/Icon';
import { paths } from '@/routes/paths';

export function AuthLayout() {
  return <div className="auth-shell">
    <a className="skip-link" href="#main-content">Bỏ qua giới thiệu</a>
    <aside className="auth-introduction">
      <Link to={paths.home}><Brand /></Link>
      <div className="auth-message"><span className="auth-symbol"><Icon name="compass" /></span>
        <h1>Hiểu mình hơn.<br />Chọn hướng đi phù hợp.</h1>
        <p>Khám phá bản thân và từng bước xây dựng tương lai nghề nghiệp cùng AIHN.</p>
      </div>
      <small>Hệ thống Cố vấn Nghề nghiệp</small>
    </aside>
    <main id="main-content" className="auth-content" tabIndex={-1}><Outlet /></main>
  </div>;
}
