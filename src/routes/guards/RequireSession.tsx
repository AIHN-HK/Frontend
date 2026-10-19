import { Navigate, Outlet, useLocation } from 'react-router';
import { useSession } from '@/shared/session/session';
import { paths } from '../paths';
import { AsyncState } from '@/shared/ui/AsyncState';

export function RequireSession() {
  const current = useSession();
  const location = useLocation();
  if (current.status === 'loading') return <AsyncState state="loading" title="Đang khôi phục phiên…" />;
  return current.status === 'authenticated' ? <Outlet /> : <Navigate to={`${paths.login}?returnTo=${encodeURIComponent(location.pathname + location.search + location.hash)}`} replace />;
}
