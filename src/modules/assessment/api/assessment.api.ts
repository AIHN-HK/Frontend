import type { AxiosInstance } from 'axios';
import { ApiError } from '@/shared/api/api-error';
import { isAssessmentQuestion, parseAssessmentHistoryItem } from '../model/assessment.validation';
import { normalizeAssessmentSnapshot } from '../results/model/result.model';
import { riasecCodes } from '../model/assessment.types';
import type { AssessmentAnalysis, AssessmentAnalysisItem, AssessmentNormalization, AssessmentResult, RiasecCode, AssessmentAttempt, AssessmentConfirmation, AssessmentDraft, AssessmentQuestion, AssessmentScores, HistoryResult } from '../model/assessment.types';

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ApiError('configuration', 'Dữ liệu kết quả không hợp lệ.');
  return value as Record<string, unknown>;
}

export async function readAssessmentHistory(http: AxiosInstance, signal: AbortSignal): Promise<HistoryResult[]> {
  const response = await http.get<unknown>('/api/v1/test-session/history-by-user', { signal, params: { limit: 10 } });
  const body = record(response.data), data = record(body.data);
  if (body.status !== 200 || !Array.isArray(data.formattedHistory)) throw new ApiError('configuration', 'Dữ liệu lịch sử không hợp lệ.');
  return data.formattedHistory.map(parseAssessmentHistoryItem);
}

function positive(value: unknown): value is number { return typeof value === 'number' && Number.isSafeInteger(value) && value > 0; }
function scores(value: unknown): AssessmentScores {
  const data = record(value), parsed = {} as AssessmentScores;
  for (const code of riasecCodes) {
    const score = data[code];
    if (typeof score !== 'number' || !Number.isSafeInteger(score) || score < 0) throw new ApiError('configuration', 'Điểm Holland không hợp lệ.');
    parsed[code] = score;
  }
  return parsed;
}
function topCode(value: unknown): string {
  if (typeof value !== 'string' || !/^[RIASEC]{3}$/.test(value) || new Set(value).size !== 3) throw new ApiError('configuration', 'Mã Holland không hợp lệ.');
  return value;
}
export async function readAssessmentQuestions(http: AxiosInstance, signal: AbortSignal): Promise<AssessmentQuestion[]> {
  const response = await http.get<unknown>('/api/v1/question', { signal });
  const body = record(response.data), groups = record(record(body.data).questions);
  if (response.status !== 200 || body.status !== 200) throw new ApiError('configuration', 'Không đọc được bộ câu hỏi.');
  const questions: AssessmentQuestion[] = [];
  for (const group of Object.values(groups)) for (const values of Object.values(record(group))) {
    if (!Array.isArray(values)) throw new ApiError('configuration', 'Bộ câu hỏi không hợp lệ.');
    for (const value of values) {
      if (!isAssessmentQuestion(value)) throw new ApiError('configuration', 'Câu hỏi không hợp lệ.');
      const { id, content, type, dimension } = value; questions.push({ id, content, type, dimension });
    }
  }
  if (questions.length > 1000 || new Set(questions.map(question => question.id)).size !== questions.length) throw new ApiError('configuration', 'Bộ câu hỏi không hợp lệ.');
  // Stable order follows RIASEC and the IDs assigned by the question bank.
  return questions.sort((a, b) => riasecCodes.indexOf(a.type) - riasecCodes.indexOf(b.type) || a.id - b.id);
}
export async function startAssessment(http: AxiosInstance, ownerId: number, signal: AbortSignal): Promise<AssessmentAttempt> {
  const response = await http.post<unknown>('/api/v1/test-session', {}, { signal });
  try {
    const body = record(response.data), data = record(body.data);
    if (response.status !== 201 || body.status !== 201 || !positive(data.id) || data.userId !== ownerId || !positive(data.totalQuestions) || data.totalQuestions > 1000 || data.finishAt !== null) throw new Error('Invalid attempt');
    return { id: data.id, userId: ownerId, totalQuestions: data.totalQuestions };
  } catch { throw new ApiError('configuration', 'Chưa xác nhận lần làm bài đã được tạo.', undefined, true); }
}
export async function submitAssessment(http: AxiosInstance, draft: AssessmentDraft, signal: AbortSignal): Promise<AssessmentConfirmation> {
  const answers = draft.questions.map(question => ({ questionId: question.id, check: draft.answers[String(question.id)] }));
  if (answers.some(answer => typeof answer.check !== 'boolean') || !answers.some(answer => answer.check)) throw new ApiError('configuration', 'Cần trả lời đầy đủ và chọn Có cho ít nhất một hoạt động.');
  const response = await http.post<unknown>('/api/v1/answer/submit-v2', { attemptId: draft.attemptId, answers }, { signal });
  try {
    const body = record(response.data), data = record(body.data);
    if (response.status !== 201 || body.status !== 201 || data.attemptId !== draft.attemptId) throw new Error('Invalid confirmation');
    return { attemptId: draft.attemptId, scores: scores(data.score), topCode: topCode(data.topCode) };
  } catch { throw new ApiError('configuration', 'Chưa xác nhận bài đã được nộp. Hãy kiểm tra kết quả trước khi thử lại.', undefined, true); }
}
export async function readAssessmentConfirmation(http: AxiosInstance, attemptId: number, signal: AbortSignal): Promise<AssessmentConfirmation> {
  const response = await http.get<unknown>(`/api/v1/result/${attemptId}`, { signal });
  const body = record(response.data), data = record(body.data);
  if (response.status !== 200 || body.status !== 200 || data.attemptId !== attemptId) throw new ApiError('configuration', 'Kết quả lần làm không hợp lệ.');
  return { attemptId, scores: scores(data.scores), topCode: topCode(data.top_code) };
}

