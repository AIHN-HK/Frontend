import type { AxiosInstance } from 'axios';
import { ApiError } from '@/shared/api/api-error';

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
export function avatarFileError(file: File): string | null {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Chọn ảnh JPG, PNG hoặc WebP.';
  if (!file.size || file.size > MAX_AVATAR_BYTES) return 'Ảnh cần có dung lượng tối đa 5 MB.';
  return null;
}

export async function readAvatar(http: AxiosInstance, signal: AbortSignal): Promise<Blob | null> {
  try {
    const response = await http.get<Blob>('/api/v1/users/me/avatar', { signal, responseType: 'blob' });
    if (response.status !== 200 || !(response.data instanceof Blob) || response.data.type !== 'image/webp' || !response.data.size) {
      throw new ApiError('configuration', 'Không đọc được ảnh đại diện.');
    }
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function uploadAvatar(http: AxiosInstance, file: File, signal: AbortSignal): Promise<void> {
  const invalid = avatarFileError(file);
  if (invalid) throw new ApiError('configuration', invalid);
  const body = new FormData(); body.append('avatar', file);
  const response = await http.put<unknown>('/api/v1/users/me/avatar', body, { signal });
  const envelope = response.data as { status?: unknown; data?: { saved?: unknown } } | null;
  if (response.status !== 200 || envelope?.status !== 200 || envelope.data?.saved !== true) {
    throw new ApiError('configuration', 'Chưa xác nhận ảnh đã được lưu.', undefined, true);
  }
}
