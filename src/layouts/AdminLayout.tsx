import { Outlet } from 'react-router';
import { WorkspaceShell } from './components/WorkspaceShell';
import { adminNavigation } from './navigation';
import '@/shared/styles/admin.css';

export function AdminLayout() {
  return <WorkspaceShell admin items={adminNavigation}><Outlet /></WorkspaceShell>;
}
