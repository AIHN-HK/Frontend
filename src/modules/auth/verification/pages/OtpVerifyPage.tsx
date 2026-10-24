import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useNavigation } from 'react-router';
import { paths } from '@/routes/paths';
import { ApiError } from '@/shared/api/api-error';
import { useHttpClient } from '@/shared/api/api-context';
import { session, useSession } from '@/shared/session/session';
import { resendOtp, verifyOtp } from '../../api/auth.api';
import { registrationDraft } from '../../model/registration-draft';
import { recoveryState } from '../../model/recovery-state';
import { Button, Input } from 'antd';
import { usePageEntrance } from '@/shared/ui/ce/usePageEntrance';
import styles from './OtpVerifyPage.module.css';
import authStyles from '../../components/AuthScreen.module.css';

const readFlow = () => recoveryState.read() ?? registrationDraft.read();

export function OtpVerifyPage(): React.JSX.Element {
  const http = useHttpClient(), navigate = useNavigate(), navigation = useNavigation();
  const currentSession = useSession();
  const leaving = navigation.state !== 'idle' && navigation.location.pathname !== paths.verifyOtp;
  const [flow, setFlow] = useState(readFlow), [digits, setDigits] = useState<string[]>(Array<string>(6).fill(''));
  const [busy, setBusy] = useState<'verify' | 'resend' | null>(null), [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null), [now, setNow] = useState(Date.now), [completed, setCompleted] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]), pending = useRef(false), active = useRef(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    active.current = true;
    const update = () => { setFlow(readFlow()); };
    const unRegistration = registrationDraft.subscribe(update), unRecovery = recoveryState.subscribe(update);
    const timer = window.setInterval(() => { setNow(Date.now()); }, 1000);
    return () => { active.current = false; request.current?.abort(); unRegistration(); unRecovery(); window.clearInterval(timer); };
  }, []);
  useEffect(() => { if (leaving) request.current?.abort(); }, [leaving]);
  useEffect(() => { request.current?.abort(); }, [currentSession.revision]);
  useEffect(() => {
    // Focus only after React has re-enabled the digit fieldset.
    if (busy === null && !leaving && !completed) inputs.current[0]?.focus();
  }, [busy, leaving, completed]);
  const recovery = flow?.purpose === 'password-recovery';
  const missing = !flow || flow.revision !== currentSession.revision || currentSession.status !== 'anonymous' || recovery && flow.expiresAt <= now;
  const wait = flow ? Math.max(0, Math.ceil((flow.resendAvailableAt - now) / 1000)) : 0;
  const locked = busy !== null || leaving || completed;
  const otp = digits.join('');

  const input = (index: number, value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 6);
    setError(null);
    setDigits(previous => {
      const next = [...previous];
      if (numbers.length > 1) next.fill('', index);
      if (!numbers) next[index] = '';
      for (let offset = 0; offset < numbers.length && index + offset < 6; offset++) next[index + offset] = numbers[offset]!;
      return next;
    });
    inputs.current[Math.min(index + numbers.length, 5)]?.focus();
  };

  const command = async (kind: 'verify' | 'resend') => {
    if (pending.current || locked || missing || !flow || kind === 'verify' && !/^\d{6}$/.test(otp) || kind === 'resend' && flow.resendAvailableAt > Date.now()) return;
    if (session.read().status !== 'anonymous' || session.read().revision !== flow.revision) return;
    pending.current = true; setBusy(kind); setError(null); setNotice(null);
    const controller = new AbortController(); request.current = controller;
    const store = flow.purpose === 'registration' ? registrationDraft : recoveryState;
    const valid = () => active.current && !controller.signal.aborted && session.read().revision === flow.revision && readFlow()?.email === flow.email && readFlow()?.purpose === flow.purpose;
    try {
      if (kind === 'resend') {
        // Start the conservative wait even on unknown outcomes: the server may have issued a code.
        store.deferResend(Date.now() + 60_000, flow.revision);
        await resendOtp(http, flow, controller.signal);
        if (!valid()) return;
        if (flow.purpose === 'registration') registrationDraft.save(flow, flow.revision, true);
        else recoveryState.resent(flow.revision);
        setDigits(Array<string>(6).fill(''));
        setNow(Date.now()); setNotice('Máy chủ đã xác nhận yêu cầu gửi lại mã qua email. Hãy sử dụng mã mới nhất.');
      } else {
        await verifyOtp(http, flow, otp, controller.signal);
        if (!valid()) return;
        if (flow.purpose === 'registration') {
          setCompleted(true); registrationDraft.clear();
          await navigate(paths.login, { replace: true, state: { registrationComplete: true } });
        } else if (recoveryState.verify(otp, flow.revision)) {
          setCompleted(true); await navigate(paths.resetPassword);
        } else setError('Thông tin khôi phục đã hết hạn. Vui lòng bắt đầu lại.');
      }
    } catch (failure) {
      if (!valid()) return;
      const message = failure instanceof ApiError ? failure.message : 'Không thể hoàn tất xác thực.';
      setError(failure instanceof ApiError && failure.outcomeUnknown ? `${message} Chưa xác nhận kết quả; thông tin vẫn được giữ trong tab này. Hãy kiểm tra trước khi thử lại hoặc đăng nhập.` : message);
      if (kind === 'resend') { store.deferResend(Date.now() + 60_000, flow.revision); setNow(Date.now()); }
    } finally {
      pending.current = false; request.current = null;
      if (active.current) setBusy(null);
    }
  };

  const root = usePageEntrance(flow ? `otp:${flow.purpose}` : 'otp-missing');

  if (completed) return <p role="status">Đã xác thực thành công. Đang chuyển trang…</p>;
  if (missing) return <div ref={root} className={`${authStyles.page} ${styles.page} otp-missing`}>
    <span className="brand-badge" aria-hidden="true">AI</span>
    <h1>Thiếu thông tin xác thực</h1>
    <p role="status">{recovery ? 'Thông tin khôi phục đã hết hạn. Vui lòng bắt đầu lại.' : 'Không có thông tin đăng ký trong tab này. Vui lòng trở lại đăng ký.'}</p>
    <p>Thông tin được giữ trong tab hiện tại và sẽ mất khi tải lại trang.</p>
    <Link className="btn btn-secondary" to={recovery ? paths.forgotPassword : paths.signup}>{recovery ? 'Bắt đầu khôi phục lại' : 'Trở lại đăng ký'}</Link>
  </div>;

  const maskedEmail = flow.email.replace(/^(.{1,3})[^@]*@/, '$1***@');
  return <div ref={root} className={`${authStyles.page} ${styles.page}`}>
    <div className="otp-intro" data-ce-enter="">
      <span className="brand-badge" aria-hidden="true">AI</span>
      <h1>{recovery ? 'Xác thực khôi phục mật khẩu' : 'Xác thực tài khoản'}</h1>
      <p>Nhập mã xác thực 6 chữ số từ email <strong>{maskedEmail}</strong></p>
    </div>
    {!recovery && <p className="otp-flow-status" role="status">{flow.otpRequested ? 'Máy chủ đã xác nhận yêu cầu gửi OTP. Tài khoản chưa được tạo.' : 'Chưa xác nhận yêu cầu gửi OTP. Thông tin đăng ký vẫn được giữ trong tab này; tài khoản chưa được tạo.'}</p>}
    {recovery && <p className="otp-flow-status" role="status">{flow.otpRequested ? 'Máy chủ đã xác nhận yêu cầu gửi mã khôi phục. Mật khẩu chưa được thay đổi.' : 'Chưa xác nhận mã đã được gửi. Hãy kiểm tra email; mật khẩu chưa được thay đổi.'}</p>}
    <form data-ce-enter="" className="otp-form" noValidate aria-busy={busy !== null} onSubmit={event => { event.preventDefault(); void command('verify'); }}>
      <fieldset className="otp-digits" disabled={locked} aria-describedby={error ? 'otp-error' : 'otp-hint'}>
        <legend className="otp-legend">Mã xác thực 6 chữ số</legend>
        {digits.map((digit, index) => <Input key={index} ref={element => { inputs.current[index] = element?.input ?? null; }}
          aria-label={`Chữ số ${index + 1}`} aria-invalid={error !== null} type="text" inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} maxLength={6} value={digit} placeholder="•"
          onFocus={event => { event.currentTarget.select(); }}
          onChange={event => { input(index, event.target.value); }}
          onPaste={event => { event.preventDefault(); input(index, event.clipboardData.getData('text')); }}
          onKeyDown={event => {
            if (event.key === 'Backspace') {
              event.preventDefault(); const target = digit ? index : Math.max(0, index - 1);
              setDigits(previous => previous.map((value, at) => at === target ? '' : value)); inputs.current[target]?.focus(); setError(null);
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault(); inputs.current[Math.max(0, Math.min(5, index + (event.key === 'ArrowLeft' ? -1 : 1)))]?.focus();
            }
          }} />)}
      </fieldset>
      <p id="otp-hint" className="otp-hint">Kiểm tra cả thư mục spam và dùng mã mới nhất.</p>
      <div className="otp-resend">
        <p>{wait > 0 ? <>Gửi lại mã sau <strong>{wait} giây</strong></> : 'Bạn chưa nhận được mã?'}</p>
        <Button htmlType="button" disabled={locked || wait > 0} onClick={() => { void command('resend'); }}>{busy === 'resend' ? 'Đang gửi lại…' : 'Gửi lại mã qua email'}</Button>
      </div>
      {error && <p id="otp-error" className="otp-error" role="alert">{error}</p>}
      {notice && <p className="otp-notice" role="status">{notice}</p>}
      <Button className="btn btn-primary otp-submit" htmlType="submit" disabled={locked || !/^\d{6}$/.test(otp)}>{busy === 'verify' ? 'Đang xác nhận…' : recovery ? 'Xác nhận mã' : 'Xác nhận đăng ký'}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg></Button>
    </form>
    <div className="otp-footer">
      <Link to={recovery ? paths.forgotPassword : paths.signup}>{recovery ? 'Thay đổi địa chỉ email' : 'Trở lại đăng ký'}</Link>
      <Link to={paths.login}>Đăng nhập</Link>
    </div>
  </div>;
}
