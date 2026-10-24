import { expect, type Page } from '@playwright/test';
import { analysisData, resultData, snapshotData } from './result.fixture';

export const guestId = '2e0a792e-5522-4d3a-839e-2405c34e98e9';
export const guestQuestions = [
  { id: 11, type: 'I', content: 'Bạn có thích khám phá vấn đề mới?', dimension: 'INTEREST' },
  { id: 22, type: 'S', content: 'Bạn có thích giúp đỡ người khác?', dimension: 'INTEREST' },
  { id: 33, type: 'C', content: 'Bạn có thích sắp xếp tài liệu?', dimension: 'INTEREST' },
];
export type GuestOptions = { previewFailure?: boolean; claimFailure?: boolean; claimed?: boolean; owner?: number; claimGate?: Promise<void>; catalogExpired?: boolean };
export async function guestFixture(page: Page, options: GuestOptions = {}) {
  const calls: { path: string; method: string; body: unknown }[] = [];
  const scores = { R: 0, I: 1, A: 0, S: 0, E: 0, C: 0 };
  const snapshot = { result: { scoreR: 0, scoreI: 1, scoreA: 0, scoreS: 0, scoreE: 0, scoreC: 0, topCode: 'ISC' }, questions: guestQuestions.map(q => ({ ...q, answerValue: q.id === 11 ? 1 : 0 })) };
  await page.route('http://localhost:3000/api/v1/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname, method = request.method();
    const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
    if (method === 'OPTIONS') { await route.fulfill({ status: 204, headers }); return; }
    calls.push({ path, method, body: request.postDataJSON() as unknown });
    const user = { id: options.owner ?? 71, fullname: `Học sinh ${options.owner ?? 71}`, email: 'guest@example.test', role: 'USER' };
    let data: unknown = user, status = 200;
    if (path.endsWith('/question')) data = { questions: Object.fromEntries(guestQuestions.map(q => [q.type, { 'Sở thích': [q] }])) };
    if (path.endsWith('/guest-assessment/catalog')) data = { id: guestId, catalogToken: 'signed-catalog-fixture', expiresAt: options.catalogExpired ? Date.now() - 1000 : Date.now() + 86400000, questions: guestQuestions };
    if (path.endsWith('/guest-assessment/preview')) {
      if (options.previewFailure) { await route.abort('failed'); return; }
      data = { id: guestId, receipt: 'signed-result-fixture', expiresAt: Date.now() + 86400000, scores, topCode: 'ISC', snapshot, analysis: (analysisData(false) as { analyzeResult: unknown[] }).analyzeResult };
    }
    if (path.endsWith('/guest-assessment/claim') && method === 'POST') {
      await options.claimGate;
      options.claimed = true;
      if (options.claimFailure) { await route.abort('failed'); return; }
      data = { attemptId: 812 };
    }
    if (path.endsWith(`/guest-assessment/claim/${guestId}`)) { status = options.claimed ? 200 : 404; data = { attemptId: 812 }; }
    if (path.endsWith('/login')) { status = 201; data = { user, accessToken: 'guest-access', refreshToken: 'guest-refresh' }; }
    if (path.startsWith('/api/v1/auth/register')) { status = 201; data = path.endsWith('/register') ? { user } : { sent: true }; }
    if (path.endsWith('/auth/me')) data = user;
    if (path.endsWith('/users/me')) data = { fullname: user.fullname, email: 'guest@example.test', class: null, phone: null, address: null, gender: null };
    if (path.endsWith('/history-by-user')) data = { formattedHistory: options.claimed ? [{ attemptId: 812, finishAt: '24/10/2026', analyzeType: 'NORMAL', primaryAnalyze: null }] : [] };
    if (path.endsWith('/result/812')) data = resultData();
    if (path.includes('/attempt/snapshots/812')) data = snapshotData();
    if (path.includes('/analyze-result/812')) data = analysisData(false);
    if (path.includes('/chat-session')) data = { items: [], pageInfo: { hasNext: false, nextCursor: null } };
    await route.fulfill({ status, headers, json: { status, data } });
  });
  return { calls, options };
}

export async function completeGuest(page: Page) {
  await page.goto('/assessment'); await page.getByRole('button', { name: 'Bắt đầu bài trắc nghiệm', exact: true }).click();
  await page.getByRole('radio', { name: 'Có — Tôi thích', exact: true }).check(); await page.getByRole('button', { name: 'Tiếp theo', exact: true }).click();
  await page.getByRole('radio', { name: 'Không — Tôi không thích', exact: true }).check(); await page.getByRole('button', { name: 'Tiếp theo', exact: true }).click();
  await page.getByRole('radio', { name: 'Không — Tôi không thích', exact: true }).check(); await page.getByRole('button', { name: 'Xem tổng kết RIASEC', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'TopCode: ISC', exact: true })).toBeVisible();
}
