import { expect, test } from '@playwright/test';
import { advisorFixture } from './advisor.fixture';
test('roadmap template reloads selected sample without pretending to save progress', async ({ page }) => {
  await page.goto('/preview/roadmap');
  await expect(page.getByRole('heading', { name: 'Chọn lộ trình mẫu' })).toBeVisible();
  await page.getByLabel('Mục tiêu mẫu').selectOption('software');
  await expect(page.getByRole('heading', { name: 'Lộ trình mẫu: Kỹ sư Phần mềm' })).toBeVisible();
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel('Mục tiêu mẫu')).toHaveValue('software');
  await page.getByLabel('Mục tiêu mẫu').selectOption('data');
  await expect(page.getByRole('heading', { name: 'Lộ trình mẫu: Kỹ sư Dữ liệu' })).toBeVisible();
  await expect(page.getByText('Thử xây dựng báo cáo dữ liệu nhỏ.')).toBeVisible();
});
test('runtime roadmap is guarded and does not invent saved goals', async ({ page }) => {
  await advisorFixture(page);
  await page.goto('/roadmap');
  await expect(page.getByRole('heading', { name: 'Lộ trình và tiến độ cá nhân' })).toBeVisible();
});
for (const width of [320, 390, 768, 769, 1024, 1025, 1440])
  test(`roadmap fits ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/preview/roadmap?target=software');
    await expect(page.getByRole('heading', { name: 'Lộ trình mẫu: Kỹ sư Phần mềm' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
