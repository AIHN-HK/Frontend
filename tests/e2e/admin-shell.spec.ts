import { expect, test } from '@playwright/test';
import { adminFixture } from './admin.fixture';
test('guest redirects and USER sees denial without admin shell', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/login/);
  await adminFixture(page, { role: 'USER' });
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Bạn không có quyền quản trị' })).toBeVisible();
  await expect(page.getByTestId('workspace-shell')).toHaveCount(0);
});
test('delayed admin identity never flashes overview or starts metric requests', async ({ page }) => {
  let resolve!: () => void;
  const gate = new Promise<void>((r) => (resolve = r)),
    calls = await adminFixture(page, { identityGate: gate });
  await page.goto('/admin');
  await expect(page.getByText('Đang xác minh quyền quản trị…')).toBeVisible();
  expect(calls.some((x) => x.path.endsWith('overview'))).toBe(false);
  await expect(page.getByTestId('workspace-shell')).toHaveCount(0);
  resolve();
  await expect(page.getByRole('heading', { name: 'Tổng quan hệ thống' })).toBeVisible();
});
for (const width of [320, 390, 768, 769, 1024, 1025, 1440])
  test(`admin overview fits ${width}`, async ({ page }) => {
    await adminFixture(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Tổng quan hệ thống' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
