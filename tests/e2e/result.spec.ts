import { expect, test } from '@playwright/test';
import { analysisData, resultData, resultFixture, snapshotData } from './result.fixture';
import type { ResultOptions } from './result.fixture';

const topCode = 'TopCode: ISC';
test('direct ID/reload loads owned scores and normalizes from its historical snapshot', async ({ page }) => {
  const calls = await resultFixture(page); await page.goto('/assessment/results/812');
  await expect(page.getByText(topCode, { exact: true })).toBeVisible(); await expect(page.getByRole('img', { name: 'Biểu đồ tỷ lệ Có theo 6 nhóm RIASEC' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Điểm 6 nhóm RIASEC' })).toContainText('50% · 4/8 câu Có');
  await expect(page.getByRole('region', { name: 'Điểm 6 nhóm RIASEC' })).toContainText('0% · 0/2 câu Có');
  await expect(page.getByRole('heading', { name: 'Phân tích nhóm I', exact: true })).toBeVisible();
  await page.reload(); await expect(page.getByText(topCode, { exact: true })).toBeVisible();
  expect(calls.filter(c => c.path === '/api/v1/result/812')).toHaveLength(2); expect(calls.filter(c => c.path.endsWith('/question'))).toHaveLength(0);
});
for (const id of ['0', '-1', 'abc', '1.5', '1e3', '9007199254740992', '']) test(`invalid result ID '${id}' never requests personal results`, async ({ page }) => {
  const calls = await resultFixture(page); await page.goto(`/assessment/results/${id}`); await expect(page.getByRole('heading', { name: 'Mã lần làm không hợp lệ' })).toBeVisible();
  expect(calls.filter(c => c.path.includes('/result/'))).toHaveLength(0); await expect(page.getByText(topCode, { exact: true })).toHaveCount(0);
});
for (const status of [404, 403, 503]) test(`result ${status} is honest and never reveals stale or fabricated scores`, async ({ page }) => {
  const calls = await resultFixture(page, { resultStatus: status }); await page.goto('/assessment/results/812');
  await expect(page.getByRole('heading', { name: status === 404 || status === 403 ? 'Không tìm thấy kết quả' : 'Không tải được kết quả' })).toBeVisible();
  await expect(page.getByText(topCode, { exact: true })).toHaveCount(0); await expect(page.getByRole('img', { name: 'Biểu đồ tỷ lệ Có theo 6 nhóm RIASEC' })).toHaveCount(0);
  expect(calls.filter(c => c.path.includes('/analyze-result/') || c.path.includes('/attempt/snapshots/'))).toHaveLength(0);
});
test('partial scores or mismatched attempt ID are errors, not zero-filled results', async ({ page }) => {
  const options: ResultOptions = { result: { ...resultData(), scores: { I: 4 } } }; await resultFixture(page, options); await page.goto('/assessment/results/812'); await expect(page.getByRole('heading', { name: 'Không tải được kết quả' })).toBeVisible();
  options.result = resultData(999); await page.getByRole('button', { name: 'Thử lại kết quả' }).click(); await expect(page.getByRole('heading', { name: 'Không tải được kết quả' })).toBeVisible(); await expect(page.getByText(topCode, { exact: true })).toHaveCount(0);
  options.result = resultData(); await page.getByRole('button', { name: 'Thử lại kết quả' }).click(); await expect(page.getByText(topCode, { exact: true })).toBeVisible();
});
test('all zeros produce finite radar points and keep server TopCode', async ({ page }) => {
  await resultFixture(page, { zero: true }); await page.goto('/assessment/results/812'); const radar = page.getByRole('img', { name: 'Biểu đồ tỷ lệ Có theo 6 nhóm RIASEC' }); await expect(radar).toBeVisible();
  await expect(page.getByText(topCode, { exact: true })).toBeVisible(); const points = await radar.locator('[data-radar-values]').getAttribute('points'); expect(points).not.toMatch(/NaN|Infinity/); expect(points?.split(' ').every(point => point === '180,170')).toBe(true);
});
for (const failure of ['missing', 'malformed', 'legacy', 'mismatch'] as const) test(`snapshot ${failure} preserves raw scores and does not invent percentages`, async ({ page }) => {
  const snapshot = snapshotData(); if (failure === 'legacy') snapshot.snapshot.questions[0]!.answerValue = 5; if (failure === 'mismatch') snapshot.snapshot.questions.find(q => q.type === 'I')!.answerValue = 0;
  const options: ResultOptions = { snapshotStatus: failure === 'missing' ? 404 : 200, snapshot: failure === 'malformed' ? {} : snapshot }; await resultFixture(page, options); await page.goto('/assessment/results/812');
  await expect(page.getByText(topCode, { exact: true })).toBeVisible(); await expect(page.getByText('Chưa thể chuẩn hóa biểu đồ', { exact: true })).toBeVisible(); await expect(page.getByRole('region', { name: 'Điểm 6 nhóm RIASEC' })).toContainText('4 điểm');
  await expect(page.getByRole('img', { name: 'Biểu đồ tỷ lệ Có theo 6 nhóm RIASEC' })).toHaveCount(0); await expect(page.getByRole('region', { name: 'Điểm 6 nhóm RIASEC' })).not.toContainText('%');
});
test('analysis failure, empty and partial data keep the actual main result', async ({ page }) => {
  const options: ResultOptions = { analysisStatus: 503 }; await resultFixture(page, options); await page.goto('/assessment/results/812'); await expect(page.getByText(topCode, { exact: true })).toBeVisible(); await expect(page.getByText('Không tải được phân tích.', { exact: true })).toBeVisible();
  options.analysisStatus = 200; options.analysis = { finishAt: '14/10/2026', analyzeResult: [] }; await page.getByRole('button', { name: 'Thử lại phân tích' }).click(); await expect(page.getByText('Chưa có nội dung phân tích cho lần làm này.', { exact: true })).toBeVisible();
  options.analysis = { ...analysisData(), analyzeResult: [analysisData().analyzeResult[0]] }; await page.getByRole('button', { name: 'Thử lại phân tích' }).click(); await expect(page.getByRole('heading', { name: 'Phân tích nhóm I', exact: true })).toBeVisible();
  await expect(page.getByText('Chưa có nội dung phân tích cho nhóm S.', { exact: true })).toBeVisible(); await expect(page.getByText('Chưa có nội dung phân tích cho nhóm C.', { exact: true })).toBeVisible();
});
test('special analysis case stays a case and does not masquerade as three personal traits', async ({ page }) => {
  const analysis = analysisData(); await resultFixture(page, { analysis: { ...analysis, analyzeResult: [{ ...analysis.analyzeResult[0], code: 'ALL_HIGH', title: 'NĂNG LỰC TOÀN DIỆN' }] } }); await page.goto('/assessment/results/812');
  await expect(page.getByRole('heading', { name: 'NĂNG LỰC TOÀN DIỆN' })).toBeVisible(); await expect(page.getByRole('heading', { name: 'Phân tích nhóm I', exact: true })).toHaveCount(0); await expect(page.getByText(topCode, { exact: true })).toBeVisible();
});
test('real route links, unknown career/advisor features and no sample matching promises', async ({ page }) => {
  const calls = await resultFixture(page); await page.goto('/assessment/results/812'); await expect(page.getByText(topCode, { exact: true })).toBeVisible();
  await expect(page.getByText('Tạo gợi ý nghề có giải thích hoặc trao đổi với cố vấn từ kết quả đã lưu.', { exact: true })).toBeVisible(); await expect(page.getByText(/92%|89%|85%|12 nghề|44\/50|60\/60|Hoàng Nam/)).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Cập nhật hồ sơ cá nhân', exact: true })).toHaveAttribute('href', '/career-profile'); await expect(page.getByRole('link', { name: 'Làm bài trắc nghiệm', exact: true })).toHaveAttribute('href', '/assessment');
  expect(calls.filter(c => /chat|advisor|recommendation|career/.test(c.path))).toHaveLength(0);
  await page.getByRole('link', { name: 'Về Trang của tôi', exact: true }).click(); await page.getByRole('link', { name: 'Xem kết quả gần nhất', exact: true }).click(); await expect(page.getByText(topCode, { exact: true })).toBeVisible();
});
test('changing attempt ID discards old result and analysis while new result loads', async ({ page }) => {
  const options: ResultOptions = {}; await resultFixture(page, options); await page.goto('/assessment/results/812'); await expect(page.getByText(topCode, { exact: true })).toBeVisible();
  let release!: () => void; options.resultGate = new Promise<void>(resolve => { release = resolve; }); options.result = resultData(813, { R: 2, I: 0, A: 3, S: 0, E: 1, C: 0 }, 'ARE');
  await page.evaluate(() => { history.pushState({}, '', '/assessment/results/813'); window.dispatchEvent(new PopStateEvent('popstate')); }); await expect(page.getByText(topCode, { exact: true })).toHaveCount(0); await expect(page.getByRole('heading', { name: 'Đang tải kết quả…' })).toBeVisible(); release(); await expect(page.getByText('TopCode: ARE', { exact: true })).toBeVisible();
});
test('pending old analysis cannot leak after logout and login B', async ({ page }) => {
  let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; }), options: ResultOptions = { analysisGate: gate }; await resultFixture(page, options); await page.goto('/assessment/results/812'); await expect(page.getByText(topCode, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click(); await expect(page).toHaveURL(/\/login/); options.owner = 72; options.analysisGate = undefined; options.resultStatus = 404;
  await page.getByLabel('Email trường hoặc cá nhân').fill('b@example.test'); await page.getByLabel('Mật khẩu', { exact: true }).fill('Password123!'); await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →', exact: true }).click(); release(); await page.goto('/assessment/results/812');
  await expect(page.getByRole('heading', { name: 'Không tìm thấy kết quả' })).toBeVisible(); await expect(page.getByText(topCode, { exact: true })).toHaveCount(0); await expect(page.getByRole('heading', { name: 'Phân tích nhóm I', exact: true })).toHaveCount(0);
});
for (const width of [320, 390, 768, 769, 1024, 1025, 1440]) test(`radar labels, long server text and touch controls fit ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 }); await resultFixture(page, { long: true }); await page.goto('/assessment/results/812'); const radar = page.getByRole('img', { name: 'Biểu đồ tỷ lệ Có theo 6 nhóm RIASEC' }); await expect(radar).toBeVisible(); await expect(page.getByRole('heading', { name: /Phân tích nhóm I/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await radar.evaluate(svg => Array.from(svg.querySelectorAll('text')).every(text => { const box = text.getBBox(); return box.x >= 0 && box.y >= 0 && box.x + box.width <= 360 && box.y + box.height <= 340; }))).toBe(true);
  for (const control of await page.locator('.assessment-result-page a:visible, .assessment-result-page button:visible').all()) { const box = await control.boundingBox(); expect(box?.height).toBeGreaterThanOrEqual(44); }
});

test('Test -> Result -> Dashboard -> reopen Result completes the assessment route flow', async ({ page }) => {
  const calls = await resultFixture(page, { workflow: true }); await page.goto('/assessment'); await page.getByRole('button', { name: 'Bắt đầu bài trắc nghiệm', exact: true }).click();
  for (let index = 0; index < 3; index++) { await page.getByRole('radio', { name: 'Có — Tôi thích', exact: true }).check(); if (index < 2) await page.getByRole('button', { name: 'Tiếp theo', exact: true }).click(); }
  await page.getByRole('button', { name: 'Nộp bài', exact: true }).click(); await expect(page).toHaveURL(/\/assessment\/results\/812$/); await expect(page.getByText(topCode, { exact: true })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Biểu đồ tỷ lệ Có theo 6 nhóm RIASEC' })).toBeVisible(); await expect(page.getByRole('region', { name: 'Điểm 6 nhóm RIASEC' })).toContainText('100% · 1/1 câu Có');
  await expect(page.getByRole('region', { name: 'Điểm 6 nhóm RIASEC' })).toContainText('Không có câu hỏi');
  expect(await page.evaluate(() => localStorage.getItem('aihn.assessment.boolean.v1.71'))).toBeNull(); await page.reload(); await expect(page.getByText(topCode, { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Về Trang của tôi', exact: true }).click(); await page.getByRole('link', { name: 'Xem kết quả gần nhất', exact: true }).click(); await expect(page.getByText(topCode, { exact: true })).toBeVisible(); expect(calls.filter(c => c.path.endsWith('/submit-v2'))).toHaveLength(1);
});
test('analysis loading and retry never replace or alter the saved TopCode and scores', async ({ page }) => {
  let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; }), calls = await resultFixture(page, { analysisGate: gate }); await page.goto('/assessment/results/812');
  await expect(page.getByText(topCode, { exact: true })).toBeVisible(); await expect(page.getByText('Đang tải phân tích…', { exact: true })).toBeVisible(); await expect(page.getByRole('img', { name: 'Biểu đồ tỷ lệ Có theo 6 nhóm RIASEC' })).toBeVisible(); release(); await expect(page.getByRole('heading', { name: 'Phân tích nhóm I', exact: true })).toBeVisible();
  expect(calls.filter(c => c.path === '/api/v1/result/812')).toHaveLength(1);
});
