import type { AxiosInstance } from 'axios';
import { ApiError } from '@/shared/api/api-error';
import type { AuthApi } from '../model/auth.types';
import { object, parseTokens, parseUser, unwrap } from '../model/auth-response';
import type { RegistrationFields } from '../model/registration-draft';

export type OtpFlow = (RegistrationFields & { purpose: 'registration' }) | { purpose: 'password-recovery'; email: string };

export async function verifyOtp(http: AxiosInstance, flow: OtpFlow, otp: string, signal: AbortSignal): Promise<void> {
  if (!/^\d{6}$/.test(otp)) throw new ApiError('configuration', 'Vui lòng nhập đủ 6 chữ số.');
  const registration = flow.purpose === 'registration';
  const payload = registration ? { email: flow.email, fullname: flow.fullname, password: flow.password, yob: flow.yob, phone: flow.phone, otpCode: otp } : { email: flow.email, otp };
  try {
    const response = await http.post(registration ? '/api/v1/auth/register' : '/api/v1/auth/verify-forget-password-otp', payload, { signal });
    const envelope = response.data as { status?: unknown; data?: { user?: { id?: unknown; email?: unknown; fullname?: unknown } } | boolean } | null;
    const user = envelope?.data && typeof envelope.data === 'object' ? envelope.data.user : undefined;
    const valid = registration ? user && Number.isSafeInteger(user.id) && (user.id as number) > 0 && user.email === flow.email && typeof user.fullname === 'string' : envelope?.data === true;
    if (response.status !== 201 || envelope?.status !== response.status || !valid) {
      throw new ApiError('configuration', 'Chưa xác nhận được kết quả xác thực. Vui lòng kiểm tra trước khi thử lại.', undefined, true);
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) throw new ApiError('http', 'Mã xác thực không đúng hoặc đã hết hạn. Hãy kiểm tra mã hoặc yêu cầu gửi lại.', 401);
    if (error instanceof ApiError && error.status === 409) throw new ApiError('http', 'Email này đã được sử dụng. Bạn có thể đăng nhập hoặc dùng email khác.', 409);
    if (error instanceof ApiError && error.status === 429) throw new ApiError('http', 'Bạn đã thử quá nhiều lần. Vui lòng chờ trước khi thử lại.', 429);
    throw error;
  }
}

export async function resendOtp(http: AxiosInstance, flow: OtpFlow, signal: AbortSignal): Promise<void> {
  try {
    const path = flow.purpose === 'registration' ? '/api/v1/auth/register/resend-otp' : '/api/v1/auth/forgot-password/resend-otp';
    const response = await http.post(path, { email: flow.email }, { signal });
    const envelope = response.data as { status?: unknown; data?: { sent?: unknown } } | null;
    if (response.status !== 201 || envelope?.status !== response.status || envelope.data?.sent !== true) {
      throw new ApiError('configuration', 'Chưa xác nhận được yêu cầu gửi lại mã. Hãy kiểm tra email trước khi thử lại.', undefined, true);
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) throw new ApiError('http', 'Bạn đang yêu cầu mã quá nhanh. Vui lòng chờ rồi thử lại.', 429);
    if (error instanceof ApiError && error.status === 409) throw new ApiError('http', flow.purpose === 'registration' ? 'Email này đã được sử dụng. Bạn có thể đăng nhập.' : 'Không thể gửi mã cho email này. Vui lòng kiểm tra lại email.', 409);
    throw error;
  }
}

export async function sendRegistrationOtp(http: AxiosInstance, email: string, signal: AbortSignal): Promise<void> {
  try {
    const response = await http.post('/api/v1/auth/register/send-otp', { email: email.trim() }, { signal });
    const envelope = response.data as { status?: unknown; data?: { sent?: unknown } } | null;
    if (!envelope || envelope.status !== response.status || envelope.data?.sent !== true) {
      throw new ApiError('configuration', 'Chưa xác nhận được yêu cầu gửi OTP. Vui lòng kiểm tra email trước khi thử lại.', undefined, true);
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) throw new ApiError('http', 'Email này đã được sử dụng. Bạn có thể đăng nhập hoặc dùng email khác.', 409);
    if (error instanceof ApiError && error.status === 429) throw new ApiError('http', 'Bạn đã yêu cầu OTP quá nhiều lần. Vui lòng chờ rồi thử lại.', 429);
    throw error;
  }
}

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
