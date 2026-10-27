import { expect, test } from '@playwright/test';
import { completeGuest, guestFixture } from './guest-assessment.fixture';
import { resultFixture } from './result.fixture';
import { careerPlatformFixture } from './career-platform.fixture';
import { advisorFixture } from './advisor.fixture';

test('Holland keyboard choices and interruptible transitions preserve Boolean drafts', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const { calls } = await guestFixture(page);
  await page.goto('/assessment');
  await page.getByRole('button', { name: 'Bắt đầu bài trắc nghiệm', exact: true }).click();
  await page.getByRole('radio', { name: 'Có — Tôi thích', exact: true }).focus();
  await page.keyboard.press('1');
  await expect(page.getByRole('radio', { name: 'Có — Tôi thích', exact: true })).toBeChecked();
  await page.keyboard.press('Alt+ArrowRight');
  await expect(page.getByText('Câu 2/3', { exact: true })).toBeVisible();
  await page.keyboard.press('2');
  await expect(page.getByRole('radio', { name: 'Không — Tôi không thích', exact: true })).toBeChecked();
  await expect(page.getByRole('radio')).toHaveCount(2);
  await expect(page.locator('.holland-choice')).toHaveCount(2);
  await page.keyboard.press('Alt+ArrowLeft');
  await expect(page.getByRole('radio', { name: 'Có — Tôi thích', exact: true })).toBeChecked();
  await page.reload();
  await expect(page.getByRole('radio', { name: 'Có — Tôi thích', exact: true })).toBeChecked();
  expect(calls.filter(call => call.method === 'POST')).toEqual([]);
  expect(errors).toEqual([]);
});

test('Holland live reduced motion settles question/progress and hidden tabs pause atmosphere', async ({ page }) => {
  await guestFixture(page);
  await page.goto('/assessment');
  const background = page.locator('[data-holland-atmosphere]');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(background).toHaveAttribute('data-paused', 'true');
  await expect(background.locator(':scope>div')).toHaveCSS('animation-play-state', 'paused');
  await page.evaluate(() => { Reflect.deleteProperty(document, 'hidden'); document.dispatchEvent(new Event('visibilitychange')); });
  await page.getByRole('button', { name: 'Bắt đầu bài trắc nghiệm', exact: true }).click();
  await page.getByRole('radio', { name: 'Có — Tôi thích', exact: true }).focus();
  await page.keyboard.press('1'); await page.keyboard.press('Alt+ArrowRight');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-question-transition]>[inert]')).toHaveCount(0);
  await expect(page.locator('[data-question-transition]>div:not([aria-hidden])')).toHaveCSS('transform', 'none');
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  await expect.poll(() => page.getByRole('progressbar').locator('span').evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).a)).toBeCloseTo(1 / 3, 3);
  await expect(page.getByRole('radio')).toHaveCount(2);
  await expect(background.locator(':scope>div')).toHaveCSS('animation-name', 'none');
});

test('processing lasts only for the real request and success never claims a guest account save', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { calls } = await guestFixture(page);
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/guest-assessment/preview', async route => { await held; await route.fallback(); });
  const completion = completeGuest(page);
  try {
    await expect(page.getByRole('status', { name: 'AIHN đang xử lý bài làm', exact: true })).toContainText('đang tổng hợp kết quả');
    await expect(page.getByRole('status', { name: 'AIHN đang xử lý bài làm', exact: true })).toBeInViewport();
    await expect(page.getByRole('complementary', { name: 'Tiến trình', exact: true }).getByRole('listitem').filter({ hasText: 'Hoàn thành' })).toHaveAttribute('aria-current', 'step');
    await expect(page.getByRole('button', { name: 'Đang tổng kết…', exact: true })).toBeDisabled();
    await expect(page.getByRole('heading', { name: 'TopCode: ISC', exact: true })).toHaveCount(0);
  } finally { release(); }
  await completion;
  await expect(page.getByRole('status', { name: 'AIHN đang xử lý bài làm', exact: true })).toHaveCount(0);
  await expect(page.getByText('Kết quả chưa lưu vào tài khoản.', { exact: false })).toBeVisible();
  expect(calls.filter(call => call.path.endsWith('/guest-assessment/preview'))).toHaveLength(1);
  expect(calls.some(call => /claim|submit-v2|test-session$/.test(call.path))).toBe(false);
});

