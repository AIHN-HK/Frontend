import { createBrowserStorage } from '@/shared/storage/browser-storage';
import type { AuthPersistence, SavedSession } from './auth.types';

export const AUTH_STORAGE_KEY = 'aihn.auth.v1';
type Port = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
function valid(value: unknown): value is SavedSession {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<SavedSession>, tokens = record.tokens;
  return record.version === 1 && Number.isSafeInteger(record.ownerId) && (record.ownerId ?? 0) > 0 && typeof record.rememberMe === 'boolean'
    && !!tokens && typeof tokens.accessToken === 'string' && !!tokens.accessToken && typeof tokens.refreshToken === 'string' && !!tokens.refreshToken;
}
export function createAuthPersistence(local: Port, tab: Port): AuthPersistence {
  const saved = createBrowserStorage(local), temporary = createBrowserStorage(tab);
  return {
    read: () => temporary.read(AUTH_STORAGE_KEY, valid) ?? saved.read(AUTH_STORAGE_KEY, valid),
    save: value => {
      const destination = value.rememberMe ? saved : temporary, other = value.rememberMe ? temporary : saved;
      if (!other.remove(AUTH_STORAGE_KEY)) return false;
      return destination.write(AUTH_STORAGE_KEY, value);
    },
    clear: expected => {
      let ok = true;
      for (const storage of [temporary, saved]) {
        const current = storage.read(AUTH_STORAGE_KEY, valid);
        if (expected === undefined || current?.tokens.refreshToken === expected) ok = storage.remove(AUTH_STORAGE_KEY) && ok;
      }
      return ok;
    },
  };
}
export function browserAuthPersistence(): AuthPersistence {
  const port = (name: 'localStorage' | 'sessionStorage'): Port => ({
    getItem: key => window[name].getItem(key),
    setItem: (key, value) => window[name].setItem(key, value),
    removeItem: key => window[name].removeItem(key),
  });
  return createAuthPersistence(port('localStorage'), port('sessionStorage'));
}
