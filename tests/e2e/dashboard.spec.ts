import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const result = { attemptId: 812, finishAt: '13/10/2026', analyzeType: 'NORMAL', primaryAnalyze: { code: 'ISA', title: 'Phân tích từ hồ sơ kiểm thử', description: 'Mô tả có nguồn từ kết quả kiểm thử.' } };
type Options = { profileError?: boolean; historyError?: boolean; history?: unknown; delay?: Promise<void>; remember?: boolean; ownerId?: number; fullname?: string };
async function fixture(page: Page, options: Options = {}) {
  const calls: string[] = [];
  await page.addInitScript(remember => (remember ? localStorage : sessionStorage).setItem('aihn.auth.v1', JSON.stringify({ version: 1, ownerId: 71, rememberMe: remember, tokens: { accessToken: 'access', refreshToken: 'refresh' } })), options.remember ?? false);
  await page.route('http://localhost:3000/api/v1/**', async route => {
    const path = new URL(route.request().url()).pathname;
    const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
    if (route.request().method() === 'OPTIONS') { await route.fulfill({ status: 204, headers }); return; }
    calls.push(path);
    const user = { id: options.ownerId ?? 71, fullname: options.fullname ?? 'Tài khoản A', role: 'USER' };
    let status = 200, data: unknown = user;
    if (path.endsWith('/login')) data = { user, accessToken: 'B-access', refreshToken: 'B-refresh' };
    if (path.endsWith('/me')) { await options.delay; status = options.profileError ? 503 : 200; data = { fullname: options.fullname ?? 'Học sinh kiểm thử', class: 12, phone: null, address: null, gender: null, email: 'fixture@example.test', age: 18 }; }
    if (path.endsWith('/history-by-user')) { await options.delay; status = options.historyError ? 503 : 200; data = options.history ?? { formattedHistory: [], pageInfo: { hasNext: false, nextCursor: null } }; }
    await route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify({ status, data, errors: null }) });
  });
  return calls;
}

