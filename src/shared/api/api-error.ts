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
      return new ApiError('timeout', 'Máy chủ phản hồi quá lâu.', undefined, mutation);
    }
    if (error.response) {
      return new ApiError('http', 'Không thể hoàn tất yêu cầu.', error.response.status, mutation && error.response.status >= 500);
    }
    return new ApiError('network', 'Không thể kết nối đến máy chủ.', undefined, mutation);
  }
  return new ApiError('configuration', 'Không thể gửi yêu cầu.');
}
