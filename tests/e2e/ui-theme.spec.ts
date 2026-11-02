import { expect, test } from '@playwright/test';
import { resultFixture } from './result.fixture';
import { adminFixture } from './admin.fixture';
import { careerPlatformFixture } from './career-platform.fixture';

test('one shared body size reaches Home, lazy career content and auth controls', async ({ page }) => {
  await careerPlatformFixture(page, { anonymous: true });
  const setBodySize = () => page.evaluate(() => document.documentElement.style.setProperty('--text-base', '20px'));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await setBodySize();
  await expect(page.getByRole('banner').getByRole('link', { name: 'Đăng nhập', exact: true })).toHaveCSS('font-size', '20px');

  await page.goto('/careers');
  await expect(page.getByRole('heading', { name: 'Software Developers', exact: true })).toBeVisible();
  await setBodySize();
  await expect(page.getByText('Sourced occupation description for this browser fixture.', { exact: true })).toHaveCSS('font-size', '20px');
  await expect(page.getByRole('searchbox', { name: 'Tìm nghề theo tên hoặc mô tả', exact: true })).toHaveCSS('font-size', '20px');

  await page.goto('/login');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await setBodySize();
  await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toHaveCSS('font-size', '20px');
  await expect(page.getByRole('button', { name: 'Đăng nhập', exact: true })).toHaveCSS('font-size', '20px');
});

test('Home and careers stay public while the personal target preserves its login return URL', async ({ page }) => {
  await careerPlatformFixture(page, { anonymous: true });
  await page.goto('/');
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hiểu mình trước');
  await page.goto('/careers/15-1252.00');
  await expect(page).toHaveURL('/careers/15-1252.00');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Software Developers');
  await page.getByRole('link', { name: 'Chọn làm mục tiêu', exact: true }).click();
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fcareer-profile%3Ftarget%3D15-1252\.00$/);
  await resultFixture(page);
  await page.goto('/');
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hiểu mình trước');
  await page.reload();
  await expect(page).toHaveURL('/');
  await page.getByRole('banner').getByRole('link', {name:'Đăng nhập',exact:true}).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('Home stays public for admins and login still opens their admin destination', async ({ page }) => {
  await adminFixture(page);
  await page.goto('/');
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hiểu mình trước');
  await page.reload();
  await expect(page).toHaveURL('/');
  await page.getByRole('banner').getByRole('link', {name:'Đăng nhập',exact:true}).click();
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
