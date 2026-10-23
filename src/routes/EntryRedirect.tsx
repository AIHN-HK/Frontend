import { Navigate } from 'react-router';
import { useSession } from '@/shared/session/session';
import { AsyncState } from '@/shared/ui/AsyncState';
import { paths } from './paths';

export function EntryRedirect() {
  const current = useSession();
  if (current.status === 'loading') return <AsyncState state="loading" title="Đang khôi phục phiên…" />;
  const destination = current.status === 'authenticated'
    ? current.user?.role === 'ADMIN' ? paths.admin : paths.dashboard
    : paths.login;
  return <Navigate to={destination} replace />;
}
