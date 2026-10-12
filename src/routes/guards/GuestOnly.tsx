import { Navigate, Outlet } from 'react-router';
import { useSession } from '@/shared/session/session';
import { paths } from '../paths';

export function GuestOnly() {
  const current = useSession();
  return current.status === 'anonymous' ? <Outlet /> : <Navigate to={paths.dashboard} replace />;
}
