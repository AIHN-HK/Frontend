import { QueryClient } from '@tanstack/react-query';
import { createSessionStore } from '@/shared/session/session';
import type { SessionStore } from '@/shared/session/session.types';
import { createHttpClient } from '@/shared/api/http-client';
import { getEnvironment } from '@/shared/config/env';
import { ApiError } from '@/shared/api/api-error';

export function createAppRuntime(store: SessionStore = createSessionStore()) {
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
  const unsubscribe = store.subscribe(() => {
    // Cancel first so query consumers receive their AbortSignal before cached data disappears.
    void queryClient.cancelQueries();
    queryClient.clear();
  });
  const http = createHttpClient({ origin: env.apiOrigin, session: store, onUnauthorized: revision => { store.clear(revision); } });
  return { queryClient, http, dispose: () => { unsubscribe(); void queryClient.cancelQueries(); queryClient.clear(); } };
}
