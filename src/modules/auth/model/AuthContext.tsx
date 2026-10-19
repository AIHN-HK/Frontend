import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthController } from './auth.types';
import { AUTH_STORAGE_KEY } from './session-persistence';
import { AuthContext } from './auth-context';

export function AuthProvider({ controller, children }: { controller: AuthController; children: ReactNode }) {
  useEffect(() => {
    const update = (event: StorageEvent) => {
      if (event.storageArea === window.localStorage && (event.key === AUTH_STORAGE_KEY || event.key === null)) void controller.synchronize();
    };
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, [controller]);
  return <AuthContext.Provider value={controller}>{children}</AuthContext.Provider>;
}
