import { Outlet } from 'react-router';
import { WorkspaceShell } from './components/WorkspaceShell';
import { studentNavigation } from './navigation';

export function StudentLayout() {
  return <WorkspaceShell items={studentNavigation}><Outlet /></WorkspaceShell>;
}
