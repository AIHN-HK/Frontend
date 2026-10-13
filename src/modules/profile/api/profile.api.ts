import type { AxiosInstance } from 'axios';
import { ApiError } from '@/shared/api/api-error';
import type { Profile } from '../model/profile.types';

export async function readProfile(http: AxiosInstance, signal: AbortSignal): Promise<Profile> {
  const response = await http.get<unknown>('/api/v1/users/me', { signal });
  const body = response.data;
  if (body && typeof body === 'object' && 'status' in body && body.status === 200 && 'data' in body) {
    const data = body.data;
    if (data && typeof data === 'object' && 'fullname' in data && typeof data.fullname === 'string' && 'class' in data &&
      (data.class === null || (typeof data.class === 'number' && Number.isSafeInteger(data.class)))) {
      return { fullname: data.fullname, class: data.class };
    }
  }
  throw new ApiError('configuration', 'Dữ liệu hồ sơ không hợp lệ.');
}
