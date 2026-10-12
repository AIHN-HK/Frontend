import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { SessionStore } from '../session/session.types';
import { ApiError, normalizeApiError } from './api-error';

type ScopedRequest = InternalAxiosRequestConfig & { sessionRevision?: number; sessionToken?: string; retried?: boolean };

export function createHttpClient(options: {
  origin: string;
  session: SessionStore;
  onUnauthorized(revision: number): void;
  credentials?: 'session' | 'explicit';
  refresh?(revision: number): Promise<boolean>;
}) {
  const client = axios.create({ baseURL: options.origin, timeout: 10_000 });
  const origin = new URL(options.origin).origin;
  client.interceptors.request.use((config: ScopedRequest) => {
    // Use Axios resolution, including baseURL and allowAbsoluteUrls, before attaching credentials.
    const destination = new URL(client.getUri(config), options.origin);
    if (destination.origin !== origin || destination.username || destination.password) {
      throw new ApiError('configuration', 'URL API không hợp lệ.');
    }
    const current = options.session.read();
    if (config.retried && config.sessionRevision !== current.revision) {
      throw new ApiError('session-changed', 'Phiên đã thay đổi; yêu cầu cũ đã được bỏ qua.');
    }
    config.sessionRevision = current.revision;
    config.sessionToken = current.tokens?.accessToken;
    if (options.credentials !== 'explicit') {
      if (current.tokens) config.headers.set('Authorization', `Bearer ${current.tokens.accessToken}`);
      else config.headers.delete('Authorization');
    }
    return config;
  }, (error: unknown) => { throw normalizeApiError(error, false); }, { synchronous: true });
  client.interceptors.response.use(response => {
    if ((response.config as ScopedRequest).sessionRevision !== options.session.read().revision) {
      throw new ApiError('session-changed', 'Phiên đã thay đổi; phản hồi cũ đã được bỏ qua.');
    }
    return response;
  }, async (error: unknown) => {
    if (error instanceof ApiError) throw error;
    const config = axios.isAxiosError(error) ? error.config as ScopedRequest | undefined : undefined;
    if (config?.sessionRevision !== undefined && config.sessionRevision !== options.session.read().revision) {
      throw new ApiError('session-changed', 'Phiên đã thay đổi; phản hồi cũ đã được bỏ qua.');
    }
    if (axios.isAxiosError(error) && error.response?.status === 401 && config?.sessionRevision !== undefined) {
      const current = options.session.read();
      const safeRead = ['get', 'head'].includes(config.method ?? 'get');
      if (safeRead && !config.retried && current.tokens && options.credentials !== 'explicit' && options.refresh) {
        // Other reads may already have refreshed this same account. Reuse its token.
        const refreshed = current.tokens.accessToken !== config.sessionToken || await options.refresh(config.sessionRevision);
        if (config.sessionRevision !== options.session.read().revision) throw new ApiError('session-changed', 'Phiên đã thay đổi.');
        if (refreshed) {
          const retry: ScopedRequest = { ...config, retried: true };
          return client.request(retry);
        }
      }
      // A delayed 401 from an old access token must not clear a rotated session.
      if (config.sessionToken === options.session.read().tokens?.accessToken) {
        options.onUnauthorized(config.sessionRevision);
      }
    }
    const mutation = config !== undefined && !['get', 'head', 'options'].includes(config.method ?? 'get');
    throw normalizeApiError(error, mutation);
  });
  return client;
}
