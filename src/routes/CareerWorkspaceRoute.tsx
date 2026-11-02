import { StudentLayout } from '@/layouts/StudentLayout';
import { AccountControls } from '@/modules/auth';
import { Link } from 'react-router';
import { useSession } from '@/shared/session/session';
import { paths } from './paths';

export function CareerWorkspaceRoute() {
  const current = useSession();
  return <StudentLayout brandTo={current.status === 'anonymous' ? paths.home : paths.dashboard} account={current.status === 'anonymous' ? <Link className="btn btn-secondary" to={paths.login}>Đăng nhập</Link> : <AccountControls />} />;
}
