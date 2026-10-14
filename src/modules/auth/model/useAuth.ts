import { useContext, useSyncExternalStore } from 'react';
import { AuthContext } from './auth-context';

export function useAuth() {
  const controller = useContext(AuthContext);
  if (!controller) throw new Error('AuthProvider is missing');
  const current = useSyncExternalStore(controller.subscribe, controller.read, controller.read);
  const notice = useSyncExternalStore(controller.subscribeNotice, controller.notice, controller.notice);
  return { status: current.status, user: current.user, login: controller.login, logout: controller.logout, refresh: controller.refresh, notice };
}
