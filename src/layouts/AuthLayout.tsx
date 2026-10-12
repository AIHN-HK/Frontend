import { Link, Outlet } from 'react-router';
import { paths } from '@/routes/paths';
import './auth.css';

export function AuthLayout() {
  return <div className="auth-wrapper">
    <a className="skip-link" href="#main-content">Bỏ qua giới thiệu</a>
    <div className="auth-split-box">
      <aside className="auth-visual-side">
        <div>
          <Link className="auth-brand" to={paths.home}><span className="brand-badge">AI</span><strong>AIHN</strong></Link>
          <span className="auth-tag">✨ Hành trình phát triển</span>
          <h2>Thấu hiểu bản thân.<br />Chọn đúng tương lai.</h2>
          <p>Trạm định hướng thông minh đồng hành cùng học sinh, sinh viên Việt Nam trên hành trình nghề nghiệp rõ ràng và khoa học.</p>
        </div>
        <div className="auth-example" aria-label="Ví dụ minh họa · Dữ liệu mẫu">
          <small>Ví dụ minh họa · TopCode</small>
          <strong>ISC · Nghiên cứu &amp; Xã hội</strong>
          <p>Khớp 92% Kỹ sư Phần mềm &amp; Chuyên viên Dữ liệu</p>
        </div>
      </aside>
      <main id="main-content" className="auth-form-side" tabIndex={-1}><Outlet /></main>
    </div>
  </div>;
}
