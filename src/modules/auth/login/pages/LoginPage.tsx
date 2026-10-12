import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiError } from '@/shared/api/api-error';
import { paths } from '@/routes/paths';
import { useAuth } from '../../model/useAuth';
import { loginSchema } from '../model/login.schema';
import type { LoginForm } from '../model/login.schema';
import './login.css';

export function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const pending = useRef(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '', rememberMe: false } });
  const authenticate = async ({ email, password, rememberMe }: LoginForm) => {
    setError(null);
    try { await login({ email, password }, { rememberMe }); }
    catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'Không thể đăng nhập. Vui lòng thử lại.');
    } finally { pending.current = false; }
  };
  return <>
    {(location.state as { registrationComplete?: unknown } | null)?.registrationComplete === true && <p role="status">Đăng ký thành công. Vui lòng đăng nhập để tiếp tục.</p>}
    <div className="login-intro">
      <span className="brand-badge" aria-hidden="true">AI</span>
      <h1>Đăng nhập AIHN</h1>
      <p>Chào mừng bạn quay lại với hành trình khám phá bản thân!</p>
    </div>
    <form className="login-form" noValidate onSubmit={event => {
      if (pending.current) { event.preventDefault(); return; }
      pending.current = true;
      void handleSubmit(authenticate, () => { pending.current = false; })(event);
    }} aria-busy={isSubmitting}>
      <div className="field">
        <label htmlFor="login-email">Email trường hoặc cá nhân</label>
        <input id="login-email" type="email" autoComplete="username" inputMode="email" placeholder="sv_hoangnam@vnu.edu.vn" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'login-email-error' : undefined} {...register('email')} />
        {errors.email && <p className="field-error" id="login-email-error">{errors.email.message}</p>}
      </div>
      <div className="field">
        <div className="login-password-label"><label htmlFor="login-password">Mật khẩu</label><Link to={paths.forgotPassword}>Quên mật khẩu?</Link></div>
        <div className="login-password-input">
          <input id="login-password" type={visible ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" aria-invalid={!!errors.password} aria-describedby={errors.password ? 'login-password-error' : undefined} {...register('password')} />
          <button type="button" aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={visible} onClick={() => setVisible(value => !value)}>{visible ? 'Ẩn' : 'Hiện'}</button>
        </div>
        {errors.password && <p className="field-error" id="login-password-error">{errors.password.message}</p>}
      </div>
      <div>
        <label className="login-remember"><input type="checkbox" aria-describedby="login-remember-hint" {...register('rememberMe')} /><span>Ghi nhớ đăng nhập trên thiết bị này</span></label>
        <p className="field-hint" id="login-remember-hint">Tắt: chỉ giữ phiên trong tab này.</p>
      </div>
      {error && <p className="login-error" role="alert">{error}</p>}
      <button className="btn btn-primary login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập vào Trang của tôi →'}</button>
    </form>
    <p className="login-signup">Chưa có tài khoản sinh viên? <Link to={paths.signup}>Đăng ký miễn phí</Link></p>
    <div className="login-home"><Link to={paths.home}>← Về trang chủ</Link></div>
  </>;
}
