import { Navigate, Outlet, useSearchParams } from 'react-router';
import { useSession } from '@/shared/session/session';
import { postLoginPath } from '@/modules/auth';
import { AsyncState } from '@/shared/ui/AsyncState';

export function GuestOnly() {
  const current = useSession();
  const [params] = useSearchParams();
  if (current.status === 'loading') return <AsyncState state="loading" title="Đang khôi phục phiên…" />;
  return current.status === 'anonymous' ? <Outlet /> : <Navigate to={postLoginPath(current.user!, params.get('returnTo'))} replace />;
}
