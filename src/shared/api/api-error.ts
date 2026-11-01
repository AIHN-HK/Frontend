import axios from 'axios';

export type ApiErrorKind = 'http' | 'network' | 'timeout' | 'cancelled' | 'session-changed' | 'configuration';

export class ApiError extends Error {
  constructor(
    public readonly kind: ApiErrorKind,
    message: string,
    public readonly status?: number,
    public readonly outcomeUnknown = false,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function normalizeApiError(error: unknown, mutation: boolean): ApiError {
  if (error instanceof ApiError) return error;
  if (axios.isCancel(error)) return new ApiError('cancelled', 'Yêu cầu đã dừng.', undefined, mutation);
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError('timeout', 'Kết nối mất nhiều thời gian hơn dự kiến.', undefined, mutation);
    }
    if (error.response) {
      return new ApiError('http', 'Chưa hoàn tất được yêu cầu.', error.response.status, mutation && error.response.status >= 500);
    }
    return new ApiError('network', 'Chưa kết nối được. Kiểm tra mạng và thử lại.', undefined, mutation);
  }
  return new ApiError('configuration', 'Chưa gửi được yêu cầu.');
}
