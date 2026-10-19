import type { AxiosInstance } from 'axios';
import { parseAssessmentHistoryItem } from '@/modules/assessment';
import { ApiError } from '@/shared/api/api-error';
import { historyRecord, isHistoryTimestamp, parseHistoryCursor, positiveId } from '../model/history.model';
import type { ChatHistoryItem, HistoryCursor, TestHistoryPage } from '../model/history.model';

export async function readTestHistoryPage(http: AxiosInstance, cursor: HistoryCursor | null, signal: AbortSignal): Promise<TestHistoryPage> {
  const response = await http.get<unknown>('/api/v1/test-session/history-by-user', { signal, params: { limit: 10, ...(cursor ?? {}) } });
  const body = historyRecord(response.data), data = historyRecord(body.data), pagination = historyRecord(data.pageInfo);
  if (response.status !== 200 || body.status !== 200 || !Array.isArray(data.formattedHistory) || typeof pagination.hasNext !== 'boolean') throw new ApiError('configuration', 'Dữ liệu lịch sử không hợp lệ.');
  const items = data.formattedHistory.map(parseAssessmentHistoryItem);
  if (pagination.hasNext) {
    if (!items.length) throw new ApiError('configuration', 'Trang lịch sử trống có cursor không hợp lệ.');
    return { items, nextCursor: parseHistoryCursor(pagination.nextCursor, cursor) };
  }
  if (pagination.nextCursor !== null) throw new ApiError('configuration', 'Cursor lịch sử cuối không hợp lệ.');
  return { items, nextCursor: null };
}

export async function readChatHistory(http: AxiosInstance, signal: AbortSignal): Promise<ChatHistoryItem[]> {
  const response = await http.get<unknown>('/api/v1/chat/sessions', { signal });
  const body = historyRecord(response.data);
  if (response.status !== 200 || body.status !== 200 || !Array.isArray(body.data)) throw new ApiError('configuration', 'Dữ liệu phiên tư vấn không hợp lệ.');
  const seen = new Set<number>();
  return body.data.map((value: unknown): ChatHistoryItem => {
    const item = historyRecord(value);
    if (!positiveId(item.id) || (item.title !== null && typeof item.title !== 'string') || (item.status !== 'ACTIVE' && item.status !== 'CLOSED') || !isHistoryTimestamp(item.createdAt)) throw new ApiError('configuration', 'Dữ liệu phiên tư vấn không hợp lệ.');
    return { id: item.id, title: item.title, status: item.status, createdAt: item.createdAt };
  }).filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); return true; });
}
