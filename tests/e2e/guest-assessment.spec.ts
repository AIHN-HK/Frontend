import { expect, test, type Page } from '@playwright/test';
import { guestFixture } from './guest-assessment.fixture';

export async function completeGuest(page: Page) {
  await page.goto('/assessment'); await page.getByRole('button', { name: 'Bắt đầu bài trắc nghiệm', exact: true }).click();
  await page.getByRole('radio', { name: 'Có — Tôi thích', exact: true }).check(); await page.getByRole('button', { name: 'Tiếp theo', exact: true }).click();
  await page.getByRole('radio', { name: 'Không — Tôi không thích', exact: true }).check(); await page.getByRole('button', { name: 'Tiếp theo', exact: true }).click();
  await page.getByRole('radio', { name: 'Không — Tôi không thích', exact: true }).check(); await page.getByRole('button', { name: 'Xem tổng kết RIASEC', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'TopCode: ISC', exact: true })).toBeVisible();
}
test('guest completes and reloads full RIASEC without registration or private writes', async ({ page }) => {
  const { calls } = await guestFixture(page); await completeGuest(page);
  await expect(page).toHaveURL('/assessment/guest-result');
  await expect(page.getByRole('region', { name: 'Điểm 6 nhóm RIASEC' })).toBeVisible();
  expect(calls.some(call => /test-session$|submit-v2$|guest-assessment\/claim$/.test(call.path))).toBe(false);
  await page.reload(); await expect(page.getByRole('heading', { name: 'TopCode: ISC' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('aihn.assessment.guest.v1'))).toBeNull();
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('aihn.assessment.guest.v1')!).answers['22'])).toBe(false);
});
test('anonymous No answer and position survive reload without another catalog', async ({ page }) => {
  const { calls } = await guestFixture(page); await page.goto('/assessment'); await page.getByRole('button', { name: 'Bắt đầu bài trắc nghiệm', exact: true }).click();
  await page.getByRole('radio', { name: 'Không — Tôi không thích', exact: true }).check(); await page.getByRole('button', { name: 'Tiếp theo', exact: true }).click();
  await page.reload(); await expect(page.getByText('Câu 2/3', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Câu trước đó' }).click(); await expect(page.getByRole('radio', { name: 'Không — Tôi không thích', exact: true })).toBeChecked();
  expect(calls.filter(call => call.path.endsWith('/guest-assessment/catalog'))).toHaveLength(1);
});
test('failed anonymous preview preserves answers and never automatically repeats', async ({ page }) => {
  const options = { previewFailure: true }; const { calls } = await guestFixture(page, options);
  await page.goto('/assessment'); await page.getByRole('button', { name: 'Bắt đầu bài trắc nghiệm', exact: true }).click();
  for (let index = 0; index < 3; index++) { await page.getByRole('radio', { name: index ? 'Không — Tôi không thích' : 'Có — Tôi thích', exact: true }).check(); if (index < 2) await page.getByRole('button', { name: 'Tiếp theo', exact: true }).click(); }
  await page.getByRole('button', { name: 'Xem tổng kết RIASEC', exact: true }).click(); await expect(page.getByRole('alert')).toBeVisible(); await page.reload();
  await expect(page.getByRole('radio', { name: 'Không — Tôi không thích', exact: true })).toBeChecked();
  expect(calls.filter(call => call.path.endsWith('/preview'))).toHaveLength(1);
  options.previewFailure = false; await page.getByRole('button', { name: 'Xem tổng kết RIASEC', exact: true }).click(); await expect(page).toHaveURL('/assessment/guest-result');
});
for (const width of [320, 390, 768, 769, 1024, 1025, 1440]) test(`guest assessment and RIASEC stay usable at ${width}px`, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.setViewportSize({ width, height: 900 }); await guestFixture(page); await completeGuest(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const link of await page.locator('main a:visible').all()) expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  if ([390, 768, 1440].includes(width)) await page.screenshot({ path: `.superpowers/guest-assessment/G02/result-${width}.png`, fullPage: true });
});
