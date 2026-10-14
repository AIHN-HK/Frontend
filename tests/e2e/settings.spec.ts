import { expect, test } from '@playwright/test';
import { advisorFixture } from './advisor.fixture';
test.beforeEach(async ({ page }) => { await advisorFixture(page); });
test('device appearance persists, resets, isolates admin and email is read only', async ({ page }) => {
  await page.goto('/settings'); await expect(page.getByRole('heading', { name: 'Cài đặt tài khoản' })).toBeVisible();
  await page.getByLabel('Giao diện').selectOption('dark'); await page.getByLabel('Điểm nhấn').selectOption('violet');
  await page.reload(); await expect(page.getByLabel('Giao diện')).toHaveValue('dark');
  await expect(page.getByLabel('Email')).toHaveAttribute('readonly', '');
  expect(await page.locator('.workspace-shell').evaluate(el => getComputedStyle(el).getPropertyValue('--bg-app').trim().toLowerCase())).toBe('#0b0f19');
  await page.goto('/preview/admin');
  expect(await page.locator('.workspace-shell').evaluate(el => getComputedStyle(el).getPropertyValue('--bg-app').trim().toLowerCase())).toBe('#f8fafc');
  await page.goto('/settings'); await page.getByRole('button', { name: 'Khôi phục mặc định' }).click();
  await expect(page.getByLabel('Giao diện')).toHaveValue('blue');
});
test('unsupported storage safely uses defaults', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('aihn.appearance.v1', '{"version":99,"preset":"alien"}'));
  await page.goto('/settings'); await expect(page.getByLabel('Giao diện')).toHaveValue('blue');
});
for (const width of [320,390,768,769,1024,1025,1440]) test(`settings fits ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await page.goto('/settings');
  await expect(page.getByRole('heading', { name: 'Cài đặt tài khoản' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('blocked preference storage keeps controls usable and reports temporary changes', async ({ page }) => {
  await page.addInitScript(() => { const original = Storage.prototype.setItem; Storage.prototype.setItem = function(key, value) { if (key === 'aihn.appearance.v1') throw new DOMException('blocked', 'SecurityError'); return original.call(this, key, value); }; });
  await page.goto('/settings'); await page.getByLabel('Giao diện').selectOption('warm');
  await expect(page.getByRole('status')).toContainText('Đã áp dụng tạm thời');
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await expect(page).toHaveURL(/login/);
});
