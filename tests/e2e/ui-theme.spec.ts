import { expect, test } from '@playwright/test';
import { resultFixture } from './result.fixture';
import { adminFixture } from './admin.fixture';

test('entry routes by verified identity and catalog preserves the protected return URL', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/careers/15-1252.00');
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fcareers%2F15-1252.00$/);
  await resultFixture(page);
  await page.goto('/');
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('admin entry retains the admin guard and destination', async ({ page }) => {
  await adminFixture(page);
  await page.goto('/');
  await expect(page).toHaveURL(/\/admin$/);
});

for (const width of [320, 390, 768, 1024, 1025, 1440]) {
  test(`dark shell at ${width}px has one header and keyboard-accessible navigation`, async ({ page }) => {
    await resultFixture(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/assessment/results/812');
    await expect(page.getByText('TopCode: ISC', { exact: true })).toBeVisible();
    await expect(page.locator('.ce-app')).toHaveCSS('background-color', 'rgb(18, 18, 20)');
    await expect(page.getByRole('banner')).toHaveCount(1);
    await expect(page.getByRole('main')).toHaveCount(1);
    const opener = page.getByRole('button', { name: 'Mở menu phụ' });
    await opener.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('navigation', { name: 'Điều hướng bổ sung' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('navigation', { name: 'Điều hướng bổ sung' })).toHaveCount(0);
    await expect(opener).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const header = await page.getByRole('banner').boundingBox();
    expect(header?.height).toBe(64);
    await page.screenshot({ path: `.superpowers/ui-sync/P01/shell-${width}.png` });
  });
}
