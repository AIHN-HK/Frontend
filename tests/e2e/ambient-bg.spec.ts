import { expect, test } from '@playwright/test';
import { careerPlatformFixture } from './career-platform.fixture';
import { advisorFixture } from './advisor.fixture';

test.use({ launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } });

test('career background creates one canvas and removes it on motion and viewport changes', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const metrics = { draws: 0, ink: false, peak: 0, released: 0 };
    Object.assign(window, { particlesGPU: metrics });
    const draw = WebGL2RenderingContext.prototype.drawArraysInstanced;
    WebGL2RenderingContext.prototype.drawArraysInstanced = function (...args) {
      draw.apply(this, args); metrics.draws++;
      if (metrics.peak <= 160 && metrics.draws % 20 === 0) {
        const pixels = new Uint8Array(this.drawingBufferWidth * this.drawingBufferHeight * 4);
        this.readPixels(0, 0, this.drawingBufferWidth, this.drawingBufferHeight, this.RGBA, this.UNSIGNED_BYTE, pixels);
        metrics.ink = pixels.some((value, index) => index % 4 === 3 && value > 0);
        for (let index = 0; index < pixels.length; index++) {
          if (index % 4 !== 3) metrics.peak = Math.max(metrics.peak, pixels[index]!);
        }
      }
    };
    const release = WebGL2RenderingContext.prototype.deleteProgram;
    WebGL2RenderingContext.prototype.deleteProgram = function (...args) { metrics.released++; return release.apply(this, args); };
  });
  await careerPlatformFixture(page);
  await page.goto('/careers');
  const layer = page.locator('[data-ambient-particles]');
  await expect(layer).toHaveCount(1);
  await expect(layer).toHaveAttribute('data-ambient-particles', 'career');
  await expect(layer.locator('canvas')).toHaveCount(1);
  await expect(layer).toHaveAttribute('data-particles-state', 'ready');
  await expect(layer).toHaveCSS('pointer-events', 'none');
  const metrics = () => page.evaluate(() => (window as unknown as { particlesGPU: { draws: number; ink: boolean; peak: number; released: number } }).particlesGPU);
  await expect.poll(async () => (await metrics()).ink).toBe(true);
  await expect.poll(async () => (await metrics()).peak, { timeout: 10000 }).toBeGreaterThan(160);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  const draws = (await metrics()).draws;
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect((await metrics()).draws).toBe(draws);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect.poll(async () => (await metrics()).draws).toBeGreaterThan(draws);
  await page.screenshot({ path: info.outputPath('career-particles.png') });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(layer.locator('canvas')).toHaveCount(0);
  expect((await metrics()).released).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(layer).toHaveAttribute('data-particles-state', 'ready');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(layer.locator('canvas')).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(layer).toHaveAttribute('data-particles-state', 'ready');
  await page.getByRole('banner').getByRole('link', { name: 'Trắc nghiệm Holland', exact: true }).click();
  await expect(page).toHaveURL('/assessment');
  await expect(layer).toHaveCount(1);
  await expect(layer).toHaveAttribute('data-ambient-particles', 'assessment');
});

test('assessment reduced motion creates no background canvas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await careerPlatformFixture(page);
  await page.goto('/assessment');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-ambient-particles] canvas')).toHaveCount(0);
});

test('dashboard and authenticated admin keep static backgrounds', async ({ page }) => {
  await careerPlatformFixture(page, { admin: true });
  for (const path of ['/dashboard', '/admin/careers']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('[data-ambient-particles]')).toHaveCount(0);
  }
});

test('missing WebGL keeps the career page usable without a canvas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return type === 'webgl2' ? null : Reflect.apply(get, this, [type, ...args]);
      },
    });
  });
  await careerPlatformFixture(page);
  await page.goto('/careers');
  await expect(page.locator('[data-ambient-particles]')).toHaveAttribute('data-particles-state', 'unavailable');
  await expect(page.locator('[data-ambient-particles] canvas')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Software Developers', exact: true })).toBeVisible();
});

test('advisor chat does not cover its ambient background with an opaque fill', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await advisorFixture(page);
  await page.goto('/advisor');
  await expect(page.locator('[data-ambient-particles]')).toHaveAttribute('data-particles-state', 'ready');
  await expect(page.locator('.advisor-chat')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test('holland carousel chevrons are centered SVG icons with round buttons', async ({ page }) => {
  await careerPlatformFixture(page);
  await page.goto('/assessment');
  const carousel = page.getByRole('region', { name: 'Giới thiệu bài Holland' });
  const prevBtn = carousel.getByRole('button', { name: 'Nội dung giới thiệu trước' });
  const nextBtn = carousel.getByRole('button', { name: 'Nội dung giới thiệu tiếp theo' });
  await expect(prevBtn).toBeVisible();
  await expect(nextBtn).toBeVisible();
  await expect(prevBtn.locator('svg')).toHaveCount(1);
  await expect(nextBtn.locator('svg')).toHaveCount(1);
  const prevBox = (await prevBtn.boundingBox())!;
  const prevSvgBox = (await prevBtn.locator('svg').boundingBox())!;
  const centerX = prevBox.x + prevBox.width / 2;
  const centerY = prevBox.y + prevBox.height / 2;
  const svgCenterX = prevSvgBox.x + prevSvgBox.width / 2;
  const svgCenterY = prevSvgBox.y + prevSvgBox.height / 2;
  expect(Math.abs(centerX - svgCenterX)).toBeLessThanOrEqual(1.5);
  expect(Math.abs(centerY - svgCenterY)).toBeLessThanOrEqual(1.5);
});

test('mouse movement and click burst trigger particle wake and draw updates', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const metrics = { draws: 0 };
    Object.assign(window, { particlesPointerGPU: metrics });
    const draw = WebGL2RenderingContext.prototype.drawArraysInstanced;
    WebGL2RenderingContext.prototype.drawArraysInstanced = function (...args) {
      draw.apply(this, args); metrics.draws++;
    };
  });
  await careerPlatformFixture(page);
  await page.goto('/careers');
  const metrics = () => page.evaluate(() => (window as unknown as { particlesPointerGPU: { draws: number } }).particlesPointerGPU);
  await expect.poll(async () => (await metrics()).draws).toBeGreaterThan(0);
  const beforeMove = (await metrics()).draws;
  await page.mouse.move(500, 300);
  await page.mouse.move(550, 350, { steps: 5 });
  await expect.poll(async () => (await metrics()).draws).toBeGreaterThan(beforeMove);
  const beforeClick = (await metrics()).draws;
  await page.mouse.click(600, 400);
  await expect.poll(async () => (await metrics()).draws).toBeGreaterThan(beforeClick);
});
