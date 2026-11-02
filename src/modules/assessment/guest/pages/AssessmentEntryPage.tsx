import { useSession } from '@/shared/session/session';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { paths } from '@/routes/paths';
import { AsyncState } from '@/shared/ui/AsyncState';
import { HollandTestPage } from '../../testing/pages/HollandTestPage';
import { GuestHollandPage } from './GuestHollandPage';

export function AssessmentEntryPage() {
  const current = useSession();
  const navigate = useNavigate(), wasAuthenticated = useRef(false);
  useEffect(() => {
    if (current.status === 'authenticated') wasAuthenticated.current = true;
    else if (current.status === 'anonymous' && wasAuthenticated.current) void navigate(`${paths.login}?returnTo=${encodeURIComponent(paths.assessment)}`, { replace: true });
  }, [current.status, navigate]);
  if (current.status === 'loading') return <AsyncState state="loading" title="Đang mở tài khoản…" />;
  return current.status === 'authenticated' ? <HollandTestPage /> : <GuestHollandPage />;
}
