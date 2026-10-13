import type { AxiosInstance } from 'axios';
import { ApiError } from '@/shared/api/api-error';
import type { HistoryResult } from '../model/assessment.types';

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ApiError('configuration', 'Dữ liệu kết quả không hợp lệ.');
  return value as Record<string, unknown>;
}

export async function readAssessmentHistory(http: AxiosInstance, signal: AbortSignal): Promise<HistoryResult[]> {
  const response = await http.get<unknown>('/api/v1/test-session/history-by-user', { signal, params: { limit: 10 } });
  const body = record(response.data), data = record(body.data);
  if (body.status !== 200 || !Array.isArray(data.formattedHistory)) throw new ApiError('configuration', 'Dữ liệu lịch sử không hợp lệ.');
  return data.formattedHistory.map((value: unknown) => {
    const item = record(value);
    if (typeof item.attemptId !== 'number' || !Number.isSafeInteger(item.attemptId) || item.attemptId <= 0 ||
      typeof item.finishAt !== 'string' || !item.finishAt.trim() ||
      (item.analyzeType !== 'NORMAL' && item.analyzeType !== 'ALL_HIGH' && item.analyzeType !== 'ALL_LOW' && item.analyzeType !== 'OPPOSITE')) {
      throw new ApiError('configuration', 'Dữ liệu kết quả không hợp lệ.');
    }
    let primaryAnalyze: HistoryResult['primaryAnalyze'] = null;
    if (item.primaryAnalyze !== null) {
      const analysis = record(item.primaryAnalyze);
      if (typeof analysis.code !== 'string' || typeof analysis.title !== 'string' ||
        (analysis.description !== undefined && analysis.description !== null && typeof analysis.description !== 'string')) {
        throw new ApiError('configuration', 'Dữ liệu phân tích không hợp lệ.');
      }
      primaryAnalyze = { code: analysis.code, title: analysis.title, description: typeof analysis.description === 'string' ? analysis.description : null };
    }
    return { attemptId: item.attemptId, finishAt: item.finishAt, analyzeType: item.analyzeType, primaryAnalyze };
  });
}
