import { expect, test } from '@playwright/test';
import { advisorFixture } from './advisor.fixture';
import { careerPlatformFixture } from './career-platform.fixture';
import { completeGuest, guestFixture } from './guest-assessment.fixture';

test('public preview renders real local SVG animations without account or AI requests', async ({ page }) => {
  const external: string[] = [], api: string[] = [], errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.protocol.startsWith('http') && url.hostname !== '127.0.0.1') external.push(request.url());
    if (/\/api\/|socket\.io/.test(url.pathname)) api.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/preview/lottie');
  const robot = page.locator('[data-lottie-kind=advisor]');
  await expect(robot).toHaveAttribute('data-lottie-status', 'playing');
  await expect(robot.locator('svg')).toHaveCount(1);
  const first = await robot.locator('svg').innerHTML();
  await expect.poll(() => robot.locator('svg').innerHTML()).not.toBe(first);
  await expect(page.locator('[data-lottie-kind=complete]')).toHaveAttribute('data-lottie-status', 'complete');
  await expect(page.getByRole('heading', { name: 'Chuyển động cho AIHN', exact: true })).toBeVisible();
  expect(external).toEqual([]); expect(api).toEqual([]); expect(errors).toEqual([]);
});

test('reduced motion uses posters without loading JSON or the player and changes live', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(new URL(request.url()).pathname));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/preview/lottie');
  const robot = page.locator('[data-lottie-kind=advisor]');
  await expect(robot).toHaveAttribute('data-lottie-status', 'static');
  await expect(robot.locator('img')).toBeVisible();
  expect(requests.filter(path => /lottie_light|\/animations\/lottie\/.*\.json/.test(path))).toEqual([]);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(robot).toHaveAttribute('data-lottie-status', 'playing');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(robot).toHaveAttribute('data-lottie-status', 'static');
  await expect(robot.locator('svg')).toHaveCount(0);
  await expect(robot.locator('img')).toBeVisible();
});

test('hidden document pauses playback and the preview can explicitly return to static images', async ({ page }) => {
  await page.goto('/preview/lottie');
  const robot = page.locator('[data-lottie-kind=advisor]');
  await expect(robot).toHaveAttribute('data-lottie-status', 'playing');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(robot).toHaveAttribute('data-lottie-status', 'paused');
  await page.evaluate(() => { Reflect.deleteProperty(document, 'hidden'); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(robot).toHaveAttribute('data-lottie-status', 'playing');
  await page.getByRole('button', { name: 'Dùng hình tĩnh', exact: true }).click();
  await expect(robot).toHaveAttribute('data-lottie-status', 'static');
  await expect(page.locator('[data-lottie-kind] svg')).toHaveCount(0);
});

test('offscreen animations wait for the viewport and retain their static poster on asset failure', async ({ page }) => {
  const requests: string[] = [];
  await page.setViewportSize({ width: 390, height: 600 });
  page.on('request', request => { if (request.url().endsWith('/complete.json')) requests.push(request.url()); });
  await page.route('**/animations/lottie/complete.json', route => route.fulfill({ status: 503, body: '' }));
  await page.goto('/preview/lottie');
  const complete = page.locator('[data-lottie-kind=complete]');
  await expect(page.getByRole('heading', { name: 'Chuyển động cho AIHN' })).toBeVisible();
  expect(requests).toEqual([]);
  await complete.scrollIntoViewIfNeeded();
  await expect(complete).toHaveAttribute('data-lottie-status', 'error');
  await expect(complete.locator('img')).toBeVisible();
  await expect(complete.locator('svg')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Hoàn thành Holland', exact: true })).toBeVisible();
});

test('late animation loading is cancelled on navigation and Home never loads the runtime', async ({ page }) => {
  const requests: string[] = [], errors: string[] = [];
  page.on('request', request => requests.push(new URL(request.url()).pathname));
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Khám phá con đường');
  expect(requests.filter(path => /lottie_light|\/animations\/lottie\//.test(path))).toEqual([]);
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/animations/lottie/advisor.json', async route => {
    await held;
    try { await route.fulfill({ status: 503, body: '' }); } catch { /* cancelled animation fetch */ }
  });
  await page.goto('/preview/lottie');
  await expect(page.locator('[data-lottie-kind=advisor]')).toHaveAttribute('data-lottie-status', 'loading');
  await page.getByRole('link', { name: 'AIHN Career · Trang chủ', exact: true }).click();
  release();
  await expect(page).toHaveURL('/');
  await expect(page.locator('[data-lottie-kind]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('Advisor waiting animation stops with the first real token and never sends another question', async ({ page }) => {
  const fixture = await advisorFixture(page, { mode: 'waiting' });
  await page.goto('/advisor');
  await page.getByRole('button', { name: 'Kết nối hội thoại mới', exact: true }).click();
  await expect(page).toHaveURL(/sessionId=100/);
  await page.getByLabel('Câu hỏi của bạn', { exact: true }).fill('Em muốn khám phá nghề.');
  await page.getByRole('button', { name: 'Gửi', exact: true }).click();
  const waiting = page.getByRole('status', { name: 'Đang chờ phản hồi từ AI', exact: true });
  await expect(waiting.locator('[data-lottie-kind=advisor]')).toHaveAttribute('data-lottie-status', 'playing');
  fixture.emit('answer_token', { ...fixture.current(), content: 'Nội dung thật từ fixture máy chủ.' });
  await expect(waiting).toHaveCount(0);
  await expect(page.getByRole('log')).toContainText('Nội dung thật từ fixture máy chủ.');
  expect(fixture.commands.filter(command => command.event === 'ask')).toHaveLength(1);
});

test('catalog empty illustration appears only after a confirmed empty result', async ({ page }) => {
  await careerPlatformFixture(page, { anonymous: true });
  await page.goto('/careers?q=NoSuchOccupation');
  await expect(page.getByRole('heading', { name: 'Không có nghề phù hợp', exact: true })).toBeVisible();
  await expect(page.locator('[data-lottie-kind=empty]')).toBeVisible();
  await page.getByRole('button', { name: 'Đặt lại bộ lọc', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Software Developers', exact: true })).toBeVisible();
  await expect(page.locator('[data-lottie-kind]')).toHaveCount(0);
});

test('Holland completion remains a guest result and the success animation plays once', async ({ page }) => {
  const fixture = await guestFixture(page);
  await completeGuest(page);
  const illustration = page.locator('[data-lottie-kind=complete]');
  await expect(illustration).toHaveAttribute('data-lottie-status', 'complete');
  await expect(page.getByText(/Kết quả chưa lưu vào tài khoản/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'TopCode: ISC', exact: true })).toBeVisible();
  expect(fixture.calls.some(call => /claim|submit-v2|test-session$/.test(call.path))).toBe(false);
});

for (const width of [320, 390, 768, 1440]) test(`Lottie preview fits ${width}px and keeps readable posters and controls`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/preview/lottie');
  await expect(page.getByRole('article')).toHaveCount(3);
  for (const poster of await page.locator('[data-lottie-kind] img').all()) {
    await poster.scrollIntoViewIfNeeded();
    await expect.poll(() => poster.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await page.evaluate(async () => { window.scrollTo(0, 0); await document.fonts.ready; await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))); });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath(`lottie-${width}.png`), fullPage: true });
});
