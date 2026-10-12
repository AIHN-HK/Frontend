import { useRef, useState } from 'react';
import { useAuth } from '../model/useAuth';
import './account-controls.css';

export function AccountControls() {
  const { status, user, logout, notice } = useAuth();
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  if (status !== 'authenticated') return notice ? <p className="account-notice" role="alert">{notice}</p> : null;
  return <aside className="account-controls" aria-label="Tài khoản hiện tại">
    <span>{user?.fullname}</span>
    <button className="btn btn-secondary" disabled={busy} onClick={async () => {
      if (pending.current) return;
      pending.current = true; setBusy(true);
      try { await logout(); } catch { /* Auth notice reports unconfirmed server revocation. */ }
      finally { pending.current = false; setBusy(false); }
    }}>Đăng xuất</button>
    {notice && <p role="alert">{notice}</p>}
  </aside>;
}
