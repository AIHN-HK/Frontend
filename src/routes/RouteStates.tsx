import { Link, Outlet, useLocation, useNavigation, useRouteError } from 'react-router';
import { AsyncState } from '@/shared/ui/AsyncState';
import { Button } from '@/shared/ui/Button';
import { paths } from './paths';
import { AccountControls } from '@/modules/auth';

export function UnavailableRoute() {
  return <AsyncState state="unavailable" description="Nội dung đang được chuẩn bị. Bạn quay lại sau nhé."
    action={<Link className="btn btn-secondary" to={paths.home}>Về trang chủ</Link>} />;
}

export function NotFoundRoute() {
  return <AsyncState state="error" title="Không tìm thấy trang" description="Đường dẫn này không còn hoặc đã thay đổi."
    action={<Link className="btn btn-primary" to={paths.home}>Về trang chủ</Link>} />;
}

export function RouteError() {
  const error = useRouteError();
  console.error('Route could not load', error instanceof Error ? error.message : 'Unknown route error');
  return <main className="route-fallback"><AsyncState state="error" description="Tải lại trang để tiếp tục."
    action={<Button onClick={() => window.location.reload()}>Tải lại trang</Button>} /></main>;
}

export function RoutePending() {
  return <main className="route-fallback" aria-busy="true">
    <div className="async-state" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>Đang tải…</p>
    </div>
  </main>;
}

export function RootRoute() {
  const navigation = useNavigation();
  const { pathname } = useLocation();
  const careerShell = /^\/(dashboard|career-profile|assessment|history|advisor|careers|recommendations|roadmap|settings)(\/|$)/.test(pathname);
  return <>{!careerShell && <AccountControls />}{navigation.state === 'loading' && <div className="route-progress" role="status">Đang tải…</div>}<Outlet /></>;
}
