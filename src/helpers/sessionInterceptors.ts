import { AxiosError, AxiosInstance, InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { createSessionManager } from './sessionManager';
type Request = InternalAxiosRequestConfig & { sessionToken?: string | null; retried?: boolean };

export function installSessionInterceptors(client: AxiosInstance, session: ReturnType<typeof createSessionManager>, options: {
  refresh(token: string): Promise<{accessToken: string; refreshToken: string}>;
  onSignedOut(): void;
  captureToken?: boolean;
}) {
  let refreshing: { token: string; promise: Promise<boolean> } | null = null;
  const signOut = async (token: string | null) => { if (await session.clear(token)) options.onSignedOut(); };
  client.interceptors.request.use(async (config: Request) => {
    if (options.captureToken) {
      // Personal profile requests intentionally capture their screen's account.
      config.sessionToken = String(config.headers.Authorization || '').replace(/^Bearer /, '') || null;
      if (config.sessionToken !== (await session.read()).accessToken) throw new AxiosError('Account changed', 'SESSION_CHANGED', config);
    } else {
      const current = await session.read();
      config.sessionToken = current.accessToken;
      if (current.accessToken) config.headers.Authorization = `Bearer ${current.accessToken}`;
      else delete config.headers.Authorization;
    }
    return config;
  });
  client.interceptors.response.use(async response => {
    const config = response.config as Request;
    if (config.sessionToken !== (await session.read()).accessToken) {
      throw new AxiosError('Account changed; discarded old response', 'SESSION_CHANGED', config);
    }
    return response;
  }, async (error: unknown) => {
    if (!isAxiosError(error) || error.response?.status !== 401 || !error.config) throw error;
    const config = error.config as Request;
    const token = config.sessionToken ?? null;
    const current = await session.read();
    if (token !== current.accessToken) {
      // Another GET may already have rotated the same account's access token.
      // Reject rather than attach a new account's token to an old request.
      throw error;
    }
    const safeRead = config.method === 'get' || config.method === 'head';
    if (!safeRead || config.retried || options.captureToken || !token || !current.refreshToken) {
      await signOut(token); throw error;
    }
    if (!refreshing || refreshing.token !== token) {
      const refreshToken = current.refreshToken;
      const operation = (async () => {
        try { return await session.rotate(token, await options.refresh(refreshToken)); }
        catch (refreshError) {
          if (isAxiosError(refreshError) && [400,401,403].includes(refreshError.response?.status ?? 0)) await signOut(token);
          throw refreshError;
        }
      })();
      refreshing = { token, promise: operation };
      void operation.finally(() => { if (refreshing?.promise === operation) refreshing = null; }).catch(() => undefined);
    }
    if (!await refreshing.promise) throw error;
    config.retried = true;
    return client.request(config);
  });
}
