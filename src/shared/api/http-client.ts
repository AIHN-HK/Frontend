import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { SessionStore } from '../session/session.types';
import { ApiError, normalizeApiError } from './api-error';

type ScopedRequest = InternalAxiosRequestConfig & { sessionRevision?: number };

export function createHttpClient(options: {
  origin: string;
  session: SessionStore;
  onUnauthorized(revision: number): void;
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
    config.sessionRevision = current.revision;
    if (current.tokens) config.headers.set('Authorization', `Bearer ${current.tokens.accessToken}`);
    else config.headers.delete('Authorization');
    return config;
  }, (error: unknown) => { throw normalizeApiError(error, false); }, { synchronous: true });
  client.interceptors.response.use(response => {
    if ((response.config as ScopedRequest).sessionRevision !== options.session.read().revision) {
      throw new ApiError('session-changed', 'Phiên đã thay đổi; phản hồi cũ đã được bỏ qua.');
    }
    return response;
  }, (error: unknown) => {
    if (error instanceof ApiError) throw error;
    const config = axios.isAxiosError(error) ? error.config as ScopedRequest | undefined : undefined;
    if (config?.sessionRevision !== undefined && config.sessionRevision !== options.session.read().revision) {
      throw new ApiError('session-changed', 'Phiên đã thay đổi; phản hồi cũ đã được bỏ qua.');
    }
    if (axios.isAxiosError(error) && error.response?.status === 401 && config?.sessionRevision !== undefined) {
      options.onUnauthorized(config.sessionRevision);
    }
    const mutation = config !== undefined && !['get', 'head', 'options'].includes(config.method ?? 'get');
    throw normalizeApiError(error, mutation);
  });
  return client;
}
