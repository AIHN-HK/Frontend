import { Link, Outlet, useLocation } from 'react-router';
import { paths } from '@/routes/paths';
import './auth.css';

export function AuthPreviewLayout() {
  const { pathname } = useLocation();
  const compact = pathname === paths.verifyOtp || pathname === paths.forgotPassword || pathname === paths.resetPassword;
  if (compact) return <div className="auth-wrapper">
    <a className="skip-link" href="#main-content">Bỏ qua giới thiệu</a>
    <main id="main-content" className="auth-otp-card" tabIndex={-1}><Outlet /></main>
  </div>;
  const registration = pathname === paths.signup;
  return <div className="auth-wrapper">
    <a className="skip-link" href="#main-content">Bỏ qua giới thiệu</a>
    <div className="auth-split-box">
      <aside className="auth-visual-side">
        <div>
          <Link className="auth-brand" to={paths.home}><span className="brand-badge">AI</span><strong>AIHN</strong></Link>
          <span className="auth-tag">{registration ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m2 9 10-5 10 5-10 5-10-5Zm4 2v6c4 3 8 3 12 0v-6M22 9v7" /></svg> Hiểu mình, chọn nghề</> : 'Từng bước chọn nghề'}</span>
          <h2>{registration ? <>Hiểu mình hơn.<br />Chọn bước tiếp theo.</> : <>Nhìn lại điều bạn thích.<br />Tìm một hướng để thử.</>}</h2>
          <p>{registration ? 'Tìm hiểu sở thích qua Holland RIASEC và cùng AIHN cân nhắc hướng học, hướng nghề.' : 'Một nơi để nhìn lại sở thích, tìm hiểu nghề và chọn điều muốn học tiếp.'}</p>
        </div>
        {registration ? <div className="auth-registration-note"><span aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21v-8M12 16C5 16 3 12 3 6c6 0 9 3 9 10ZM12 13c0-6 3-9 9-9 0 6-3 9-9 9Z" /></svg></span><div><strong>Làm trắc nghiệm miễn phí</strong><p>Tìm hướng đi từng bước</p></div></div> : <div className="auth-example" aria-label="Ví dụ minh họa · Dữ liệu mẫu">
          <small>Ví dụ minh họa · TopCode</small>
          <strong>ISC · Nghiên cứu &amp; Xã hội</strong>
          <p>Ví dụ: kỹ sư phần mềm và chuyên viên dữ liệu</p>
        </div>}
      </aside>
      <main id="main-content" className="auth-form-side" tabIndex={-1}><Outlet /></main>
    </div>
  </div>;
}
