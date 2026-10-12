import { Navigate, Outlet } from 'react-router';
import { useSession } from '@/shared/session/session';
import { paths } from '../paths';

export function RequireSession() {
  const current = useSession();
  return current.status === 'authenticated' ? <Outlet /> : <Navigate to={paths.login} replace />;
}
