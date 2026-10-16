import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useNavigation } from 'react-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paths } from '@/routes/paths';
import { ApiError } from '@/shared/api/api-error';
import { useHttpClient } from '@/shared/api/api-context';
import { session, useSession } from '@/shared/session/session';
import { Field } from '@/shared/ui/Field';
import { sendRecoveryOtp } from '../../api/auth.api';
import { recoveryState } from '../../model/recovery-state';
import { recoveryEmailSchema } from '../model/reset-password.schema';
import type { RecoveryEmailForm } from '../model/reset-password.schema';
import { useRecoveryState } from '../model/useRecoveryState';
import './recovery.css';

export function ForgotPasswordPage(): React.JSX.Element {
  const http = useHttpClient();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const currentSession = useSession();
  const { flow, now } = useRecoveryState();
  const leaving = navigation.state !== 'idle' && navigation.location.pathname !== paths.forgotPassword;
  const pending = useRef(false);
  const active = useRef(false);
  const request = useRef<AbortController | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<RecoveryEmailForm>({
    resolver: zodResolver(recoveryEmailSchema), defaultValues: { email: flow?.email ?? '' },
  });
  const email = useWatch({ control, name: 'email' }).trim();
  const wait = flow?.email === email ? Math.max(0, Math.ceil((flow.resendAvailableAt - now) / 1000)) : 0;

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; request.current?.abort(); };
  }, []);
  useEffect(() => { if (leaving) request.current?.abort(); }, [leaving]);
  useEffect(() => {
    request.current?.abort(); reset({ email: recoveryState.read()?.email ?? '' });
  }, [currentSession.revision, reset]);

  const send = async (fields: RecoveryEmailForm) => {
    const revision = session.read().revision;
    const previous = recoveryState.read();
    if (session.read().status !== 'anonymous' || previous?.email === fields.email && previous.resendAvailableAt > Date.now()) {
      pending.current = false; return;
    }
    setError(null);
    if (!recoveryState.begin(fields.email, revision, false)) { pending.current = false; return; }
    const controller = new AbortController(); request.current = controller;
    const valid = () => active.current && !controller.signal.aborted && session.read().revision === revision && recoveryState.read()?.email === fields.email;
    try {
      await sendRecoveryOtp(http, fields.email, controller.signal);
      if (!valid()) return;
      if (recoveryState.resent(revision)) await navigate(paths.verifyOtp);
    } catch (failure) {
      if (!valid()) return;
      const unknown = failure instanceof ApiError && failure.outcomeUnknown;
      const message = failure instanceof ApiError ? failure.message : 'Không thể gửi mã OTP.';
      setError(unknown ? `${message} Chưa xác nhận OTP đã được gửi. Hãy kiểm tra email trước khi thử lại; email được giữ trong tab này.` : message);
      if (failure instanceof ApiError && failure.status === 409) recoveryState.clear();
    } finally {
      pending.current = false; request.current = null;
    }
  };

  return <>
    <div className="recovery-intro">
      <span className="brand-badge" aria-hidden="true">AI</span>
      <h1>Khôi phục mật khẩu</h1>
      <p>Nhập email bạn đã đăng ký để nhận mã OTP đặt lại mật khẩu.</p>
    </div>
    <form className="recovery-form" noValidate aria-busy={isSubmitting} onSubmit={event => {
      if (pending.current || leaving || wait > 0) { event.preventDefault(); return; }
      pending.current = true;
      void handleSubmit(send, () => { pending.current = false; })(event);
    }}>
      <fieldset disabled={isSubmitting || leaving}>
        <legend className="recovery-legend">Email khôi phục</legend>
        <Field id="recovery-email" label="Email tài khoản" type="email" inputMode="email" autoComplete="email" placeholder="name@email.com" error={errors.email?.message} {...register('email')} />
      </fieldset>
      <p className="recovery-hint">💡 <strong>Mẹo:</strong> Kiểm tra cả thư mục Spam, đặc biệt nếu bạn dùng email trường (.edu.vn).</p>
      {error && <p className="recovery-error" role="alert">{error}</p>}
      {wait > 0 && <p className="recovery-wait" role="status">Có thể yêu cầu gửi lại sau {wait} giây.</p>}
      <button className="btn btn-primary recovery-submit" type="submit" disabled={isSubmitting || leaving || wait > 0}>{isSubmitting ? 'Đang gửi OTP…' : 'Gửi mã OTP'} <span aria-hidden="true">→</span></button>
      {!isSubmitting && flow?.email === email && <Link className="recovery-link" to={paths.verifyOtp}>Tôi đã nhận mã OTP</Link>}
    </form>
    <div className="recovery-footer"><span>Đã nhớ ra mật khẩu?</span><Link to={paths.login}>Quay lại đăng nhập</Link></div>
  </>;
}
