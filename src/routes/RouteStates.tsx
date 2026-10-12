import { Link, Outlet, useNavigation, useRouteError } from 'react-router';
import { AsyncState } from '@/shared/ui/AsyncState';
import { Button } from '@/shared/ui/Button';
import { paths } from './paths';

export function UnavailableRoute() {
  return <AsyncState state="unavailable" description="Nội dung này chưa sẵn sàng. Vui lòng quay lại sau."
    action={<Link className="btn btn-secondary" to={paths.home}>Về trang chủ</Link>} />;
}

export function NotFoundRoute() {
  return <AsyncState state="error" title="Không tìm thấy trang" description="Đường dẫn không tồn tại hoặc đã thay đổi."
    action={<Link className="btn btn-primary" to={paths.home}>Về trang chủ</Link>} />;
}

export function RouteError() {
  const error = useRouteError();
  console.error('Route could not load', error instanceof Error ? error.message : 'Unknown route error');
  return <main className="route-fallback"><AsyncState state="error" description="Vui lòng tải lại trang để thử lại."
    action={<Button onClick={() => window.location.reload()}>Tải lại trang</Button>} /></main>;
}

export function RoutePending() {
  return <main className="route-fallback"><AsyncState state="loading" /></main>;
}

export function RootRoute() {
  const navigation = useNavigation();
  return <>{navigation.state === 'loading' && <div className="route-progress" role="status">Đang tải…</div>}<Outlet /></>;
}
