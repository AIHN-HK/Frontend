import { StudentLayout } from '@/layouts/StudentLayout';
import { AccountControls } from '@/modules/auth';

export function CareerWorkspaceRoute() {
  return <StudentLayout account={<AccountControls />} />;
}
