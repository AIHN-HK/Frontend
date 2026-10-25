import { expect, test } from '@playwright/test';
import { careerPlatformFixture } from './career-platform.fixture';
import { resultData, resultFixture, snapshotData } from './result.fixture';

test('RIASEC counters animate to saved values while exposing only the final accessible number', async ({ page }) => {
  await page.addInitScript(() => {
    const samples: { label: string | null; text: string }[] = [];
    Object.defineProperty(window, '__countUpSamples', { value: samples });
    new MutationObserver(records => {
      for (const record of records) {
        const element = record.target.nodeType === Node.TEXT_NODE ? record.target.parentElement : record.target as Element;
        const counter = element?.closest('[data-count-up]');
        if (counter) samples.push({ label: counter.getAttribute('aria-label'), text: counter.textContent ?? '' });
      }
    }).observe(document, { childList: true, characterData: true, subtree: true });
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await resultFixture(page);
  await page.goto('/assessment/results/812');
  const scores = page.getByRole('region', { name: 'Điểm 6 nhóm RIASEC' });
  const counter = scores.getByRole('img', { name: '50%', exact: true }).first();
  await counter.scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => {
    const samples = (window as unknown as { __countUpSamples: { label: string | null; text: string }[] }).__countUpSamples;
    return samples.some(sample => sample.label === '50%' && parseFloat(sample.text) > 0 && parseFloat(sample.text) < 50);
  })).toBe(true);
  await expect(counter).toHaveText('50%');
  await expect(counter.locator('span')).toHaveAttribute('aria-hidden', 'true');
  await expect(scores).toContainText('50% · 4/8 câu Có');
  await expect(scores.getByRole('img', { name: '0%', exact: true })).toHaveCount(2);
  await expect(scores.locator('[aria-live]')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const number of await scores.locator('[data-count-up]').all()) {
    await expect(number).toHaveText((await number.getAttribute('aria-label'))!);
  }
});

test('reduced motion counters update to the next attempt and leave no old score after navigation', async ({ page }) => {
  const options = {} as { result?: unknown; snapshot?: unknown };
  await resultFixture(page, options);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/assessment/results/812');
  await expect(page.getByRole('region', { name: 'Điểm 6 nhóm RIASEC' })).toContainText('50% · 4/8 câu Có');
  const values = { R: 2, I: 0, A: 3, S: 0, E: 1, C: 0 };
  options.result = resultData(813, values, 'ARE');
  options.snapshot = snapshotData(813, values, { R: 2, I: 8, A: 4, S: 6, E: 2, C: 4 }, 'ARE');
  await page.evaluate(() => { history.pushState({}, '', '/assessment/results/813'); window.dispatchEvent(new PopStateEvent('popstate')); });
  await expect(page.getByRole('heading', { name: 'TopCode: ARE', exact: true })).toBeVisible();
  const scores = page.getByRole('region', { name: 'Điểm 6 nhóm RIASEC' });
  await expect(scores).toContainText('100% · 2/2 câu Có');
  await expect(scores).not.toContainText('4/8 câu Có');
  await expect(scores.getByRole('img', { name: '100%', exact: true })).toHaveText('100%');
});

test('recommendation cards combine shared glow, exact ranking scores and a finite text sweep', async ({ page }) => {
  const fixture = await careerPlatformFixture(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/recommendations');
  await page.getByRole('button', { name: 'Tạo gợi ý nghề', exact: true }).click();
  const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '1. Software Developers', exact: true }) });
  await expect(card.locator('[data-shiny-text]')).toHaveCSS('animation-iteration-count', '1');
  await expect(card.getByRole('img', { name: '80.0 / 100', exact: true })).toHaveText('80.0 / 100');
  await card.hover({ position: { x: 40, y: 30 } });
  await expect(card.locator(':scope > span[aria-hidden="true"]')).toHaveCSS('opacity', '1');
  expect(await card.evaluate(element => parseFloat(element.style.getPropertyValue('--spotlight-x')))).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(card.locator('[data-shiny-text]')).toHaveCSS('animation-name', 'none');
  await expect(card.locator(':scope > span[aria-hidden="true"]')).toHaveCSS('display', 'none');
  const detail = card.getByRole('link', { name: 'Xem gợi ý nghề này', exact: true });
  await detail.focus();
  await expect(detail).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/recommendations/run-fixture-1?careerId=15-1252.00');
  await expect(page.getByRole('img', { name: '80.0 / 100', exact: true })).toHaveText('80.0 / 100');
  expect(fixture.calls.filter(call => call.method === 'POST')).toHaveLength(1);
});

test('Dashboard metric cards retain their regions, real zero values and working links', async ({ page }) => {
  const fixture = await careerPlatformFixture(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/dashboard');
  const summary = page.getByRole('region', { name: 'Tổng quan hành trình Dashboard', exact: true });
  await expect(summary.locator('[data-journey-metric][data-spotlight-card]')).toHaveCount(4);
  await expect(summary.getByRole('region', { name: 'Trắc nghiệm Holland', exact: true }).getByRole('img', { name: '2', exact: true })).toHaveText('2');
  await expect(summary.getByRole('region', { name: 'Nghề nghiệp gợi ý', exact: true }).getByRole('img', { name: '0', exact: true })).toHaveText('0');
  await expect(summary.getByRole('region', { name: 'Lộ trình phát triển', exact: true }).getByRole('img', { name: '0/0', exact: true })).toHaveText('0/0');
  await expect(page.locator('[data-shiny-text]')).toHaveCSS('animation-name', 'none');
  const link = summary.getByRole('link', { name: 'Xem trạng thái gợi ý', exact: true });
  await link.focus(); await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/recommendations');
  expect(fixture.calls.every(call => call.method === 'GET')).toBe(true);
});

test('missing analytics never become animated zeroes', async ({ page }) => {
  await careerPlatformFixture(page);
  await page.route('**/api/v1/career/analytics', route => route.fulfill({ status: 503, json: { message: 'fixture unavailable' } }));
  await page.goto('/dashboard');
  const summary = page.getByRole('region', { name: 'Tổng quan hành trình Dashboard', exact: true });
  await expect(summary.getByRole('heading', { name: 'Chưa tải được tổng quan hành trình', exact: true })).toBeVisible();
  await expect(summary.locator('[data-count-up]')).toHaveCount(0);
  await expect(summary.locator('[data-journey-metric] strong')).toHaveText(['—', '—', '—', '—']);
});

for (const width of [320, 390, 768, 1440]) test(`shared effects retain responsive content and contrast at ${width}px`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await careerPlatformFixture(page);
  for (const path of ['/dashboard', '/assessment/results/812', '/recommendations']) {
    await page.goto(path);
    if (path === '/recommendations') {
      await page.getByRole('button', { name: 'Tạo gợi ý nghề', exact: true }).click();
      await expect(page.getByRole('heading', { name: '1. Software Developers', exact: true })).toBeVisible();
    } else await expect(page.locator('[data-count-up]').first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath(`${path.split('/')[1]}-${width}.png`), fullPage: true });
  }
});
