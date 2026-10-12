import { QueryClient } from '@tanstack/react-query';
import { createSessionStore } from '@/shared/session/session';
import type { SessionStore } from '@/shared/session/session.types';
import { createHttpClient } from '@/shared/api/http-client';
import { getEnvironment } from '@/shared/config/env';
import { ApiError } from '@/shared/api/api-error';
import { createAuthApi, createAuthController } from '@/modules/auth';
import type { AuthPersistence } from '@/modules/auth';

export function createAppRuntime(store: SessionStore = createSessionStore(), persistence: AuthPersistence = { read: () => null, save: () => true, clear: () => true }) {
  const env = getEnvironment();
  const queryClient = new QueryClient({ defaultOptions: {
    queries: {
      staleTime: 0,
      retry: (failures, error) => failures < 1 && error instanceof ApiError && (
        error.kind === 'network' || error.kind === 'timeout' || (error.kind === 'http' && (error.status ?? 0) >= 500)
      ),
    },
    mutations: { retry: false },
  } });
  let revision = store.read().revision;
  const unsubscribe = store.subscribe(() => {
    if (revision === store.read().revision) return;
    revision = store.read().revision;
    // Cancel first so query consumers receive their AbortSignal before cached data disappears.
    void queryClient.cancelQueries();
    queryClient.clear();
  });
  const raw = createHttpClient({ origin: env.apiOrigin, session: store, credentials: 'explicit', onUnauthorized: () => {} });
  const auth = createAuthController({ api: createAuthApi(raw), session: store, persistence, withRefreshLock: async run => {
    if (typeof navigator !== 'undefined' && navigator.locks) return await navigator.locks.request(`aihn-auth:${env.apiOrigin}`, run);
    return await run();
  } });
  const http = createHttpClient({ origin: env.apiOrigin, session: store, onUnauthorized: auth.unauthorized, refresh: auth.refresh });
  return { queryClient, http, auth, dispose: () => { auth.dispose(); unsubscribe(); void queryClient.cancelQueries(); queryClient.clear(); } };
}