export async function readAssessmentResult(http: AxiosInstance, attemptId: number, signal: AbortSignal): Promise<AssessmentResult> {
  const response = await http.get<unknown>(`/api/v1/result/${attemptId}`, { signal });
  const body = record(response.data), data = record(body.data);
  if (response.status !== 200 || body.status !== 200 || data.attemptId !== attemptId || !Array.isArray(data.ranked) || data.ranked.length !== 6 || !Array.isArray(data.top3)) throw new ApiError('configuration', 'Kết quả lần làm không hợp lệ.');
  const parsedScores = scores(data.scores), seen = new Set<RiasecCode>();
  let lastScore: number | null = null, rank = 0;
  const ranked = data.ranked.map((value: unknown, index: number) => {
    const item = record(value), code = item.type;
    if (!riasecCodes.some(value => value === code) || seen.has(code as RiasecCode) || item.score !== parsedScores[code as RiasecCode] || (lastScore !== null && (item.score as number) > lastScore)) throw new ApiError('configuration', 'Thứ hạng Holland không hợp lệ.');
    if (item.score !== lastScore) rank = index + 1;
    lastScore = item.score as number; seen.add(code as RiasecCode);
    if (item.rank !== rank) throw new ApiError('configuration', 'Thứ hạng Holland không hợp lệ.');
    return { type: code as RiasecCode, score: lastScore, rank };
  });
  if (data.top3.length !== 3 || data.top3.some((code: unknown, index: number) => code !== ranked[index]?.type)) throw new ApiError('configuration', 'Thứ hạng Holland không hợp lệ.');
  return { attemptId, scores: parsedScores, topCode: topCode(data.top_code), ranked };
}

export async function readAssessmentSnapshot(http: AxiosInstance, result: AssessmentResult, signal: AbortSignal): Promise<AssessmentNormalization> {
  const response = await http.get<unknown>(`/api/v1/result/attempt/snapshots/${result.attemptId}`, { signal });
  try {
    const body = record(response.data), data = record(body.data), snapshot = record(data.snapshot), saved = record(snapshot.result);
    if (response.status !== 200 || body.status !== 200 || data.attemptId !== result.attemptId || topCode(saved.topCode) !== result.topCode) throw new Error('Wrong snapshot');
    return normalizeAssessmentSnapshot(result.scores, snapshot);
  } catch { throw new ApiError('configuration', 'Không có snapshot Có/Không hợp lệ để chuẩn hóa điểm.'); }
}

export async function readAssessmentAnalysis(http: AxiosInstance, attemptId: number, signal: AbortSignal): Promise<AssessmentAnalysis> {
  const response = await http.get<unknown>(`/api/v1/result/analyze-result/${attemptId}`, { signal });
  const body = record(response.data), data = record(body.data);
  if (response.status !== 200 || body.status !== 200 || typeof data.finishAt !== 'string' || !data.finishAt.trim() || !Array.isArray(data.analyzeResult)) throw new ApiError('configuration', 'Phân tích Holland không hợp lệ.');
  const codes = new Set<string>();
  const items = data.analyzeResult.map((value: unknown): AssessmentAnalysisItem => {
    const item = record(value);
    if (typeof item.code !== 'string' || ![...riasecCodes, 'ALL_HIGH', 'ALL_LOW', 'OPPOSITE_RS', 'OPPOSITE_IE', 'OPPOSITE_AC'].includes(item.code) ||
      codes.has(item.code) || typeof item.title !== 'string' || !item.title.trim() ||
      (item.description !== null && item.description !== undefined && typeof item.description !== 'string')) throw new ApiError('configuration', 'Nội dung phân tích Holland không hợp lệ.');
    codes.add(item.code);
    const list = (value: unknown): string[] => {
      if (!Array.isArray(value) || !value.every(item => typeof item === 'string' && Boolean(item.trim()))) throw new ApiError('configuration', 'Nội dung phân tích Holland không hợp lệ.');
      return value as string[];
    };
    return { code: item.code, title: item.title, description: typeof item.description === 'string' ? item.description : null, personality: list(item.personality), strengths: list(item.strengths), weaknesses: list(item.weaknesses), careers: list(item.careers) };
  });
  return { finishAt: data.finishAt, items };
}
