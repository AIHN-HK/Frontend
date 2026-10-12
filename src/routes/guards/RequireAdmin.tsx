import { Navigate, useLocation } from 'react-router';
import { useSession } from '@/shared/session/session';
import { AsyncState } from '@/shared/ui/AsyncState';
import { paths } from '../paths';

export function RequireAdmin() {
  const current = useSession();
  const location = useLocation();
  if (current.status === 'loading') return <AsyncState state="loading" title="Đang khôi phục phiên…" />;
  if (current.status === 'anonymous') return <Navigate to={`${paths.login}?returnTo=${encodeURIComponent(location.pathname + location.search + location.hash)}`} replace />;
  // T18 must verify /admin/me before this guard may render its protected outlet.
  return <main><AsyncState state="unavailable" title="Quyền quản trị chưa được xác minh" description="Không thể mở không gian quản trị lúc này." /></main>;
}
