import { describe, expect, it, vi } from 'vitest';
import type { AxiosInstance } from 'axios';
import { readChatHistory, readTestHistoryPage } from '@/modules/history/api/history.api';
import { formatChatTime, parseHistoryCursor, uniqueTestHistory } from '@/modules/history/model/history.model';
import { historyCursor, historyItem } from '../e2e/history.fixture';
const signal = () => new AbortController().signal;
const http = (data: unknown) => ({ get: vi.fn().mockResolvedValue({ status: 200, data: { status: 200, data } }) }) as unknown as AxiosInstance;
describe('history source contracts and stable pagination', () => {
  it('sends the original cursor pair and cancellation, without deriving it from displayed completion date', async () => {
    const transport = http({ formattedHistory: [historyItem(810)], pageInfo: { hasNext: false, nextCursor: null } }), active = signal();
    await expect(readTestHistoryPage(transport, historyCursor, active)).resolves.toMatchObject({ items: [{ attemptId: 810 }], nextCursor: null });
    expect(transport.get).toHaveBeenCalledWith('/api/v1/test-session/history-by-user', { signal: active, params: { limit: 10, ...historyCursor } });
  });
  it('accepts older dates and descending IDs within the same timestamp; rejects loops or forward cursors', () => {
    expect(parseHistoryCursor({ ...historyCursor, cursorId: 810 }, historyCursor).cursorId).toBe(810);
    expect(parseHistoryCursor({ ...historyCursor, cursorCreatedAt: '2026-10-12T10:00:00.000Z', cursorId: 999 }, historyCursor).cursorId).toBe(999);
    for (const cursor of [historyCursor, { ...historyCursor, cursorId: 812 }, { ...historyCursor, cursorCreatedAt: '2026-10-14T00:00:00Z' }, { ...historyCursor, cursorId: 0 }, { ...historyCursor, cursorCreatedAt: '14/10/2026' }]) expect(() => parseHistoryCursor(cursor, historyCursor)).toThrow();
  });
  it('rejects contradictory pagination, incomplete cursor pairs and invalid records', async () => {
    for (const data of [
      { formattedHistory: [], pageInfo: { hasNext: true, nextCursor: historyCursor } },
      { formattedHistory: [historyItem(812)], pageInfo: { hasNext: true, nextCursor: { cursorId: 811 } } },
      { formattedHistory: [], pageInfo: { hasNext: false, nextCursor: historyCursor } },
      { formattedHistory: [{ ...historyItem(812), attemptId: 0 }], pageInfo: { hasNext: false, nextCursor: null } },
      { formattedHistory: [], pageInfo: { hasNext: 'false', nextCursor: null } },
    ]) await expect(readTestHistoryPage(http(data), null, signal())).rejects.toThrow();
  });
  it('keeps server order and first copy across overlapping pages without sorting on completion dates', () => {
    const first = { ...historyItem(812), finishAt: '01/01/2025' };
    expect(uniqueTestHistory([{ items: [first, historyItem(811)], nextCursor: historyCursor }, { items: [historyItem(811, 'Repeated'), historyItem(810)], nextCursor: null }])).toEqual([first, historyItem(811), historyItem(810)]);
    expect(uniqueTestHistory([])).toEqual([]);
  });
  it('accepts absent analysis without turning a single analysis code into a TopCode', async () => {
    const result = await readTestHistoryPage(http({ formattedHistory: [historyItem(812), { ...historyItem(811), primaryAnalyze: null }], pageInfo: { hasNext: false, nextCursor: null } }), null, signal());
    expect(result.items[0]?.primaryAnalyze?.code).toBe('I'); expect(result.items[1]?.primaryAnalyze).toBeNull();
  });
  it('reads chat metadata as an independent unpaginated source, preserving server order and null title', async () => {
    const data = [{ id: 31, title: null, status: 'CLOSED', createdAt: '2026-10-14T07:15:00.000Z' }, { id: 30, title: 'Saved', status: 'ACTIVE', createdAt: '2026-10-13T07:15:00.000Z' }], transport = http([...data, data[0]]), active = signal();
    await expect(readChatHistory(transport, active)).resolves.toEqual(data);
    expect(transport.get).toHaveBeenCalledWith('/api/v1/chat/sessions', { signal: active });
    expect(formatChatTime(data[0]!.createdAt)).toContain('14:15'); expect(formatChatTime(data[0]!.createdAt)).toContain('14/10/2026');
  });
  it('rejects malformed chat title/status/identity/timestamp rather than displaying imaginary metadata', async () => {
    const data = { id: 31, title: null, status: 'ACTIVE', createdAt: '2026-10-14T07:15:00.000Z' };
    for (const bad of [{ ...data, id: -1 }, { ...data, title: {} }, { ...data, status: 'FINISHED' }, { ...data, createdAt: 'not-a-date' }, { ...data, createdAt: '2026-10-14T07:15:00' }]) await expect(readChatHistory(http([bad]), signal())).rejects.toThrow();
    await expect(readChatHistory(http({ sessions: [] }), signal())).rejects.toThrow();
  });
});
