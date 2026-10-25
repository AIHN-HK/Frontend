import { expect, test } from '@playwright/test';
import { guestFixture } from './guest-assessment.fixture';
import { careerPlatformFixture } from './career-platform.fixture';

test('Holland intro settles immediately when motion preference changes and survives navigation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const { calls } = await guestFixture(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/assessment');
  const title = page.getByRole('heading', { name: 'Trắc nghiệm Holland RIASEC', exact: true });
  const intro = title.locator('..');
  await expect(title).toBeVisible();
  expect(await intro.evaluate(element => getComputedStyle(element).animationDuration)).toBe('0.45s');
  // Inspect a running frame without a timing race against browser startup.
  await intro.evaluate(element => {
    const animation = element.getAnimations()[0]!;
    animation.pause(); animation.currentTime = 100;
  });
  const during = await intro.evaluate(element => Number(getComputedStyle(element).opacity));
  expect(during).toBeGreaterThan(.65); expect(during).toBeLessThan(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(intro).toHaveCSS('opacity', '1');
  await expect(intro).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: 'Bắt đầu bài trắc nghiệm', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(title).toHaveCount(0);
  const back = page.getByRole('button', { name: '← Quay lại giới thiệu', exact: true });
  await back.focus(); await page.keyboard.press('Enter');
  await expect(intro).toHaveCSS('opacity', '1');
  await expect(title).toHaveCount(1);
  expect(calls.filter(call => call.path.endsWith('/guest-assessment/catalog'))).toHaveLength(1);
  expect(calls.filter(call => call.method === 'POST')).toEqual([]);
  expect(errors).toEqual([]);
});

test('catalog spotlight follows mouse, keeps keyboard links and stops on live reduced motion', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const { calls } = await careerPlatformFixture(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/careers');
  const card = page.getByRole('article').first();
  const light = card.locator(':scope > span[aria-hidden="true"]');
  await card.hover({ position: { x: 30, y: 30 } });
  await expect(light).toHaveCSS('opacity', '1');
  await expect(light).toHaveCSS('pointer-events', 'none');
  const firstX = await card.evaluate(element => parseFloat(element.style.getPropertyValue('--spotlight-x')));
  expect(firstX).toBeGreaterThan(0);
  await card.hover({ position: { x: 60, y: 50 } });
  const secondX = await card.evaluate(element => parseFloat(element.style.getPropertyValue('--spotlight-x')));
  expect(secondX).toBeGreaterThan(firstX + 20);
  await page.screenshot({ path: info.outputPath('catalog-hover.png'), fullPage: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(light).toHaveCSS('display', 'none');
  await expect(card).toHaveCSS('transform', 'none');
  await card.hover({ position: { x: 90, y: 60 } });
  expect(await card.evaluate(element => parseFloat(element.style.getPropertyValue('--spotlight-x')))).toBe(secondX);
  await page.mouse.move(0, 0);
  await expect(card).not.toHaveAttribute('style', /spotlight-x/);
  await page.keyboard.press('Tab');
  const detail = card.getByRole('link', { name: 'Xem chi tiết nghề', exact: true });
  await detail.focus();
  await expect(detail).toBeFocused();
  await expect(detail).toHaveCSS('outline-style', 'solid');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(light).toHaveCSS('opacity', '1');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/careers/15-1252.00');
  await page.getByRole('link', { name: 'Về danh mục nghề', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(1);
  expect(calls.every(call => call.method === 'GET')).toBe(true);
  expect(errors).toEqual([]);
});

test('catalog touch fallback opens the real detail without a decorative hit target', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await careerPlatformFixture(page);
    await page.goto('/careers');
    const card = page.getByRole('article').first();
    await expect(card.locator(':scope > span[aria-hidden="true"]')).toHaveCSS('opacity', '0');
    await card.getByRole('link', { name: 'Xem chi tiết nghề', exact: true }).tap();
    await expect(page).toHaveURL('/careers/15-1252.00');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Software Developers');
  } finally { await context.close(); }
});

test('catalog keeps honest loading, error, retry and empty states', async ({ page }) => {
  await careerPlatformFixture(page);
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  let empty = false;
  await page.route('**/api/v1/careers?**', async route => {
    await held;
    await route.fulfill(empty ? { json: { data: { items: [], total: 0, page: 1, limit: 12 } } } : { status: 503, json: {} });
  });
  await page.goto('/careers');
  await expect(page.getByRole('status')).toContainText('Đang tải');
  await expect(page.getByRole('article')).toHaveCount(0);
  release();
  await expect(page.getByRole('alert')).toContainText('Không tải được dữ liệu nghề');
  empty = true;
  await page.getByRole('button', { name: 'Thử tải lại dữ liệu nghề' }).click();
  await expect(page.getByRole('heading', { name: 'Danh mục nghề chưa có dữ liệu' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
});

for (const width of [320, 390, 768, 769, 1024, 1025, 1440]) {
  test(`experiment screens preserve layout and final content at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : width === 768 ? 1024 : 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await guestFixture(page);
    await page.goto('/assessment');
    await expect(page.getByRole('heading', { name: 'Trắc nghiệm Holland RIASEC', exact: true })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    const experimentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    await page.screenshot({ path: info.outputPath(`holland-${width}.png`), fullPage: true });
    // Restore the original intro DOM to compare geometry, without hiding overflow.
    await page.getByRole('heading', { name: 'Trắc nghiệm Holland RIASEC', exact: true }).evaluate(element => {
      const intro = element.parentElement!;
      intro.replaceWith(...Array.from(intro.childNodes));
    });
    const originalWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(experimentWidth).toBe(originalWidth);
    if (width === 768) {
      info.annotations.push({ type: 'baseline', description: 'Existing Holland carousel extends 6px beyond the 768px viewport; experiment preserves original geometry.' });
    } else expect(experimentWidth).toBeLessThanOrEqual(width);
    await careerPlatformFixture(page);
    await page.goto('/careers');
    await expect(page.getByRole('article')).toHaveCount(1);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const link of await page.getByRole('article').getByRole('link').all()) {
      expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({ path: info.outputPath(`catalog-${width}.png`), fullPage: true });
  });
}
