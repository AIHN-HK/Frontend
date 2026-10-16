import { expect, test } from '@playwright/test';
import { historyCursor, historyFixture, historyItem } from './history.fixture';
import type { HistoryOptions } from './history.fixture';
const next = (page: import('@playwright/test').Page) => page.getByRole('button', { name: 'Tải thêm lần làm', exact: true });
test('loads actual test records with original cursor, deduplicates and opens the exact result', async ({ page }) => {
  const calls = await historyFixture(page); await page.goto('/history'); await expect(page.getByRole('heading', { name: 'Lịch sử đồng hành cùng AIHN' })).toBeVisible(); await expect(page.getByRole('article', { name: 'Lần làm #812' })).toBeVisible();
  await next(page).click(); await expect(page.getByRole('article', { name: 'Lần làm #810' })).toBeVisible(); await expect(page.getByRole('article', { name: 'Lần làm #811' })).toHaveCount(1); await expect(next(page)).toHaveCount(0);
  expect(calls.filter(c => c.path.endsWith('/history-by-user')).map(c => c.params)).toEqual([{ limit: '10' }, { limit: '10', cursorCreatedAt: historyCursor.cursorCreatedAt, cursorId: '811' }]);
  await page.getByRole('article', { name: 'Lần làm #810' }).getByRole('link', { name: 'Xem kết quả', exact: true }).click(); await expect(page).toHaveURL(/\/assessment\/results\/810$/); await expect(page.getByText('TopCode: ISC', { exact: true })).toBeVisible();
});
test('empty history has no invented timeline and never crashes', async ({ page }) => {
  await historyFixture(page, { first: { formattedHistory: [], pageInfo: { hasNext: false, nextCursor: null } } }); await page.goto('/history'); await expect(page.getByText('Chưa có trắc nghiệm đã hoàn thành.', { exact: true })).toBeVisible(); await expect(page.getByRole('article')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Làm bài trắc nghiệm', exact: true })).toHaveAttribute('href', '/assessment'); await page.reload(); await expect(page.getByText('Chưa có trắc nghiệm đã hoàn thành.', { exact: true })).toBeVisible();
});
for (const failure of ['503', 'malformed', 'loop'] as const) test(`load more ${failure} keeps previous pages and supports explicit retry`, async ({ page }) => {
  const options: HistoryOptions = { secondStatus: failure === '503' ? 503 : 200, second: failure === 'malformed' ? {} : failure === 'loop' ? { formattedHistory: [historyItem(810)], pageInfo: { hasNext: true, nextCursor: historyCursor } } : undefined }; const calls = await historyFixture(page, options); await page.goto('/history'); await next(page).click();
  await expect(page.getByRole('alert')).toContainText('Các lần làm đã tải vẫn được giữ'); await expect(page.getByRole('article', { name: 'Lần làm #812' })).toBeVisible(); await expect(page.getByRole('article', { name: 'Lần làm #810' })).toHaveCount(0);
  expect(calls.filter(c => c.params.cursorId)).toHaveLength(1); options.secondStatus = 200; options.second = undefined; await page.getByRole('button', { name: 'Thử lại trang tiếp theo' }).click(); await expect(page.getByRole('article', { name: 'Lần làm #810' })).toBeVisible(); expect(calls.filter(c => c.params.cursorId)).toHaveLength(2);
});
test('pending double load-more dispatches one GET and disables controls', async ({ page }) => {
  let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; }), calls = await historyFixture(page, { nextGate: gate }); await page.goto('/history'); await next(page).dblclick(); await expect(page.getByRole('button', { name: 'Đang tải thêm…' })).toBeDisabled(); expect(calls.filter(c => c.params.cursorId)).toHaveLength(1); release(); await expect(page.getByRole('article', { name: 'Lần làm #810' })).toBeVisible();
});
test('analysis filtering distinguishes empty loaded slice and preserves filters/pages after browser back', async ({ page }) => {
  await historyFixture(page); await page.goto('/history'); await page.getByLabel('Loại phân tích').selectOption('OPPOSITE'); await expect(page.getByText('Không có lần làm phù hợp trong các mục đã tải.', { exact: true })).toBeVisible(); await expect(next(page)).toBeVisible();
  await page.getByLabel('Loại phân tích').selectOption('NORMAL'); await next(page).click(); await page.getByRole('article', { name: 'Lần làm #810' }).getByRole('link', { name: 'Xem kết quả', exact: true }).click(); await expect(page.getByText('TopCode: ISC', { exact: true })).toBeVisible(); await page.goBack();
  await expect(page.getByLabel('Loại phân tích')).toHaveValue('NORMAL'); await expect(page.getByRole('article', { name: 'Lần làm #810' })).toBeVisible(); await expect(page.getByRole('article', { name: 'Lần làm #811' })).toHaveCount(0); await page.reload(); await expect(page.getByLabel('Loại phân tích')).toHaveValue('NORMAL');
});
test('chat metadata uses its own source/filter, actual time and links to read-only conversations', async ({ page }) => {
  const calls = await historyFixture(page); await page.goto('/history?kind=chats'); await expect(page.getByRole('article', { name: 'Phiên tư vấn #31' })).toContainText('Phiên tư vấn do máy chủ lưu'); await expect(page.getByRole('article', { name: 'Phiên tư vấn #31' })).toContainText('14/10/2026');
  await expect(page.getByRole('article', { name: 'Phiên tư vấn #30' })).toContainText('Phiên tư vấn #30'); await page.getByLabel('Trạng thái phiên').selectOption('CLOSED'); await expect(page.getByRole('article', { name: 'Phiên tư vấn #31' })).toHaveCount(0); await expect(page.getByRole('article', { name: 'Phiên tư vấn #30' })).toBeVisible();
  await expect(page.getByText('Chọn phiên để đọc lại ở màn Cố vấn AI.', { exact: true })).toBeVisible(); expect(calls.filter(c => c.path.includes('/messages'))).toHaveLength(0); expect(calls.filter(c => c.path.endsWith('/history-by-user'))).toHaveLength(0); await expect(next(page)).toHaveCount(0);
});
test('source errors and retries are separate from the other history', async ({ page }) => {
  const options: HistoryOptions = { firstStatus: 503 }, calls = await historyFixture(page, options); await page.goto('/history'); await expect(page.getByText('Không tải được lịch sử trắc nghiệm.', { exact: true })).toBeVisible();
  await page.getByLabel('Loại lịch sử').selectOption('chats'); await expect(page.getByRole('article', { name: 'Phiên tư vấn #31' })).toBeVisible(); await page.getByLabel('Loại lịch sử').selectOption('tests'); await expect(page.getByText('Không tải được lịch sử trắc nghiệm.', { exact: true })).toBeVisible(); options.firstStatus = 200; await page.getByRole('button', { name: 'Thử lại lịch sử trắc nghiệm' }).click(); await expect(page.getByRole('article', { name: 'Lần làm #812' })).toBeVisible();
  expect(calls.filter(c => c.method !== 'GET' && !c.path.includes('/auth/'))).toHaveLength(0);
});
test('empty chat and malformed metadata are honest states', async ({ page }) => {
  const options: HistoryOptions = { chats: [] }; await historyFixture(page, options); await page.goto('/history?kind=chats'); await expect(page.getByText('Chưa có phiên tư vấn đã lưu.', { exact: true })).toBeVisible();
  options.chats = [{ id: 31, title: 'Never render', createdAt: 'not-a-date', status: 'ACTIVE' }]; await page.reload(); await expect(page.getByText('Không tải được danh sách phiên tư vấn.', { exact: true })).toBeVisible(); await expect(page.getByText('Never render', { exact: true })).toHaveCount(0);
});
test('late previous-owner pagination cannot appear after logout/login B', async ({ page }) => {
  let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; }), options: HistoryOptions = { nextGate: gate }; await historyFixture(page, options); await page.goto('/history'); await next(page).click(); await expect(page.getByRole('button', { name: 'Đang tải thêm…' })).toBeVisible();
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click(); await expect(page).toHaveURL(/\/login/); options.owner = 72; options.first = { formattedHistory: [], pageInfo: { hasNext: false, nextCursor: null } };
  await page.getByLabel('Email trường hoặc cá nhân').fill('b@example.test'); await page.getByLabel('Mật khẩu', { exact: true }).fill('Password123!'); await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →', exact: true }).click(); release(); await page.goto('/history'); await expect(page.getByText('Chưa có trắc nghiệm đã hoàn thành.', { exact: true })).toBeVisible(); await expect(page.getByRole('article')).toHaveCount(0);
});
for (const width of [320,390,768,769,1024,1025,1440]) test(`history long titles/filter controls/touch targets fit ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 }); await historyFixture(page, { long: true }); await page.goto('/history'); await expect(page.getByRole('article', { name: 'Lần làm #812' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.getByLabel('Loại lịch sử').selectOption('chats'); await expect(page.getByRole('article', { name: 'Phiên tư vấn #31' })).toBeVisible(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const control of await page.locator('.history-page button:visible, .history-page a:visible, .history-page select:visible').all()) { const box = await control.boundingBox(); expect(box?.height).toBeGreaterThanOrEqual(44); }
});

test('chat failure retries explicitly and status filtering can be empty', async ({ page }) => {
  const options: HistoryOptions = { chatStatus: 503, chats: [{ id: 31, title: null, status: 'ACTIVE', createdAt: '2026-10-14T07:15:00Z' }] }; await historyFixture(page, options); await page.goto('/history?kind=chats');
  await expect(page.getByText('Không tải được danh sách phiên tư vấn.', { exact: true })).toBeVisible(); options.chatStatus = 200; await page.getByRole('button', { name: 'Thử lại phiên tư vấn' }).click(); await expect(page.getByRole('article', { name: 'Phiên tư vấn #31' })).toBeVisible();
  await page.getByLabel('Trạng thái phiên').selectOption('CLOSED'); await expect(page.getByText('Không có phiên tư vấn phù hợp với bộ lọc.', { exact: true })).toBeVisible(); await expect(page.getByText('Chưa có phiên tư vấn đã lưu.', { exact: true })).toHaveCount(0);
});
test('late initial chat response cannot leak into a new owner', async ({ page }) => {
  let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; }), options: HistoryOptions = { chatGate: gate }; await historyFixture(page, options); await page.goto('/history?kind=chats'); await expect(page.getByText('Đang tải phiên tư vấn…', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click(); await expect(page).toHaveURL(/\/login/); options.owner = 72; options.chats = [];
  await page.getByLabel('Email trường hoặc cá nhân').fill('b@example.test'); await page.getByLabel('Mật khẩu', { exact: true }).fill('Password123!'); await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →', exact: true }).click(); release(); await page.goto('/history?kind=chats'); await expect(page.getByText('Chưa có phiên tư vấn đã lưu.', { exact: true })).toBeVisible(); await expect(page.getByRole('article')).toHaveCount(0);
});
test('keyboard source selection and result link work with visible focus', async ({ page }) => {
  await historyFixture(page); await page.goto('/history?kind=invalid&analysis=invalid'); const source = page.getByLabel('Loại lịch sử'); await expect(source).toHaveValue('tests'); await expect(page.getByLabel('Loại phân tích')).toHaveValue(''); await source.focus(); await expect(source).toBeFocused();
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await expect(source).toHaveValue('chats'); await expect(page.getByRole('article', { name: 'Phiên tư vấn #31' })).toBeVisible();
  await source.focus(); await page.keyboard.press('ArrowUp'); await page.keyboard.press('Enter'); await expect(source).toHaveValue('tests'); const link = page.getByRole('article', { name: 'Lần làm #812' }).getByRole('link', { name: 'Xem kết quả', exact: true }); await link.focus(); await expect(link).toBeFocused(); await page.keyboard.press('Enter'); await expect(page).toHaveURL(/\/assessment\/results\/812$/);
});
