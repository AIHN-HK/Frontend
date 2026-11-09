import { expect, test, type Page } from '@playwright/test';

test.use({ launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } });

async function moveThroughOpening(page: Page) {
  await page.mouse.move(1000, 240);
  await page.mouse.move(1080, 340, { steps: 10 });
}

async function instrumentGPU(page: Page) {
  await page.addInitScript(() => {
    const metrics = { draws: 0, released: 0 };
    Object.assign(window, { splashGPU: metrics });
    const draw = WebGL2RenderingContext.prototype.drawArrays;
    WebGL2RenderingContext.prototype.drawArrays = function (...args) { metrics.draws++; return draw.apply(this, args); };
    const release = WebGL2RenderingContext.prototype.deleteProgram;
    WebGL2RenderingContext.prototype.deleteProgram = function (...args) { metrics.released++; return release.apply(this, args); };
  });
}
const gpuMetrics = (page: Page) => page.evaluate(() => (window as unknown as { splashGPU: { draws: number; released: number } }).splashGPU);

test('one lazy canvas follows every Home section with readable dark and light blending', async ({ page }, info) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await instrumentGPU(page);
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const scope = page.locator('[data-home-splash-scope]'), splash = page.locator('[data-home-splash]');
  const sections = scope.locator('[data-home-surface]');
  await expect(sections).toHaveCount(10);
  await expect(splash.locator('canvas')).toHaveCount(0);
  await moveThroughOpening(page);
  await expect(splash).toHaveAttribute('data-splash-state', 'ready');
  await moveThroughOpening(page);
  await expect.poll(async () => (await gpuMetrics(page)).draws).toBeGreaterThan(0);
  await expect(splash).toHaveCSS('position', 'absolute');
  await expect(splash).toHaveCSS('pointer-events', 'none');
  await expect.poll(() => splash.evaluate(element => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0.45);
  expect(Number(await splash.evaluate(element => getComputedStyle(element).opacity))).toBeLessThanOrEqual(0.55);
  await expect(splash).toHaveCSS('mix-blend-mode', 'screen');
  expect(await splash.locator('canvas').evaluate(element => (element as HTMLCanvasElement).width <= 1440 && (element as HTMLCanvasElement).height <= 900)).toBe(true);
  const area = (await scope.boundingBox())!, layer = (await splash.boundingBox())!;
  expect(layer.y).toBe(area.y); expect(layer.height).toBe(area.height);
  await page.screenshot({ path: info.outputPath('home-splash-desktop.png') });
  const initialOpacity = await splash.evaluate(element => Number(getComputedStyle(element).opacity));
  await page.evaluate(() => window.scrollTo(0, 550));
  await expect.poll(() => splash.evaluate(element => Number(getComputedStyle(element).opacity))).toBeLessThan(initialOpacity);
  for (let index = 1; index < await sections.count(); index++) {
    const section = sections.nth(index);
    await section.evaluate(element => element.scrollIntoView({ block: 'start' }));
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    const box = (await section.boundingBox())!;
    const y = Math.min(800, Math.max(140, box.y + Math.min(280, box.height / 2)));
    await page.mouse.move(1000, y);
    await page.mouse.move(1080, y + 20, { steps: 10 });
    const surface = (await section.getAttribute('data-home-surface'))!;
    await expect(splash).toHaveAttribute('data-splash-surface', surface);
    await expect(splash).toHaveAttribute('data-splash-state', 'ready');
    await expect(splash.locator('canvas')).toHaveCount(1);
    await expect(splash).toHaveCSS('mix-blend-mode', surface === 'light' ? 'multiply' : 'screen');
    await expect.poll(() => splash.evaluate(element => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0);
    const draws = (await gpuMetrics(page)).draws;
    await expect.poll(async () => (await gpuMetrics(page)).draws).toBeGreaterThan(draws);
    if (index === 3 || index === 6) await page.screenshot({ path: info.outputPath(`home-splash-${surface}-${index}.png`) });
  }
  await page.mouse.move(1000, 40);
  await expect(splash.locator('canvas')).toHaveCount(0);
  expect((await gpuMetrics(page)).released).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('visibility, motion preference, viewport changes and navigation release the GPU session', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await instrumentGPU(page);
  await page.goto('/');
  const splash = page.locator('[data-home-splash]');
  await moveThroughOpening(page);
  await expect(splash).toHaveAttribute('data-splash-state', 'ready');
  await splash.locator('canvas').evaluate(element => (element as HTMLCanvasElement).getContext('webgl2')!.getExtension('WEBGL_lose_context')!.loseContext());
  await expect(splash.locator('canvas')).toHaveCount(0);
  await moveThroughOpening(page);
  await expect(splash).toHaveAttribute('data-splash-state', 'ready');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(splash.locator('canvas')).toHaveCount(0);
  const draws = (await gpuMetrics(page)).draws;
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect((await gpuMetrics(page)).draws).toBe(draws);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); });
  await moveThroughOpening(page);
  await expect(splash).toHaveAttribute('data-splash-state', 'ready');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(splash.locator('canvas')).toHaveCount(0);
  await expect(splash).toHaveCSS('display', 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await moveThroughOpening(page);
  await expect(splash.locator('canvas')).toHaveCount(1);
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(splash.locator('canvas')).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await moveThroughOpening(page);
  await expect(splash.locator('canvas')).toHaveCount(1);
  const released = (await gpuMetrics(page)).released;
  await page.getByRole('banner').getByRole('link', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL('/login');
  await expect(page.locator('[data-home-splash], canvas')).toHaveCount(0);
  expect((await gpuMetrics(page)).released).toBeGreaterThan(released);
});

test('large touch screens keep the static opening without a fluid engine', async ({ browser, baseURL }) => {
  const page = await browser.newPage({ baseURL, viewport: { width: 1440, height: 900 }, hasTouch: true, reducedMotion: 'no-preference' });
  try {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.mouse.move(1100, 300);
    await expect(page.locator('[data-home-splash]')).toHaveCSS('display', 'none');
    await expect(page.locator('canvas')).toHaveCount(0);
  } finally { await page.close(); }
});

for (const width of [320, 390, 768, 1024, 1440]) test(`no fluid engine for ${width === 1440 ? 'reduced motion' : `touch ${width}px`}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: width === 1440 ? 'reduce' : 'no-preference' });
  const engines: string[] = [];
  page.on('request', request => { if (/splash-cursor[.-]/.test(request.url())) engines.push(request.url()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.mouse.move(width / 2, 300);
  await expect(page.locator('[data-home-splash]')).toHaveCSS('display', 'none');
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(engines).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('WebGL unavailable keeps readable content and a working CTA', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { value: function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      return type === 'webgl2' ? null : Reflect.apply(getContext, this, [type, ...args]);
    } });
  });
  await page.goto('/');
  await moveThroughOpening(page);
  await expect(page.locator('[data-home-splash]')).toHaveAttribute('data-splash-state', 'unavailable');
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('region', { name: 'Tìm hướng đi của bạn', exact: true }).getByRole('link', { name: 'Bắt đầu', exact: true }).click();
  await expect(page).toHaveURL('/assessment');
});
