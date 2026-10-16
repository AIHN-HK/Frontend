import { expect, test } from '@playwright/test';
import { adminFixture } from './admin.fixture';
test('admin overview uses server counts and preserves snapshot on failed refresh', async ({ page }) => {
  const options = { overviewStatus: 200 };
  await adminFixture(page, options);
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Tổng quan hệ thống' })).toBeVisible();
  await expect(page.getByTestId('count-students')).toHaveText('3');
  options.overviewStatus = 503;
  await page.getByRole('button', { name: 'Làm mới dữ liệu' }).click();
  await expect(page.getByRole('alert')).toContainText('Không thể làm mới');
  await expect(page.getByTestId('count-students')).toHaveText('3');
});
