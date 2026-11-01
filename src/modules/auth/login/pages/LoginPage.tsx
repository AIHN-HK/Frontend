import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useForm } from 'react-hook-form';
import { Button } from 'antd';
import { AuthInput } from '../../components/AuthFields';
import { usePageEntrance } from '@/shared/ui/ce/usePageEntrance';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiError } from '@/shared/api/api-error';
import { paths } from '@/routes/paths';
import { useAuth } from '../../model/useAuth';
import { withAuthReturn } from '../../model/post-login-path';
import { loginSchema } from '../model/login.schema';
import type { LoginForm } from '../model/login.schema';
import styles from './LoginPage.module.css';
import authStyles from '../../components/AuthScreen.module.css';

export function LoginPage() {
  const { login } = useAuth();
  const root = usePageEntrance('login');
  const location = useLocation();
  const pending = useRef(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { control, register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '', rememberMe: false } });
  const authenticate = async ({ email, password, rememberMe }: LoginForm) => {
    setError(null);
    try { await login({ email, password }, { rememberMe }); }
    catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'Chưa đăng nhập được. Bạn thử lại nhé.');
    } finally { pending.current = false; }
  };
  return <div ref={root} className={`${authStyles.page} ${styles.page}`}>
    {(location.state as { registrationComplete?: unknown } | null)?.registrationComplete === true && <p role="status">Đã tạo tài khoản. Đăng nhập để tiếp tục.</p>}
    {(location.state as { passwordResetComplete?: unknown } | null)?.passwordResetComplete === true && <p role="status">Đã đổi mật khẩu. Đăng nhập bằng mật khẩu mới.</p>}
    {new URLSearchParams(location.search).get('returnTo')?.startsWith(paths.guestAssessmentClaim) && <p role="note">Đăng nhập hoặc đăng ký để lưu kết quả rồi tiếp tục phần vừa chọn. Bài vẫn được giữ trong tab này.</p>}
    <div className="login-intro" data-ce-enter="">
      <span className="brand-badge" aria-hidden="true">AI</span>
      <h1>Đăng nhập</h1>
      <p>Mừng bạn trở lại.</p>
    </div>
    <form data-ce-enter="" className="login-form" noValidate onSubmit={event => {
      if (pending.current) { event.preventDefault(); return; }
      pending.current = true;
      void handleSubmit(authenticate, () => { pending.current = false; })(event);
    }} aria-busy={isSubmitting}>
      <div className="field">
        <label htmlFor="login-email">Email</label>
        <AuthInput id="login-email" type="email" autoComplete="username" inputMode="email" placeholder="ban@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'login-email-error' : undefined} control={control} name="email" />
        {errors.email && <p className="field-error" id="login-email-error">{errors.email.message}</p>}
      </div>
      <div className="field">
        <div className="login-password-label"><label htmlFor="login-password">Mật khẩu</label><Link to={withAuthReturn(paths.forgotPassword, location.search)}>Quên mật khẩu?</Link></div>
        <div className="login-password-input">
          <AuthInput id="login-password" type={visible ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" aria-invalid={!!errors.password} aria-describedby={errors.password ? 'login-password-error' : undefined} control={control} name="password" />
          <Button htmlType="button" aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={visible} onClick={() => setVisible(value => !value)}>{visible ? 'Ẩn' : 'Hiện'}</Button>
        </div>
        {errors.password && <p className="field-error" id="login-password-error">{errors.password.message}</p>}
      </div>
      <div>
        <label className="login-remember"><input type="checkbox" aria-describedby="login-remember-hint" {...register('rememberMe')} /><span>Ghi nhớ đăng nhập</span></label>
        <p className="field-hint" id="login-remember-hint">Bỏ chọn nếu chỉ muốn đăng nhập trong tab này.</p>
      </div>
      {error && <p className="login-error" role="alert">{error}</p>}
      <Button className="btn btn-primary login-submit" htmlType="submit" disabled={isSubmitting}>{isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}</Button>
    </form>
    <div className={styles.oauth}><span>hoặc</span><Button disabled>Đăng nhập với Google</Button><p>Chưa hỗ trợ đăng nhập bằng Google.</p></div>
    <p className="login-signup">Chưa có tài khoản? <Link to={withAuthReturn(paths.signup, location.search)}>Đăng ký</Link></p>
    <div className="login-home"><Link to={paths.home}>← Về trang chủ</Link></div>
  </div>;
}