test('new user and unfinished-only history get honest empty state and next action', async ({ page }) => {
  const calls = await fixture(page); await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Xin chào, Học sinh kiểm thử 👋' })).toBeVisible();
  await expect(page.getByText('Chưa có kết quả hoàn thành', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Chưa thể xác định bài đang làm từ dữ liệu hiện có.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Bắt đầu / tiếp tục trắc nghiệm' })).toHaveAttribute('href', '/assessment');
  expect(calls.filter(path => path.endsWith('/me'))).toHaveLength(1);
  expect(calls.filter(path => path.endsWith('/history-by-user'))).toHaveLength(1);
  await expect(page.getByText(/85%|60\/60|Hoàng Nam|12 gợi ý/)).toHaveCount(0);
  await page.reload(); await expect(page.getByRole('heading', { level: 1 })).toContainText('Học sinh kiểm thử');
});

test('latest result and snapshot use only history provenance and attempt ID', async ({ page }) => {
  await fixture(page, { history: { formattedHistory: [result], pageInfo: { hasNext: false } } }); await page.goto('/dashboard');
  await expect(page.getByText('Mã phân tích: ISA')).toBeVisible();
  await expect(page.getByText(result.primaryAnalyze.description)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Xem kết quả gần nhất', exact: true })).toHaveAttribute('href', '/assessment/results/812');
  await page.getByRole('link', { name: 'Xem kết quả gần nhất', exact: true }).click();
  await expect(page).toHaveURL(/\/assessment\/results\/812$/);
  // This fixture supplies history only; the destination must reject its missing result DTO.
  await expect(page.getByRole('heading', { name: 'Không tải được kết quả' })).toBeVisible();
});

test('null analysis still exposes the result without inventing a code', async ({ page }) => {
  await fixture(page, { history: { formattedHistory: [{ ...result, analyzeType: 'ALL_LOW', primaryAnalyze: null }] } }); await page.goto('/dashboard');
  await expect(page.getByText('Phân tích kết quả chưa sẵn sàng.')).toBeVisible();
  await expect(page.getByText(/Mã phân tích:/)).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Xem kết quả gần nhất', exact: true })).toBeVisible();
});

for (const zone of ['profile', 'history'] as const) {
  test(`${zone} failure is isolated and can be explicitly retried`, async ({ page }) => {
    const options = { profileError: zone === 'profile', historyError: zone === 'history', history: { formattedHistory: [result] } };
    const calls = await fixture(page, options); await page.goto('/dashboard');
    await expect(page.getByRole('alert').filter({ hasText: zone === 'profile' ? 'Không tải được hồ sơ' : 'Không tải được kết quả' })).toBeVisible();
    if (zone === 'profile') await expect(page.getByText('Mã phân tích: ISA')).toBeVisible();
    else await expect(page.getByRole('heading', { level: 1 })).toContainText('Học sinh kiểm thử');
    const endpoint = zone === 'profile' ? '/me' : '/history-by-user';
    const before = calls.filter(path => path.endsWith(endpoint)).length;
    options.profileError = false; options.historyError = false;
    await page.getByRole('button', { name: zone === 'profile' ? 'Thử lại hồ sơ' : 'Thử lại kết quả' }).click();
    await expect.poll(() => calls.filter(path => path.endsWith(endpoint)).length).toBeGreaterThan(before);
    await expect(page.locator('.dashboard-snapshot').getByRole('alert')).toHaveCount(0);
  });
}

test('malformed history is an error, not empty success', async ({ page }) => {
  await fixture(page, { history: { formattedHistory: [{ attemptId: -2 }] } }); await page.goto('/dashboard');
  await expect(page.getByRole('alert').filter({ hasText: 'Không tải được kết quả' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Bắt đầu / tiếp tục trắc nghiệm' })).toHaveCount(0);
});

test('tabs support arrows/Home/End and Advisor never generates fake chat', async ({ page }) => {
  await fixture(page); await page.goto('/dashboard');
  const tabs = page.getByRole('tab'); await expect(tabs).toHaveCount(3);
  await tabs.nth(0).focus(); await tabs.nth(0).press('ArrowRight');
  await expect(tabs.nth(1)).toBeFocused(); await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('Mở lộ trình để chọn mục tiêu');
  await tabs.nth(1).press('End'); await expect(page.getByRole('tabpanel')).toContainText('Mở lộ trình để xem khoảng cách kỹ năng');
  await tabs.nth(2).press('Home'); await expect(tabs.nth(0)).toBeFocused();
  await expect(page.getByRole('textbox')).toHaveCount(0);
  await page.getByRole('link', { name: 'Mở trang Cố vấn' }).click(); await expect(page).toHaveURL(/\/advisor$/);
});

test('pending reads are discarded on cross-tab logout', async ({ page }) => {
  let release!: () => void;
  await fixture(page, { remember: true, history: { formattedHistory: [result] }, delay: new Promise<void>(resolve => { release = resolve; }) });
  await page.goto('/dashboard'); await expect(page.getByText('Đang tải hồ sơ…')).toBeVisible();
  await page.evaluate(() => { localStorage.removeItem('aihn.auth.v1'); window.dispatchEvent(new StorageEvent('storage', { key: 'aihn.auth.v1', newValue: null, storageArea: localStorage })); });
  release(); await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText(/Học sinh kiểm thử|Mã phân tích: ISA/)).toHaveCount(0);
});

test('switching from A to B never exposes cached A snapshot', async ({ page }) => {
  const options: Options = { history: { formattedHistory: [result] } };
  await fixture(page, options); await page.goto('/dashboard');
  await expect(page.getByText('Mã phân tích: ISA')).toBeVisible();
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
  options.ownerId = 72; options.fullname = 'Tài khoản B'; options.history = { formattedHistory: [] };
  await page.getByLabel('Email trường hoặc cá nhân').fill('b@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('password-for-b');
  await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tài khoản B');
  await expect(page.getByText(/Học sinh kiểm thử|Mã phân tích: ISA/)).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Bắt đầu / tiếp tục trắc nghiệm' })).toBeVisible();
});

test('long profile and analysis wrap, and unavailable tabs remain keyboard accessible', async ({ page }) => {
  const description = 'Nội dung dài '.repeat(100) + 'x'.repeat(180);
  await page.setViewportSize({ width: 320, height: 844 });
  await fixture(page, { fullname: 'Tên học sinh rất dài '.repeat(15), history: { formattedHistory: [{ ...result, primaryAnalyze: { ...result.primaryAnalyze, description } }] } });
  await page.goto('/dashboard'); await expect(page.getByText(description, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const last = page.getByRole('tab', { name: 'Khoảng cách kỹ năng', exact: true });
  await last.click(); await last.focus();
  await expect(last).toHaveAttribute('aria-selected', 'true');
  await last.press('ArrowRight'); await expect(page.getByRole('tab').nth(0)).toBeFocused();
  expect(await page.getByRole('tab').nth(0).evaluate(node => getComputedStyle(node).outlineStyle)).toBe('solid');
  await page.getByRole('button', { name: 'Mở menu phụ' }).click();
  await expect(page.getByRole('navigation', { name: 'Điều hướng bổ sung' })).toBeVisible(); await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Mở menu phụ' })).toBeFocused();
});

for (const width of [320, 390, 768, 769, 1024, 1025, 1440]) {
  test(`dashboard responsive and targets at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 });
    await fixture(page, { history: { formattedHistory: [result] } }); await page.goto('/dashboard');
    await expect(page.getByText('Mã phân tích: ISA')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const column = (await page.locator('.dashboard-result').boundingBox())!;
    const detail = (await page.getByRole('link', { name: 'Xem chi tiết Holland' }).boundingBox())!;
    expect(detail.x + detail.width).toBeLessThanOrEqual(column.x + column.width + 1);
    for (const node of [...await page.getByRole('button').all(), ...await page.getByRole('link').all()]) {
      if (!await node.isVisible() || await node.getAttribute('class') === 'skip-link') continue;
      const box = (await node.boundingBox())!; expect(box.height).toBeGreaterThanOrEqual(44); expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });
}
