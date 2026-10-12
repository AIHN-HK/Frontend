import { Link, Outlet, useLocation } from 'react-router';
import { paths } from '@/routes/paths';
import './auth.css';

export function AuthLayout() {
  const { pathname } = useLocation();
  const registration = pathname === paths.signup || pathname === paths.verifyOtp;
  return <div className="auth-wrapper">
    <a className="skip-link" href="#main-content">Bỏ qua giới thiệu</a>
    <div className="auth-split-box">
      <aside className="auth-visual-side">
        <div>
          <Link className="auth-brand" to={paths.home}><span className="brand-badge">AI</span><strong>AIHN</strong></Link>
          <span className="auth-tag">{registration ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m2 9 10-5 10 5-10 5-10-5Zm4 2v6c4 3 8 3 12 0v-6M22 9v7" /></svg> Khởi đầu sự nghiệp</> : '✨ Hành trình phát triển'}</span>
          <h2>{registration ? <>Khám phá bản thân.<br />Chuẩn bị cho tương lai.</> : <>Thấu hiểu bản thân.<br />Chọn đúng tương lai.</>}</h2>
          <p>{registration ? 'Bắt đầu hành trình định hướng nghề nghiệp dành cho học sinh THPT cùng bài trắc nghiệm Holland RIASEC và cố vấn AIHN.' : 'Trạm định hướng thông minh đồng hành cùng học sinh, sinh viên Việt Nam trên hành trình nghề nghiệp rõ ràng và khoa học.'}</p>
        </div>
        {registration ? <div className="auth-registration-note"><span aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21v-8M12 16C5 16 3 12 3 6c6 0 9 3 9 10ZM12 13c0-6 3-9 9-9 0 6-3 9-9 9Z" /></svg></span><div><strong>Bắt đầu hoàn toàn miễn phí</strong><p>Từng bước khám phá hướng đi phù hợp</p></div></div> : <div className="auth-example" aria-label="Ví dụ minh họa · Dữ liệu mẫu">
          <small>Ví dụ minh họa · TopCode</small>
          <strong>ISC · Nghiên cứu &amp; Xã hội</strong>
          <p>Khớp 92% Kỹ sư Phần mềm &amp; Chuyên viên Dữ liệu</p>
        </div>}
      </aside>
      <main id="main-content" className="auth-form-side" tabIndex={-1}><Outlet /></main>
    </div>
  </div>;
}
