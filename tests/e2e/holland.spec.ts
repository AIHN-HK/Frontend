import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
const questions = [
  { id: 11, content: 'Bạn có thích tìm hiểu một vấn đề mới?', type: 'I', dimension: 'INTEREST' },
  { id: 22, content: 'Bạn có thích giúp đỡ người khác?', type: 'S', dimension: 'INTEREST' },
  { id: 33, content: 'Bạn có thích sắp xếp tài liệu?', type: 'C', dimension: 'INTEREST' },
];
type Options = { owner?: number; failure?: 'network' | 'malformed' | 'wrong-id' | '400' | '503' | '401' | 'timeout'; submitGate?: Promise<void>; empty?: boolean; getError?: boolean; count?: number; result?: boolean; long?: boolean; startFailure?: boolean };
async function fixture(page: Page, options: Options = {}) {
  const calls: { path: string; method: string; body: unknown }[] = [];
  await page.addInitScript(() => { if (!sessionStorage.getItem('holland.fixture.initialized')) { sessionStorage.setItem('holland.fixture.initialized', 'true'); sessionStorage.setItem('aihn.auth.v1', JSON.stringify({ version: 1, ownerId: 71, rememberMe: false, tokens: { accessToken: 'access', refreshToken: 'refresh' } })); } });
  await page.route('http://localhost:3000/api/v1/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname, method = req.method();
    const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
    if (method === 'OPTIONS') { await route.fulfill({ status: 204, headers }); return; }
    calls.push({ path, method, body: req.postDataJSON() as unknown });
    let status = 200, data: unknown = { id: options.owner ?? 71, fullname: `Học sinh ${options.owner ?? 71}`, role: 'USER' };
    if (path.endsWith('/login')) data = { user: data, accessToken: 'next', refreshToken: 'next-refresh' };
    if (path.endsWith('/question')) { status = options.getError ? 503 : 200; data = { questions: options.empty ? {} : Object.fromEntries(questions.map(q => [q.type, { 'Sở thích': [{ ...q, content: options.long ? q.content.repeat(20) : q.content }] }])) }; }
    if (path.endsWith('/test-session')) { status = options.startFailure ? 503 : 201; data = { id: 501, userId: options.owner ?? 71, totalQuestions: options.count ?? questions.length, finishAt: null }; }
    if (path.endsWith('/submit-v2')) {
      await options.submitGate;
      if (options.failure === 'timeout') await new Promise(resolve => setTimeout(resolve, 11_500));
      if (options.failure === 'network') { await route.abort('failed'); return; }
      status = options.failure === '400' ? 400 : options.failure === '503' ? 503 : options.failure === '401' ? 401 : 201;
      data = options.failure === 'malformed' ? { saved: true } : { attemptId: options.failure === 'wrong-id' ? 999 : 501, score: { R: 0, I: 1, A: 0, S: 0, E: 0, C: 0 }, topCode: 'ISC' };
    }
    if (path.endsWith('/result/501')) { status = options.result ? 200 : 404; data = { attemptId: 501, scores: { R: 0, I: 1, A: 0, S: 0, E: 0, C: 0 }, top_code: 'ISC' }; }
    if (path.endsWith('/me')) data = { fullname: 'Học sinh', phone: null, address: null, gender: null, class: null, email: 'a@example.test' };
    if (path.endsWith('/history-by-user')) data = { formattedHistory: [] };
    await route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify({ status, data }) });
  }); return calls;
}
const start = (page: Page) => page.getByRole('button', { name: 'Bắt đầu bài trắc nghiệm', exact: true });
const yes = (page: Page) => page.getByRole('radio', { name: 'Có — Tôi thích', exact: true });
const no = (page: Page) => page.getByRole('radio', { name: 'Không — Tôi không thích', exact: true });
async function fill(page: Page, allNo = false) {
  await start(page).click(); await (allNo ? no(page) : yes(page)).check(); await page.getByRole('button', { name: 'Tiếp theo', exact: true }).click();
  await no(page).check(); await page.getByRole('button', { name: 'Tiếp theo', exact: true }).click(); await no(page).check();
}
test('keeps boolean choices, navigation and owner draft on reload without creating another attempt', async ({ page }) => {
  const calls = await fixture(page); await page.goto('/assessment'); await expect(start(page)).toBeVisible();
  expect(calls.filter(c => c.method === 'POST' && (c.path.endsWith('/test-session') || c.path.endsWith('/submit-v2')))).toHaveLength(0); await start(page).click();
  await expect(page.getByText('Câu 1/3', { exact: true })).toBeVisible(); await no(page).check(); await page.getByRole('button', { name: 'Tiếp theo', exact: true }).click(); await yes(page).check();
  await page.getByRole('button', { name: 'Câu trước đó', exact: true }).click(); await expect(no(page)).toBeChecked();
  await page.reload(); await expect(no(page)).toBeChecked(); expect(calls.filter(c => c.path.endsWith('/test-session'))).toHaveLength(1);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
});
test('double submission sends one boolean payload, clears only confirmed draft and navigates with attemptId', async ({ page }) => {
  let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; }); const calls = await fixture(page, { submitGate: gate });
  await page.goto('/assessment'); await fill(page); const submit = page.getByRole('button', { name: 'Nộp bài', exact: true }); await submit.dblclick();
  await expect.poll(() => calls.filter(c => c.path.endsWith('/submit-v2')).length).toBe(1);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('aihn.assessment.boolean.v1.71')!).needsReview)).toBe(true); release();
  await expect(page).toHaveURL(/\/assessment\/results\/501$/); expect(calls.find(c => c.path.endsWith('/submit-v2'))?.body).toEqual({ attemptId: 501, answers: [{ questionId: 11, check: true }, { questionId: 22, check: false }, { questionId: 33, check: false }] });
  expect(await page.evaluate(() => localStorage.getItem('aihn.assessment.boolean.v1.71'))).toBeNull();
});
for (const failure of ['network', 'malformed', 'wrong-id', '400', '503', 'timeout'] as const) test(`submit ${failure} preserves draft and never automatically replays`, async ({ page }) => {
  const calls = await fixture(page, { failure }); await page.goto('/assessment'); await fill(page); await page.getByRole('button', { name: 'Nộp bài', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible({ timeout: 15_000 }); await expect(no(page)).toBeChecked();
  expect(calls.filter(c => c.path.endsWith('/submit-v2'))).toHaveLength(1); expect(await page.evaluate(() => localStorage.getItem('aihn.assessment.boolean.v1.71'))).not.toBeNull();
  await page.reload(); await expect(no(page)).toBeChecked(); expect(calls.filter(c => c.path.endsWith('/submit-v2'))).toHaveLength(1);
});
test('unknown result is reviewed with GET and can be confirmed without another submit', async ({ page }) => {
  const options: Options = { failure: 'network', result: true }, calls = await fixture(page, options); await page.goto('/assessment'); await fill(page); await page.getByRole('button', { name: 'Nộp bài', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible(); await page.getByRole('button', { name: 'Kiểm tra kết quả đã nộp' }).click();
  await expect(page).toHaveURL(/\/assessment\/results\/501$/); expect(calls.filter(c => c.path.endsWith('/submit-v2'))).toHaveLength(1);
  // The explicit confirmation read is followed by T09's independent deep-link read.
  await expect.poll(() => calls.filter(c => c.path.endsWith('/result/501')).length).toBe(2);
});
test('all-No validation follows backend rule and does not submit', async ({ page }) => {
  const calls = await fixture(page); await page.goto('/assessment'); await fill(page, true); await page.getByRole('button', { name: 'Nộp bài', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('ít nhất một'); expect(calls.filter(c => c.path.endsWith('/submit-v2'))).toHaveLength(0);
});
test('changed account never sees the other owner draft', async ({ page }) => {
  const options: Options = {}, calls = await fixture(page, options); await page.goto('/assessment'); await start(page).click(); await yes(page).check();
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click(); options.owner = 72;
  await page.goto('/login'); await page.getByLabel('Email trường hoặc cá nhân').fill('b@example.test'); await page.getByLabel('Mật khẩu', { exact: true }).fill('Password123!'); await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →', exact: true }).click();
  await page.goto('/assessment'); await expect(start(page)).toBeVisible(); await expect(yes(page)).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('aihn.assessment.boolean.v1.71'))).not.toBeNull(); expect(await page.evaluate(() => localStorage.getItem('aihn.assessment.boolean.v1.72'))).toBeNull();
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click(); options.owner = 71;
  await page.goto('/login'); await page.getByLabel('Email trường hoặc cá nhân').fill('a@example.test'); await page.getByLabel('Mật khẩu', { exact: true }).fill('Password123!'); await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →', exact: true }).click();
  await page.goto('/assessment'); await expect(yes(page)).toBeChecked(); expect(calls.filter(c => c.path.endsWith('/test-session'))).toHaveLength(1);
});
for (const width of [320, 390, 768, 769, 1024, 1025, 1440]) test(`long question, keyboard and touch targets at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 }); await fixture(page, { long: true }); await page.goto('/assessment'); await start(page).click();
  await yes(page).focus(); await page.keyboard.press('Space'); await expect(yes(page)).toBeChecked(); await page.getByRole('button', { name: 'Tiếp theo', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const control of await page.locator('.holland-page button:visible, .holland-page a:visible, .holland-choice:visible').all()) { const box = await control.boundingBox(); expect(box?.height).toBeGreaterThanOrEqual(44); }
});

test('GET retry and empty bank do not create attempts', async ({ page }) => {
  const options: Options = { getError: true }, calls = await fixture(page, options); await page.goto('/assessment');
  await expect(page.getByRole('heading', { name: 'Không tải được bộ câu hỏi.' })).toBeVisible(); options.getError = false; options.empty = true;
  await page.getByRole('button', { name: 'Thử lại câu hỏi' }).click(); await expect(page.getByRole('heading', { name: 'Bộ đề chưa có câu hỏi.' })).toBeVisible(); await expect(start(page)).toHaveCount(0);
  options.empty = false; await page.getByRole('button', { name: 'Tải lại câu hỏi' }).click(); await expect(start(page)).toBeVisible(); expect(calls.filter(c => c.path.endsWith('/test-session'))).toHaveLength(0);
});
test('incompatible version is reported and preserved until explicit discard', async ({ page }) => {
  await fixture(page); await page.goto('/assessment'); await start(page).click(); await yes(page).check();
  const raw = await page.evaluate(() => { const key = 'aihn.assessment.boolean.v1.71', draft = JSON.parse(localStorage.getItem(key)!); draft.version = 2; const raw = JSON.stringify(draft); localStorage.setItem(key, raw); return raw; });
  await page.reload(); await expect(page.getByRole('heading', { name: 'Bản nháp không tương thích' })).toBeVisible(); expect(await page.evaluate(() => localStorage.getItem('aihn.assessment.boolean.v1.71'))).toBe(raw);
  await page.getByRole('button', { name: 'Xem xét bỏ bản nháp' }).click(); await page.getByRole('button', { name: 'Giữ bản nháp' }).click(); expect(await page.evaluate(() => localStorage.getItem('aihn.assessment.boolean.v1.71'))).toBe(raw);
  await page.getByRole('button', { name: 'Xem xét bỏ bản nháp' }).click(); await page.getByRole('button', { name: 'Bỏ bản nháp trên thiết bị' }).click(); await expect(start(page)).toBeVisible();
});
test('changed question content blocks stale draft without overwriting it', async ({ page }) => {
  const options: Options = {}; await fixture(page, options); await page.goto('/assessment'); await start(page).click(); await yes(page).check();
  const saved = await page.evaluate(() => localStorage.getItem('aihn.assessment.boolean.v1.71')); options.long = true; await page.reload();
  await expect(page.getByRole('heading', { name: 'Bản nháp không tương thích' })).toBeVisible(); expect(await page.evaluate(() => localStorage.getItem('aihn.assessment.boolean.v1.71'))).toBe(saved);
});
test('session count mismatch preserves known attempt through reload without creating again', async ({ page }) => {
  const calls = await fixture(page, { count: 4 }); await page.goto('/assessment'); await start(page).click();
  await expect(page.getByRole('alert')).toContainText('Chưa khớp bộ câu hỏi'); await page.reload();
  await page.getByRole('button', { name: 'Tiếp tục lần làm #501' }).click(); await expect(page.getByRole('alert')).toContainText('Chưa khớp'); expect(calls.filter(c => c.path.endsWith('/test-session'))).toHaveLength(1);
});
test('unknown start survives reload and needs explicit decision to start a new attempt', async ({ page }) => {
  const calls = await fixture(page, { startFailure: true }); await page.goto('/assessment'); await start(page).click(); await expect(page.getByRole('alert')).toContainText('Chưa xác nhận lần làm bài'); await page.reload();
  await expect(start(page)).toHaveCount(0); await expect(page.getByRole('button', { name: 'Xem xét bắt đầu lần mới' })).toBeVisible(); expect(calls.filter(c => c.path.endsWith('/test-session'))).toHaveLength(1);
});
test('storage denial is honest and choices remain usable in the current page', async ({ page }) => {
  await fixture(page); await page.addInitScript(() => {
    const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
    Storage.prototype.getItem = function(key) { if (key.startsWith('aihn.assessment.')) throw new Error('denied'); return get.call(this, key); };
    Storage.prototype.setItem = function(key, value) { if (key.startsWith('aihn.assessment.')) throw new Error('denied'); return set.call(this, key, value); };
  }); await page.goto('/assessment'); await expect(page.getByRole('note')).toContainText('Không truy cập'); await start(page).click(); await yes(page).check();
  await expect(page.getByRole('status')).toHaveText('Chưa lưu trên thiết bị'); await expect(yes(page)).toBeChecked();
});
test('unknown 404 preserves the draft and only explicit retry sends another request', async ({ page }) => {
  const options: Options = { failure: 'network' }, calls = await fixture(page, options); await page.goto('/assessment'); await fill(page); await page.getByRole('button', { name: 'Nộp bài', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible(); const retry = page.getByRole('button', { name: 'Nộp lại sau khi kiểm tra' }); await expect(retry).toBeDisabled();
  await page.getByRole('button', { name: 'Kiểm tra kết quả đã nộp' }).click(); await expect(page.getByRole('alert')).toContainText('có thể còn xử lý'); await expect(retry).toBeEnabled();
  expect(calls.filter(c => c.path.endsWith('/submit-v2'))).toHaveLength(1); options.failure = undefined; await retry.click(); await expect(page).toHaveURL(/\/assessment\/results\/501$/); expect(calls.filter(c => c.path.endsWith('/submit-v2'))).toHaveLength(2);
});
test('pending submission aborted by navigation keeps uncertainty on remount', async ({ page }) => {
  let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; }); const calls = await fixture(page, { submitGate: gate });
  await page.goto('/assessment'); await fill(page); await page.getByRole('button', { name: 'Nộp bài', exact: true }).click(); await expect(page.getByRole('button', { name: 'Đang nộp…' })).toBeDisabled();
  await page.goto('/dashboard'); release(); await page.goto('/assessment'); await expect(page.getByRole('button', { name: 'Kiểm tra kết quả đã nộp' })).toBeVisible(); await expect(no(page)).toBeChecked();
  expect(calls.filter(c => c.path.endsWith('/submit-v2'))).toHaveLength(1); await expect(page).toHaveURL(/\/assessment$/);
});
test('401 never replays a POST and preserves the owner draft', async ({ page }) => {
  const calls = await fixture(page, { failure: '401' }); await page.goto('/assessment'); await fill(page); await page.getByRole('button', { name: 'Nộp bài', exact: true }).click();
  await expect(page).toHaveURL(/\/login/); expect(calls.filter(c => c.path.endsWith('/submit-v2'))).toHaveLength(1); expect(calls.filter(c => c.path.endsWith('/refresh'))).toHaveLength(0);
  expect(await page.evaluate(() => localStorage.getItem('aihn.assessment.boolean.v1.71'))).not.toBeNull();
});

test('welcome carousel wraps without starting an attempt and overview preserves a No draft', async ({ page }) => {
  const calls = await fixture(page); await page.goto('/assessment');
  await expect(page.getByRole('heading', { name: 'Trắc nghiệm Holland RIASEC', exact: true })).toBeVisible();
  const carousel = page.getByRole('region', { name: 'Giới thiệu hành trình Holland' });
  await carousel.getByRole('button', { name: 'Nội dung giới thiệu trước' }).click();
  await expect(carousel.getByRole('heading')).toHaveText('Từng bước xây dựng mục tiêu và lộ trình của riêng bạn.');
  await carousel.getByRole('button', { name: 'Nội dung giới thiệu tiếp theo' }).click();
  await expect(carousel.getByRole('heading')).toHaveText('Khám phá nghề nghiệp từ những điều bạn yêu thích.');
  expect(calls.filter(c => c.path.endsWith('/test-session'))).toHaveLength(0);
  await start(page).click(); await no(page).check();
  await page.getByRole('button', { name: 'Quay lại giới thiệu' }).click();
  await page.getByRole('button', { name: 'Tiếp tục bài đang làm' }).click();
  await expect(no(page)).toBeChecked(); await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  expect(calls.filter(c => c.path.endsWith('/test-session'))).toHaveLength(1);
  const sidebar = page.getByRole('complementary', { name: 'Tiến trình' });
  await expect(sidebar).toContainText('0 Có / 1 đã trả lời · 1 câu');
  await expect(sidebar.locator('[data-radar-values]')).toHaveCount(0);
});

for (const width of [390, 768, 1440]) test(`Holland source welcome and question capture at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 }); await page.emulateMedia({ reducedMotion: 'reduce' });
  await fixture(page); await page.goto('/assessment'); await expect(start(page)).toBeVisible();
  await page.screenshot({ path: `.superpowers/ui-sync/P21/holland-welcome-${width}.png`, fullPage: true });
  await start(page).click(); await yes(page).check();
  await page.screenshot({ path: `.superpowers/ui-sync/P21/holland-question-${width}.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