test('result SVG uses real coordinates, settles on live reduced motion and supports late sections', async ({ page }) => {
  await resultFixture(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/assessment/results/812');
  const polygon = page.locator('svg:visible [data-radar-values]').first();
  await expect(polygon).toBeVisible();
  const final = await polygon.getAttribute('points');
  expect(final).not.toBe(Array(6).fill('75,75').join(' '));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => polygon.getAttribute('points')).not.toBe(final);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(polygon).toHaveAttribute('points', final!);
  await expect(page.getByRole('heading', { name: 'TopCode: ISC', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Xem gợi ý nghề nghiệp', exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('link', { name: 'Xem gợi ý nghề nghiệp', exact: true })).toBeVisible();
});

test('career reasoning is a hover enhancement with persistent keyboard disclosure and real scores', async ({ page }) => {
  const { calls } = await careerPlatformFixture(page);
  await page.goto('/recommendations');
  await page.getByRole('button', { name: 'Tạo gợi ý nghề', exact: true }).click();
  const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '1. Software Developers', exact: true }) });
  const summary = card.locator('summary').filter({ hasText: 'Vì sao phù hợp' });
  const disclosure = summary.locator('..');
  await summary.hover(); await expect(disclosure).toHaveAttribute('open', '');
  await expect(disclosure).toContainText('80.0');
  await page.mouse.move(0, 0); await expect(disclosure).not.toHaveAttribute('open');
  await summary.focus(); await page.keyboard.press('Enter');
  await expect(disclosure).toHaveAttribute('open', '');
  await expect(disclosure.locator('li')).toBeVisible();
  await page.keyboard.press('Enter'); await expect(disclosure).not.toHaveAttribute('open');
  await expect(card.getByRole('img', { name: '80.0 / 100', exact: true })).toHaveText('80.0 / 100');
  expect(calls.filter(call => call.method === 'POST')).toHaveLength(1);
});

test('Advisor welcome is local and streamed tokens do not restart message entrance', async ({ page }) => {
  const fixture = await advisorFixture(page, { mode: 'waiting' });
  await page.goto('/advisor');
  await expect(page.locator('.advisor-empty [data-lottie-kind=advisor]')).toHaveAttribute('data-lottie-status', 'playing');
  expect(fixture.commands).toEqual([]); expect(fixture.sockets).toHaveLength(0);
  await page.getByRole('button', { name: 'Kết nối hội thoại mới', exact: true }).click();
  await expect(page).toHaveURL(/sessionId=100/);
  await page.getByLabel('Câu hỏi của bạn', { exact: true }).fill('Tôi muốn hiểu bản thân.');
  await page.getByRole('button', { name: 'Gửi', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Đang chờ phản hồi từ AI', exact: true })).toBeVisible();
  fixture.emit('answer_token', { ...fixture.current(), content: 'Nội dung đầu tiên.' });
  const message = page.getByRole('article', { name: 'Nội dung trả lời nhận tạm', exact: true });
  await expect(message).toContainText('Nội dung đầu tiên.');
  await expect.poll(() => message.evaluate(element => element.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
  fixture.emit('answer_token', { ...fixture.current(), content: ' Nội dung tiếp theo.' });
  await expect(message).toContainText('Nội dung tiếp theo.');
  expect(await message.evaluate(element => element.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
  await expect(page.getByRole('status', { name: 'Đang chờ phản hồi từ AI', exact: true })).toHaveCount(0);
  expect(fixture.commands.filter(command => command.event === 'ask')).toHaveLength(1);
});

test('roadmap SVG reveals keep milestones tied to confirmed evidence and respect reduced motion', async ({ page }) => {
  const { calls } = await careerPlatformFixture(page, { seedProfile: true });
  await page.goto('/roadmap');
  await page.getByRole('button', { name: 'Tạo lộ trình từ mục tiêu', exact: true }).click();
  await expect(page.locator('[data-roadmap-path]')).toHaveCount(3);
  await expect(page.locator('[data-phase-state=current]')).toHaveCount(1);
  await expect(page.locator('[data-phase-state=future]')).toHaveCount(3);
  const first = page.locator('[data-phase-state]').first();
  await first.scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(first.locator('[data-roadmap-path]')).toHaveCSS('stroke-dashoffset', '0px');
  await expect(first.locator('[data-roadmap-node]')).toHaveCSS('transform', 'none');
  await expect(page.getByRole('button', { name: 'Xác nhận hoàn thành', exact: true }).nth(1)).toBeDisabled();
  await page.getByRole('textbox', { name: 'Minh chứng — Fixture roadmap explore', exact: true }).fill('Đã đọc nguồn nghề và ghi lại điều cần tìm hiểu.');
  await page.getByRole('button', { name: 'Xác nhận hoàn thành', exact: true }).first().click();
  await expect(page.locator('[data-phase-state=done]')).toHaveCount(1);
  await expect(page.locator('[data-phase-state=current]')).toHaveCount(1);
  await expect(page.getByText('1/4 nhiệm vụ hoàn thành · phiên bản 2', { exact: true })).toBeVisible();
  expect(calls.filter(call => call.method === 'PATCH')).toHaveLength(1);
});

for (const width of [320, 390, 768, 769, 1024, 1025, 1440]) test(`focused Holland question fits ${width}px with reduced desktop work`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 });
  await guestFixture(page);
  await page.goto('/assessment');
  await page.getByRole('button', { name: 'Bắt đầu bài trắc nghiệm', exact: true }).click();
  await page.getByRole('radio', { name: 'Có — Tôi thích', exact: true }).check();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const sidebar = page.getByRole('complementary', { name: 'Tiến trình', exact: true });
  await expect(sidebar).toContainText('Lộ trình trắc nghiệm');
  if (width > 1024) {
    expect((await sidebar.boundingBox())!.width).toBe(260);
    expect((await sidebar.boundingBox())!.x).toBeLessThan((await page.getByRole('heading', { level: 1 }).boundingBox())!.x);
  } else await expect(page.locator('[data-holland-atmosphere]>div')).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: info.outputPath(`holland-focus-${width}.png`), fullPage: true });
});
