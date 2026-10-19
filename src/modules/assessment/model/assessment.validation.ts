import { riasecCodes } from './assessment.types';
import { ApiError } from '@/shared/api/api-error';
import type { HistoryResult, AssessmentQuestion } from './assessment.types';

export function isAssessmentQuestion(value: unknown): value is AssessmentQuestion {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  return typeof data.id === 'number' && Number.isSafeInteger(data.id) && data.id > 0 &&
    typeof data.content === 'string' && Boolean(data.content.trim()) && riasecCodes.some(code => code === data.type) &&
    (data.dimension === null || data.dimension === 'PERSONA' || data.dimension === 'ABILITY' || data.dimension === 'INTEREST');
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ApiError('configuration', 'Dữ liệu kết quả không hợp lệ.');
  return value as Record<string, unknown>;
}

export function parseAssessmentHistoryItem(value: unknown): HistoryResult {
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
}
