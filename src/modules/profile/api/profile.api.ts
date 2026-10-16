import type { AxiosInstance } from 'axios';
import { ApiError } from '@/shared/api/api-error';
import type { Profile, ProfilePatch } from '../model/profile.types';

function parseProfile(value: unknown): Profile {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ApiError('configuration', 'Dữ liệu hồ sơ không hợp lệ.');
  const data = value as Record<string, unknown>;
  const nullableText = (text: unknown): text is string | null => text === null || typeof text === 'string';
  if (typeof data.fullname !== 'string' || typeof data.email !== 'string' || !nullableText(data.phone) || !nullableText(data.address) ||
    (data.gender !== null && data.gender !== 'MALE' && data.gender !== 'FEMALE' && data.gender !== 'OTHER') ||
    (data.class !== null && (typeof data.class !== 'number' || !Number.isSafeInteger(data.class))) ||
    (data.age !== undefined && (typeof data.age !== 'number' || !Number.isSafeInteger(data.age)))) {
    throw new ApiError('configuration', 'Dữ liệu hồ sơ không hợp lệ.');
  }
  return { fullname: data.fullname, phone: data.phone, address: data.address, gender: data.gender, class: data.class, email: data.email, ...(data.age === undefined ? {} : { age: data.age as number }) };
}

function unwrap(value: unknown): Profile {
  if (!value || typeof value !== 'object' || !('status' in value) || value.status !== 200 || !('data' in value)) throw new ApiError('configuration', 'Dữ liệu hồ sơ không hợp lệ.');
  return parseProfile(value.data);
}

export async function readProfile(http: AxiosInstance, signal: AbortSignal): Promise<Profile> {
  const response = await http.get<unknown>('/api/v1/users/me', { signal });
  return unwrap(response.data);
}

export async function updateProfile(http: AxiosInstance, input: ProfilePatch, signal: AbortSignal): Promise<Profile> {
  const { fullname, phone, address, gender, class: schoolClass } = input;
  const response = await http.patch<unknown>('/api/v1/users/me', { fullname, phone, address, gender, class: schoolClass }, { signal });
  try {
    if (response.status !== 200) throw new Error('Unexpected save status');
    return unwrap(response.data);
  } catch {
    throw new ApiError('configuration', 'Chưa xác nhận hồ sơ đã được lưu. Vui lòng kiểm tra dữ liệu đã lưu trước khi thử lại.', undefined, true);
  }
}
