import type { Page } from '@playwright/test';
export type HistoryTestItem = { attemptId: number; finishAt: string; analyzeType: 'NORMAL' | 'ALL_HIGH' | 'ALL_LOW' | 'OPPOSITE'; primaryAnalyze: { code: string; title: string; description: string | null } | null };
export const historyItem = (id: number, title = `Phân tích lần làm ${id}`): HistoryTestItem => ({ attemptId: id, finishAt: '14/10/2026', analyzeType: 'NORMAL', primaryAnalyze: { code: 'I', title, description: 'Nội dung phân tích được máy chủ trả về' } });
export const historyCursor = { cursorCreatedAt: '2026-10-13T10:00:00.000Z', cursorId: 811 };
export type HistoryOptions = { owner?: number; first?: unknown; second?: unknown; firstStatus?: number; secondStatus?: number; chats?: unknown; chatStatus?: number; nextGate?: Promise<void>; firstGate?: Promise<void>; chatGate?: Promise<void>; long?: boolean };
export async function historyFixture(page: Page, options: HistoryOptions = {}) {
  const calls: { path: string; method: string; params: Record<string, string> }[] = [];
  await page.addInitScript(() => { if (!sessionStorage.getItem('history.fixture.initialized')) { sessionStorage.setItem('history.fixture.initialized', 'true'); sessionStorage.setItem('aihn.auth.v1', JSON.stringify({ version: 1, ownerId: 71, rememberMe: false, tokens: { accessToken: 'access', refreshToken: 'refresh' } })); } });
  await page.route('http://localhost:3000/api/v1/**', async route => {
    const req = route.request(), url = new URL(req.url()), path = url.pathname, method = req.method();
    const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
    if (method === 'OPTIONS') { await route.fulfill({ status: 204, headers }); return; }
    calls.push({ path, method, params: Object.fromEntries(url.searchParams.entries()) });
    const owner = options.owner ?? 71;
    let status = 200, data: unknown = { id: owner, fullname: `Học sinh ${owner}`, role: 'USER' };
    if (path.endsWith('/login')) data = { user: data, accessToken: 'next', refreshToken: 'next-refresh' };
    if (path.endsWith('/history-by-user')) {
      const next = url.searchParams.has('cursorId'), captured = next ? options.second ?? { formattedHistory: [historyItem(811), historyItem(810)], pageInfo: { hasNext: false, nextCursor: null } } : options.first ?? { formattedHistory: [historyItem(812, options.long ? 'Phân tích rất dài '.repeat(60) : undefined), { ...historyItem(811), primaryAnalyze: null, analyzeType: 'ALL_LOW' }], pageInfo: { hasNext: true, nextCursor: historyCursor } };
      await (next ? options.nextGate : options.firstGate); status = next ? options.secondStatus ?? 200 : options.firstStatus ?? 200; data = captured;
    }
    if (path.endsWith('/chat/sessions')) { const captured = options.chats ?? [{ id: 31, title: options.long ? 'Chủ đề tư vấn rất dài '.repeat(80) : 'Phiên tư vấn do máy chủ lưu', status: 'ACTIVE', createdAt: '2026-10-14T07:15:00.000Z' }, { id: 30, title: null, status: 'CLOSED', createdAt: '2026-10-13T09:30:00.000Z' }]; await options.chatGate; status = options.chatStatus ?? 200; data = captured; }
    if (path.endsWith('/me')) data = { fullname: 'Học sinh', phone: null, address: null, gender: null, class: null, email: 'a@example.test' };
    if (/\/result\/\d+$/.test(path)) data = { attemptId: Number(path.split('/').at(-1)), scores: { R: 0, I: 1, A: 0, S: 0, E: 0, C: 0 }, top_code: 'ISC', ranked: [{ type: 'I', score: 1, rank: 1 }, ...['R','A','S','E','C'].map(type => ({ type, score: 0, rank: 2 }))], top3: ['I','R','A'] };
    try { await route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify({ status, data }) }); } catch { /* cancelled request */ }
  }); return calls;
}
