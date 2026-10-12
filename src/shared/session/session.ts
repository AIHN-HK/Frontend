import { useSyncExternalStore } from 'react';
import type { SessionSnapshot, SessionStore } from './session.types';

export function createSessionStore(): SessionStore {
  let current: SessionSnapshot = { revision: 0, status: 'anonymous', user: null, tokens: null };
  const listeners = new Set<() => void>();
  const publish = () => { for (const listener of listeners) listener(); };
  return {
    read: () => current,
    subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    establish: (user, tokens) => {
      if (!Number.isSafeInteger(user.id) || user.id <= 0 || !tokens.accessToken || !tokens.refreshToken) {
        throw new Error('Invalid session identity');
      }
      current = { revision: current.revision + 1, status: 'authenticated', user: { ...user }, tokens: { ...tokens } };
      publish();
    },
    clear: expectedRevision => {
      if (expectedRevision !== undefined && expectedRevision !== current.revision) return false;
      current = { revision: current.revision + 1, status: 'anonymous', user: null, tokens: null };
      publish();
      return true;
    },
  };
}

export const session = createSessionStore();

export function useSession() {
  return useSyncExternalStore(session.subscribe, session.read, session.read);
}
