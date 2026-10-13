import type { Page } from '@playwright/test';
export const resultCodes = ['R', 'I', 'A', 'S', 'E', 'C'] as const;
type FixtureScores = Record<typeof resultCodes[number], number>;
const scores = { R: 0, I: 4, A: 1, S: 3, E: 0, C: 2 };
export function resultData(id = 812, values: FixtureScores = scores, topCode = 'ISC') {
  const ranked = resultCodes.map(type => ({ type, score: values[type]! })).sort((a, b) => b.score - a.score);
  let rank = 0, previous = -1;
  const items = ranked.map((item, index) => { if (item.score !== previous) rank = index + 1; previous = item.score; return { ...item, rank }; });
  return { attemptId: id, scores: values, top_code: topCode, ranked: items, top3: items.slice(0, 3).map(item => item.type) };
}
export function snapshotData(id = 812, values: FixtureScores = scores, counts: Partial<FixtureScores> = { R: 2, I: 8, A: 4, S: 6, E: 2, C: 4 }, topCode = 'ISC') {
  let questionId = 0;
  const questions = resultCodes.flatMap(type => Array.from({ length: counts[type] ?? 0 }, (_, index) => ({ id: ++questionId, type, content: `Câu hỏi ${type}`, dimension: 'INTEREST', answerValue: index < values[type]! ? 1 : 0 })));
  return { id: 1, attemptId: id, snapshot: { result: { scoreR: values.R, scoreI: values.I, scoreA: values.A, scoreS: values.S, scoreE: values.E, scoreC: values.C, topCode }, questions } };
}
export function analysisData(long = false) {
  return { finishAt: '14/10/2026', analyzeResult: ['I', 'S', 'C'].map(code => ({ code, title: `Phân tích nhóm ${code}${long ? ' — Nội dung dài'.repeat(25) : ''}`, description: `Mô tả nhóm ${code}`, personality: ['Đặc điểm do máy chủ trả về'], strengths: ['Thế mạnh do máy chủ trả về'], weaknesses: ['Điểm cần lưu ý'], careers: ['Nội dung nghề tham khảo từ phân tích'] })) };
}
export type ResultOptions = {
  owner?: number; resultStatus?: number; result?: unknown; resultGate?: Promise<void>;
  snapshotStatus?: number; snapshot?: unknown; analysisStatus?: number; analysis?: unknown; analysisGate?: Promise<void>;
  long?: boolean; zero?: boolean; workflow?: boolean;
};
export async function resultFixture(page: Page, options: ResultOptions = {}) {
  const calls: { path: string; method: string; body: unknown }[] = [];
  await page.addInitScript(() => { if (!sessionStorage.getItem('result.fixture.initialized')) { sessionStorage.setItem('result.fixture.initialized', 'true'); sessionStorage.setItem('aihn.auth.v1', JSON.stringify({ version: 1, ownerId: 71, rememberMe: false, tokens: { accessToken: 'access', refreshToken: 'refresh' } })); } });
  await page.route('http://localhost:3000/api/v1/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname, method = request.method();
    const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
    if (method === 'OPTIONS') { await route.fulfill({ status: 204, headers }); return; }
    calls.push({ path, method, body: request.postDataJSON() as unknown });
    const id = Number(path.split('/').at(-1)), values = options.zero ? { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 } : options.workflow ? { R: 0, I: 1, A: 0, S: 1, E: 0, C: 1 } : scores;
    let status = 200, data: unknown = { id: options.owner ?? 71, fullname: `Học sinh ${options.owner ?? 71}`, role: 'USER' };
    if (path.endsWith('/login')) data = { user: data, accessToken: 'next', refreshToken: 'next-refresh' };
    if (/\/result\/\d+$/.test(path)) { const captured = options.result ?? resultData(id, values); await options.resultGate; status = options.resultStatus ?? 200; data = captured; }
    if (path.includes('/attempt/snapshots/')) { status = options.snapshotStatus ?? 200; data = options.snapshot ?? (options.workflow ? snapshotData(id, values, { I: 1, S: 1, C: 1 }) : snapshotData(id, values)); }
    if (path.includes('/analyze-result/')) { const captured = options.analysis ?? analysisData(options.long); await options.analysisGate; status = options.analysisStatus ?? 200; data = captured; }
    if (path.endsWith('/me')) data = { fullname: 'Học sinh 71', phone: null, address: null, gender: null, class: null, email: 'a@example.test' };
    if (path.endsWith('/history-by-user')) data = { formattedHistory: [{ attemptId: 812, finishAt: '14/10/2026', analyzeType: 'NORMAL', primaryAnalyze: { code: 'ISC', title: 'Phân tích', description: 'Mô tả từ lịch sử' } }] };
    if (path.endsWith('/question')) data = { questions: { I: { 'Sở thích': [{ id: 11, type: 'I', dimension: 'INTEREST', content: 'Bạn thích khám phá?' }] }, S: { 'Sở thích': [{ id: 22, type: 'S', dimension: 'INTEREST', content: 'Bạn thích giúp đỡ?' }] }, C: { 'Sở thích': [{ id: 33, type: 'C', dimension: 'INTEREST', content: 'Bạn thích sắp xếp?' }] } } };
    if (path.endsWith('/test-session')) { status = 201; data = { id: 812, userId: options.owner ?? 71, totalQuestions: 3, finishAt: null }; }
    if (path.endsWith('/submit-v2')) { status = 201; data = { attemptId: 812, score: values, topCode: 'ISC' }; }
    try { await route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify({ status, data }) }); } catch { /* cancelled obsolete request */ }
  }); return calls;
}
