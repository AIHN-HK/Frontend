import { ApiError } from '@/shared/api/api-error';
import type { SessionTokens, SessionUser } from '@/shared/session/session.types';

function invalid(): never { throw new ApiError('configuration', 'Phản hồi đăng nhập không hợp lệ. Vui lòng thử lại.'); }
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
  return value as Record<string, unknown>;
}
export function unwrap(value: unknown): unknown { return object(value).data; }
export function parseTokens(value: unknown): SessionTokens {
  const data = object(value);
  if (typeof data.accessToken !== 'string' || !data.accessToken || typeof data.refreshToken !== 'string' || !data.refreshToken) return invalid();
  return { accessToken: data.accessToken, refreshToken: data.refreshToken };
}
export function parseUser(value: unknown, allowUnknownRole = false): SessionUser {
  const data = object(value);
  if (!Number.isSafeInteger(data.id) || (data.id as number) <= 0 || typeof data.fullname !== 'string') return invalid();
  if (data.role !== 'USER' && data.role !== 'ADMIN' && !(allowUnknownRole && (data.role === null || data.role === undefined))) return invalid();
  return { id: data.id as number, fullname: data.fullname, role: data.role === 'USER' || data.role === 'ADMIN' ? data.role : null };
}
