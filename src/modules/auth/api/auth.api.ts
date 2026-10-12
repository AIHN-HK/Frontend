import type { AxiosInstance } from 'axios';
import { ApiError } from '@/shared/api/api-error';
import type { AuthApi } from '../model/auth.types';
import { object, parseTokens, parseUser, unwrap } from '../model/auth-response';

export function createAuthApi(http: AxiosInstance): AuthApi {
  const bearer = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });
  return {
    login: async input => {
      try {
        const data = object(unwrap((await http.post('/api/v1/auth/login', { email: input.email.trim(), password: input.password })).data));
        return { user: parseUser(data.user, true), tokens: parseTokens(data) };
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) throw new ApiError('http', 'Email hoặc mật khẩu không đúng.', 401);
        if (error instanceof ApiError && error.status === 429) throw new ApiError('http', 'Bạn đã thử quá nhiều lần. Vui lòng chờ rồi thử lại.', 429);
        throw error;
      }
    },
    identity: async token => {
      try { return parseUser(unwrap((await http.post('/api/v1/auth/test-authorization', {}, bearer(token))).data)); }
      catch (error) {
        // The existing USER identity endpoint rejects ADMIN; verify it with admin/me.
        if (!(error instanceof ApiError) || error.status !== 403) throw error;
        const user = parseUser(unwrap((await http.get('/api/v1/admin/me', bearer(token))).data));
        if (user.role !== 'ADMIN') throw new ApiError('configuration', 'Không thể xác minh tài khoản quản trị.');
        return user;
      }
    },
    refresh: async token => parseTokens(unwrap((await http.post('/api/v1/auth/refresh', {}, bearer(token))).data)),
    logout: async token => { await http.post('/api/v1/auth/logout', {}, bearer(token)); },
  };
}
