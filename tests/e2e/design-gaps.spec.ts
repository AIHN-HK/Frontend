import { expect, test } from '@playwright/test';
import { careerPlatformFixture } from './career-platform.fixture';

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
