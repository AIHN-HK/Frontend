import type { HistoryResult } from '@/modules/assessment';
import { ApiError } from '@/shared/api/api-error';

export type HistoryCursor = { cursorCreatedAt: string; cursorId: number };
export type TestHistoryPage = { items: HistoryResult[]; nextCursor: HistoryCursor | null };
export type ChatHistoryItem = { id: number; title: string | null; status: 'ACTIVE' | 'CLOSED'; createdAt: string };
export const analysisLabels: Record<HistoryResult['analyzeType'], string> = {
  NORMAL: 'Phân tích theo nhóm', ALL_HIGH: 'Tất cả nhóm cao', ALL_LOW: 'Tất cả nhóm thấp', OPPOSITE: 'Các nhóm đối lập',
};

export function historyRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ApiError('configuration', 'Dữ liệu lịch sử không hợp lệ.');
  return value as Record<string, unknown>;
}
export function positiveId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}
export function isHistoryTimestamp(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));
}
export function parseHistoryCursor(value: unknown, previous: HistoryCursor | null): HistoryCursor {
  const data = historyRecord(value);
  if (!isHistoryTimestamp(data.cursorCreatedAt) || !positiveId(data.cursorId)) throw new ApiError('configuration', 'Cursor lịch sử không hợp lệ.');
  const cursor = { cursorCreatedAt: data.cursorCreatedAt, cursorId: data.cursorId };
  if (previous) {
    const nextTime = Date.parse(cursor.cursorCreatedAt), previousTime = Date.parse(previous.cursorCreatedAt);
    if (nextTime > previousTime || (nextTime === previousTime && cursor.cursorId >= previous.cursorId)) throw new ApiError('configuration', 'Cursor lịch sử không tiến về trang cũ hơn.');
  }
  return cursor;
}
export function uniqueTestHistory(pages: readonly TestHistoryPage[]): HistoryResult[] {
  const seen = new Set<number>();
  return pages.flatMap(page => page.items.filter(item => { if (seen.has(item.attemptId)) return false; seen.add(item.attemptId); return true; }));
}
const chatTime = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
export function formatChatTime(createdAt: string): string { return chatTime.format(new Date(createdAt)); }
