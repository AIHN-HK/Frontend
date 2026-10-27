import { expect, test } from '@playwright/test';
import { guestFixture, guestId, guestQuestions } from './guest-assessment.fixture';
import { radarVertices } from '@/shared/ui/ce/radar.model';

test('guest sidebar updates from the first answer, preserves No edits and survives reload', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const { calls } = await guestFixture(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/assessment');
  await page.getByRole('button', { name: 'Bắt đầu bài trắc nghiệm', exact: true }).click();
  const sidebar = page.getByRole('complementary', { name: 'Tiến trình', exact: true });
  const summary = sidebar.locator('[data-live-riasec]');
  await expect(summary.locator('[data-radar-observed]')).toHaveCount(0);
  await page.getByRole('radio', { name: 'Có — Tôi thích', exact: true }).check();
  await expect(summary.locator('[data-riasec-group=I]')).toContainText('1 Có / 1 đã trả lời · 1 câu');
  await expect(summary.locator('[data-radar-observed=I]')).not.toHaveAttribute('cx', '75');
  await expect(summary.locator('[data-radar-observed=R]')).toHaveCount(0);
  await expect(summary.locator('[data-radar-values]')).toHaveCount(0);
  await page.getByRole('radio', { name: 'Không — Tôi không thích', exact: true }).check();
  await expect(summary.locator('[data-riasec-group=I]')).toContainText('0 Có / 1 đã trả lời · 1 câu');
  await expect(summary.locator('[data-radar-observed=I]')).toHaveAttribute('cx', '75');
  await expect(summary.locator('[data-radar-observed=I]')).toHaveAttribute('cy', '75');
  await page.getByRole('button', { name: 'Tiếp theo', exact: true }).click();
  await page.getByRole('radio', { name: 'Có — Tôi thích', exact: true }).check();
  await expect(summary.locator('[data-radar-observed]')).toHaveCount(2);
  await page.reload();
  await expect(summary.locator('[data-riasec-group=I]')).toContainText('0 Có / 1 đã trả lời');
  await expect(summary.locator('[data-riasec-group=S]')).toContainText('1 Có / 1 đã trả lời');
  await expect(summary.getByRole('img')).toHaveAccessibleDescription(/I: 0%.*S: 100%/);
  await expect(summary.locator('[data-riasec-group=C]')).toBeInViewport();
  expect(calls.filter(call => call.path.endsWith('/guest-assessment/catalog'))).toHaveLength(1);
  expect(calls.filter(call => call.method === 'POST')).toEqual([]);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: info.outputPath('guest-live-riasec.png'), fullPage: true });
});

test('six answered groups draw the real complete polygon and motion preference keeps its values', async ({ page }) => {
  await guestFixture(page);
  const questions = [...guestQuestions, { id: 44, type: 'R', content: 'Làm việc với công cụ', dimension: 'INTEREST' }, { id: 55, type: 'A', content: 'Sáng tạo nghệ thuật', dimension: 'INTEREST' }, { id: 66, type: 'E', content: 'Tổ chức hoạt động', dimension: 'INTEREST' }];
  await page.route('**/guest-assessment/catalog', route => route.request().method() === 'OPTIONS' ? route.fallback() : route.fulfill({ headers: { 'Access-Control-Allow-Origin': '*' }, json: { status: 200, data: { id: guestId, catalogToken: 'signed-catalog-fixture', expiresAt: Date.now() + 86400000, questions } } }));
  await page.goto('/assessment');
  await page.getByRole('button', { name: 'Bắt đầu bài trắc nghiệm', exact: true }).click();
  for (let index = 0; index < questions.length; index++) {
    await page.getByRole('radio', { name: index % 2 === 0 ? 'Có — Tôi thích' : 'Không — Tôi không thích', exact: true }).check();
    if (index < questions.length - 1) await page.getByRole('button', { name: 'Tiếp theo', exact: true }).click();
  }
  const summary = page.locator('[data-live-riasec]');
  await expect(summary.locator('[data-radar-observed]')).toHaveCount(6);
  const polygon = summary.locator('[data-radar-values]');
  const final = radarVertices({ R: 0, I: 100, A: 100, S: 0, E: 0, C: 100 });
  await expect(polygon).toHaveAttribute('points', final);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(polygon).toHaveAttribute('points', final);
});
