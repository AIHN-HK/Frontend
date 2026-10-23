import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useNavigation } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paths } from '@/routes/paths';
import { ApiError } from '@/shared/api/api-error';
import { useHttpClient } from '@/shared/api/api-context';
import { session, useSession } from '@/shared/session/session';
import { Button } from 'antd';
import { AuthField as Field } from '../../components/AuthFields';
import { usePageEntrance } from '@/shared/ui/ce/usePageEntrance';
import { RecoverySteps } from '../components/RecoverySteps';
import { resetPassword } from '../../api/auth.api';
import { recoveryState } from '../../model/recovery-state';
import { resetPasswordSchema } from '../model/reset-password.schema';
import type { ResetPasswordForm } from '../model/reset-password.schema';
import { useRecoveryState } from '../model/useRecoveryState';
import styles from './ResetPasswordPage.module.css';
import authStyles from '../../components/AuthScreen.module.css';

export function ResetPasswordPage(): React.JSX.Element {
  const http = useHttpClient();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const currentSession = useSession();
  const { flow } = useRecoveryState();
  const leaving = navigation.state !== 'idle' && navigation.location.pathname !== paths.resetPassword;
  const pending = useRef(false);
  const active = useRef(false);
  const request = useRef<AbortController | null>(null);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema), defaultValues: flow?.resetDraft ?? { newPassword: '', confirmPassword: '' },
  });
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; request.current?.abort(); };
  }, []);
  useEffect(() => { if (leaving) request.current?.abort(); }, [leaving]);
  useEffect(() => { request.current?.abort(); reset(recoveryState.read()?.resetDraft ?? { newPassword: '', confirmPassword: '' }); }, [currentSession.revision, reset]);
  useEffect(() => { if (!flow?.verifiedOtp) { request.current?.abort(); reset({ newPassword: '', confirmPassword: '' }); } }, [flow?.verifiedOtp, reset]);

  const submit = async (fields: ResetPasswordForm) => {
    const credential = recoveryState.read();
    if (!credential?.verifiedOtp || session.read().status !== 'anonymous' || session.read().revision !== credential.revision) { pending.current = false; return; }
    setError(null); recoveryState.saveResetDraft(fields, credential.revision);
    const controller = new AbortController(); request.current = controller;
    const valid = () => active.current && !controller.signal.aborted && session.read().revision === credential.revision
      && recoveryState.read()?.email === credential.email && recoveryState.read()?.verifiedOtp === credential.verifiedOtp;
    try {
      await resetPassword(http, { email: credential.email, otp: credential.verifiedOtp, newPassword: fields.newPassword }, controller.signal);
      if (!valid()) return;
      setCompleted(true); recoveryState.clear(); reset({ newPassword: '', confirmPassword: '' });
      await navigate(paths.login, { replace: true, state: { passwordResetComplete: true } });
    } catch (failure) {
      if (!valid()) return;
      const message = failure instanceof ApiError ? failure.message : 'Không thể đặt lại mật khẩu.';
      setError(failure instanceof ApiError && failure.outcomeUnknown ? `${message} Chưa xác nhận kết quả; mật khẩu vẫn được giữ trong tab này. Hãy thử đăng nhập để kiểm tra trước khi gửi lại.` : message);
    } finally {
      pending.current = false; request.current = null;
    }
  };

  const root = usePageEntrance(flow?.verifiedOtp ? 'reset-ready' : 'reset-missing');
  if (completed) return <p role="status">Mật khẩu đã được đặt lại. Đang chuyển đến đăng nhập…</p>;
  if (!flow?.verifiedOtp || flow.revision !== currentSession.revision) return <div ref={root} className={`${authStyles.page} ${styles.page} recovery-missing`}>
    <span className="brand-badge" aria-hidden="true">AI</span>
    <h1>Không thể đặt lại mật khẩu</h1>
    <p role="status">Thông tin khôi phục chưa được xác thực, đã hết hạn hoặc đã mất khi tải lại trang.</p>
    <Link className="btn btn-primary recovery-submit" to={paths.forgotPassword}>Bắt đầu khôi phục lại</Link>
    <Link className="recovery-link" to={paths.login}>Quay lại đăng nhập</Link>
  </div>;

  return <div ref={root} className={`${authStyles.page} ${styles.page}`}>
    <div className="recovery-intro" data-ce-enter="">
      <span className="brand-badge" aria-hidden="true">AI</span>
      <h1>Đặt lại mật khẩu</h1>
      <p>Đặt mật khẩu mới cho tài khoản <strong>{flow.email.replace(/^(.{1,3})[^@]*@/, '$1***@')}</strong>.</p>
    </div>
    <RecoverySteps active={3} />
    <form data-ce-enter="" className="recovery-form" noValidate aria-busy={isSubmitting} onSubmit={event => {
      if (pending.current || leaving) { event.preventDefault(); return; }
      pending.current = true;
      void handleSubmit(submit, () => { pending.current = false; })(event);
    }}>
      <fieldset disabled={isSubmitting || leaving}>
        <legend className="recovery-legend">Mật khẩu mới</legend>
        <div className="recovery-password">
          <Field id="reset-password" label="Mật khẩu mới" type={visible ? 'text' : 'password'} autoComplete="new-password" placeholder="Từ 8 đến 72 ký tự" error={errors.newPassword?.message} control={control} name="newPassword" />
          <Button htmlType="button" className="recovery-toggle" aria-label={visible ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'} aria-pressed={visible} onClick={() => setVisible(value => !value)}>{visible ? 'Ẩn' : 'Hiện'}</Button>
        </div>
        <Field id="reset-confirm" label="Xác nhận mật khẩu mới" type={visible ? 'text' : 'password'} autoComplete="new-password" error={errors.confirmPassword?.message} control={control} name="confirmPassword" />
      </fieldset>
      <p className="recovery-hint">Mật khẩu từ 8 đến 72 ký tự. Thông tin khôi phục chỉ được giữ trong tab này; tải lại trang sẽ cần bắt đầu lại.</p>
      {error && <p className="recovery-error" role="alert">{error}</p>}
      <Button className="btn btn-primary recovery-submit" htmlType="submit" disabled={isSubmitting || leaving}>{isSubmitting ? 'Đang đặt lại…' : 'Đặt lại mật khẩu'}</Button>
      <Link className="recovery-link" to={paths.verifyOtp}>Xác thực lại mã OTP</Link>
    </form>
    <div className="recovery-footer"><Link to={paths.forgotPassword}>Bắt đầu khôi phục lại</Link><Link to={paths.login}>Quay lại đăng nhập</Link></div>
  </div>;
}
