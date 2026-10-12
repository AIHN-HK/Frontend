import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useNavigation } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paths } from '@/routes/paths';
import { ApiError } from '@/shared/api/api-error';
import { useHttpClient } from '@/shared/api/api-context';
import { session } from '@/shared/session/session';
import { Field } from '@/shared/ui/Field';
import { sendRegistrationOtp } from '../../api/auth.api';
import { registrationDraft } from '../../model/registration-draft';
import { recoveryState } from '../../model/recovery-state';
import { signupSchema } from '../model/signup.schema';
import type { SignupForm } from '../model/signup.schema';
import './signup.css';

export function SignupPage(): React.JSX.Element {
  const http = useHttpClient(), navigate = useNavigate();
  const navigation = useNavigation();
  const leaving = navigation.state !== 'idle' && navigation.location.pathname !== paths.signup;
  const pending = useRef(false), active = useRef(false), request = useRef<AbortController | null>(null);
  const [visible, setVisible] = useState(false), [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: registrationDraft.read() ?? { fullname: '', email: '', yob: '', phone: '', password: '' },
  });
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; request.current?.abort(); };
  }, []);
  useEffect(() => {
    // Lazy routing can keep this Page mounted after the user has chosen to leave.
    if (leaving) request.current?.abort();
  }, [leaving]);
  const sendOtp = async (fields: SignupForm) => {
    setError(null);
    const revision = session.read().revision;
    recoveryState.clear();
    if (!registrationDraft.save(fields, revision)) { pending.current = false; return; }
    registrationDraft.deferResend(Date.now() + 60_000, revision);
    const controller = new AbortController();
    request.current = controller;
    try {
      await sendRegistrationOtp(http, fields.email, controller.signal);
      if (!active.current || controller.signal.aborted || session.read().revision !== revision) return;
      if (registrationDraft.save(fields, revision, true)) await navigate(paths.verifyOtp);
    } catch (failure) {
      if (!active.current || controller.signal.aborted || session.read().revision !== revision) return;
      const message = failure instanceof ApiError ? failure.message : 'Không thể gửi OTP. Vui lòng thử lại.';
      setError(failure instanceof ApiError && failure.outcomeUnknown ? `${message} Chưa xác nhận OTP đã được gửi. Hãy kiểm tra email trước khi thử lại; tài khoản chưa được tạo.` : message);
    } finally { pending.current = false; request.current = null; }
  };
  return <>
    <div className="signup-intro">
      <span className="brand-badge" aria-hidden="true">AI</span>
      <h1>Tạo tài khoản mới</h1>
      <p>Bắt đầu xác định hướng đi tương lai cùng AIHN</p>
    </div>
    <form className="signup-form" noValidate aria-busy={isSubmitting} onSubmit={event => {
      if (pending.current || leaving) { event.preventDefault(); return; }
      pending.current = true;
      void handleSubmit(sendOtp, () => { pending.current = false; })(event);
    }}>
      <fieldset disabled={isSubmitting}>
        <legend className="signup-fieldset-label">Thông tin đăng ký</legend>
        <Field label="Họ và tên của bạn" id="signup-fullname" autoComplete="name" placeholder="Nguyễn Hoàng Nam" error={errors.fullname?.message} {...register('fullname')} />
        <Field label="Địa chỉ Email" id="signup-email" type="email" inputMode="email" autoComplete="email" placeholder="name@email.com" error={errors.email?.message} {...register('email')} />
        <Field label="Ngày sinh" id="signup-yob" type="date" autoComplete="bday" error={errors.yob?.message} {...register('yob')} />
        <Field label="Số điện thoại" id="signup-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0901234567" error={errors.phone?.message} {...register('phone')} />
        <div className="field">
          <label htmlFor="signup-password">Tạo mật khẩu</label>
          <div className="signup-password-input">
            <input id="signup-password" type={visible ? 'text' : 'password'} autoComplete="new-password" placeholder="Tối thiểu 8 ký tự" aria-invalid={!!errors.password} aria-describedby="signup-password-description" {...register('password')} />
            <button type="button" aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={visible} onClick={() => setVisible(value => !value)}>{visible ? 'Ẩn' : 'Hiện'}</button>
          </div>
          <span id="signup-password-description" className={errors.password ? 'field-error' : 'field-hint'}>{errors.password?.message ?? 'Từ 8 đến 72 ký tự.'}</span>
        </div>
      </fieldset>
      {error && <p className="signup-error" role="alert">{error}</p>}
      <button className="btn btn-primary signup-submit" type="submit" disabled={isSubmitting || leaving}>{isSubmitting ? 'Đang gửi OTP…' : 'Tiếp tục xác thực OTP →'}</button>
    </form>
    <p className="signup-login">Đã có tài khoản AIHN? <Link to={paths.login}>Đăng nhập ngay</Link></p>
    <div className="signup-home"><Link to={paths.home}>← Về trang chủ</Link></div>
  </>;
}
