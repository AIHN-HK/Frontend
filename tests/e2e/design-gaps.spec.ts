import { expect, test } from '@playwright/test';
import { careerPlatformFixture } from './career-platform.fixture';
test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });

for (const width of [390, 768, 1440]) test(`profile overview uses owned results and real counts at ${width}px`, async ({ page }) => {
  const { calls } = await careerPlatformFixture(page, { seedProfile: true });
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 });
  await page.goto('/career-profile');
  const overview = page.getByRole('region', { name: 'Tổng quan hành trình cá nhân' });
  await expect(overview).toContainText('Bài test hoàn thành'); await expect(overview.getByText('2', { exact: true })).toBeVisible();
  await expect(overview.getByText('0/0', { exact: true })).toBeVisible();
  await expect(overview.getByRole('link', { name: 'Mở kết quả Holland #812', exact: true })).toHaveAttribute('href', '/assessment/results/812');
  await expect(overview.getByRole('img', { name: 'Tỷ lệ Có theo nhóm RIASEC của lần làm #812', exact: true })).toBeVisible();
  await expect(overview.getByRole('complementary', { name: 'Mục tiêu đã lưu' })).toContainText('Software Developers');
  await expect(overview.locator('[data-ce-score-fill]')).toHaveCount(6);
  await page.getByRole('link', { name: 'Chỉnh sửa hồ sơ', exact: true }).click();
  await expect(page.getByLabel('Họ và tên', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(calls.filter(c => c.method !== 'GET' && c.method !== 'OPTIONS')).toHaveLength(0);
  await page.evaluate(() => { window.scrollTo(0, 0); if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
  await page.screenshot({ path: `.superpowers/ui-sync/P22/profile-${width}.png`, fullPage: true });
});

test('profile summary keeps raw result link when its snapshot is unavailable', async ({ page }) => {
  await careerPlatformFixture(page, { seedProfile: true });
  await page.route('**/api/v1/result/attempt/snapshots/812', route => route.fulfill({ status: 503, json: { status: 503 } }));
  await page.goto('/career-profile');
  const summary = page.getByLabel('Tóm tắt RIASEC lần làm #812', { exact: true });
  await expect(summary.getByText('Chưa chuẩn hóa được kết quả từ bộ câu hỏi của lần làm.')).toBeVisible();
  await expect(summary.getByRole('link', { name: 'Mở kết quả Holland #812' })).toBeVisible();
  await expect(summary.locator('[data-radar-values]')).toHaveCount(0);
  await expect(page.getByLabel('Họ và tên', { exact: true })).toBeVisible();
});

for (const route of ['/recommendations', '/recommendations/run-fixture-1?careerId=15-1252.00']) test(`saved run sidebar uses its own attempt rather than latest history on ${route}`, async ({ page }) => {
  await careerPlatformFixture(page, { seedProfile: true });
  await page.goto('/recommendations'); await page.getByRole('button', { name: 'Tạo gợi ý nghề', exact: true }).click();
  await expect(page.getByRole('heading', { name: '1. Software Developers' })).toBeVisible();
  await page.route('**/api/v1/test-session/history-by-user*', handler => handler.fulfill({ status: 200, json: { status: 200, data: { formattedHistory: [{ attemptId: 900, finishAt: '24/10/2026', analyzeType: 'NORMAL', primaryAnalyze: null }] } } }));
  await page.goto(route);
  const sidebar = page.getByRole('complementary', { name: 'Tiến trình' });
  await expect(sidebar.getByRole('img', { name: 'Tỷ lệ Có theo nhóm RIASEC của lần làm #812', exact: true })).toBeVisible();
  await expect(sidebar.getByRole('link', { name: 'Mở kết quả Holland #812' })).toHaveAttribute('href', '/assessment/results/812');
  await expect(sidebar).not.toContainText('#900');
  await expect(sidebar.locator('[data-radar-values]')).toHaveCount(1);
  await page.screenshot({ path: `.superpowers/ui-sync/P23/${route === '/recommendations' ? 'recommendations' : 'detail'}-1440.png`, fullPage: true });
});

test('roadmap sidebar reads the latest owned Holland result', async ({ page }) => {
  await careerPlatformFixture(page, { seedProfile: true }); await page.goto('/roadmap');
  const sidebar = page.getByRole('complementary', { name: 'Tiến trình' });
  await expect(sidebar.getByRole('img', { name: 'Tỷ lệ Có theo nhóm RIASEC của lần làm #812', exact: true })).toBeVisible();
  await expect(sidebar.locator('[data-radar-values]')).toHaveCount(1);
  await page.screenshot({ path: '.superpowers/ui-sync/P23/roadmap-1440.png', fullPage: true });
});

test('a mismatched recommendation owner cannot render a run or trigger its result summary', async ({ page }) => {
  await careerPlatformFixture(page, { seedProfile: true }); await page.goto('/recommendations');
  const saved = page.waitForResponse(response => response.url().endsWith('/api/v1/career/recommendations') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Tạo gợi ý nghề', exact: true }).click();
  const envelope = await (await saved).json() as { status: number; data: { userId: number; attemptId: number } };
  envelope.data.userId = 72; envelope.data.attemptId = 999;
  await page.route('**/api/v1/career/recommendations/latest', handler => handler.fulfill({ status: 200, json: envelope }));
  const resultReads: string[] = []; page.on('request', request => { if (/\/result\/(?:999|attempt\/snapshots\/999)$/.test(new URL(request.url()).pathname)) resultReads.push(request.url()); });
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Bản gợi ý không khớp tài khoản');
  await expect(page.getByRole('heading', { name: '1. Software Developers' })).toHaveCount(0);
  await expect(page.getByRole('complementary', { name: 'Tiến trình' }).getByRole('img')).toHaveCount(0);
  expect(resultReads).toEqual([]);
});
