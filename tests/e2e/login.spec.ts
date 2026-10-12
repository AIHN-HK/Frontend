import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const key = 'aihn.auth.v1';
async function fixture(page: Page, options: { invalid?: boolean; admin?: boolean; refreshFails?: boolean; logoutFails?: boolean; delay?: Promise<void> } = {}) {
  const calls: { path: string; body: unknown; authorization: string | undefined }[] = [];
  const user = { id: 71, fullname: 'Người dùng thử', role: options.admin ? 'ADMIN' : 'USER' };
  await page.route('http://localhost:3000/api/v1/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    if (request.method() === 'OPTIONS') { await route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } }); return; }
    calls.push({ path, body: request.postDataJSON() as unknown, authorization: request.headers().authorization });
    let status = 200, data: unknown = user;
    if (path.endsWith('/login')) { await options.delay; status = options.invalid ? 401 : 200; data = { user, accessToken: 'access', refreshToken: 'refresh' }; }
    if (path.endsWith('/refresh')) { status = options.refreshFails ? 503 : 200; data = { accessToken: 'rotated', refreshToken: 'new-refresh' }; }
    if (path.endsWith('/test-authorization')) status = request.headers().authorization === 'Bearer expired' ? 401 : options.admin ? 403 : 200;
    if (path.endsWith('/logout')) status = options.logoutFails ? 503 : 204;
    await route.fulfill({ status, headers: { 'Access-Control-Allow-Origin': '*' }, contentType: 'application/json', body: status === 204 ? '' : JSON.stringify({ status, data: status === 200 ? data : null, message: status === 401 ? 'Email hoặc mật khẩu không đúng' : 'Không thể xử lý', errors: null }) });
  });
  return calls;
}
async function fill(page: Page) {
  await page.getByLabel('Email trường hoặc cá nhân').fill('student@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill(' exact password ');
}

test('validates locally, preserves failed credentials and never enters a private page', async ({ page }) => {
  const calls = await fixture(page, { invalid: true });
  await page.goto('/login');
  await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →' }).click();
  await expect(page.getByText('Vui lòng nhập email hợp lệ.')).toBeVisible();
  await expect(page.getByLabel('Email trường hoặc cá nhân')).toBeFocused();
  expect(calls).toHaveLength(0);
  await fill(page);
  await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →' }).click();
  await expect(page.getByRole('alert')).toContainText('Email hoặc mật khẩu không đúng');
  await expect(page.getByLabel('Mật khẩu', { exact: true })).toHaveValue(' exact password ');
  await expect(page).toHaveURL(/\/login$/);
  expect(calls).toHaveLength(1);
  expect(await page.evaluate(key => localStorage.getItem(key) ?? sessionStorage.getItem(key), key)).toBeNull();
});

for (const remember of [false, true]) {
  test(`login remember=${remember} sends one request, uses the correct storage and restores on reload`, async ({ page }) => {
    let release!: () => void;
    const calls = await fixture(page, { delay: new Promise<void>(resolve => { release = resolve; }) });
    await page.goto('/login?returnTo=%2Fassessment%3Ffrom%3Dhome');
    await fill(page);
    await page.getByLabel('Ghi nhớ đăng nhập trên thiết bị này').setChecked(remember);
    await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →' }).click();
    await expect(page.getByRole('button', { name: 'Đang đăng nhập…' })).toBeDisabled();
    await page.getByLabel('Mật khẩu', { exact: true }).press('Enter');
    await expect.poll(() => calls.length).toBe(1);
    release();
    await expect(page).toHaveURL(/\/assessment\?from=home$/);
    await expect(page.getByText('Người dùng thử', { exact: true })).toBeVisible();
    const storage = await page.evaluate(key => ({ local: localStorage.getItem(key), tab: sessionStorage.getItem(key) }), key);
    expect(remember ? storage.local : storage.tab).toContain('refresh');
    expect(remember ? storage.tab : storage.local).toBeNull();
    expect(calls[0]?.body).toEqual({ email: 'student@example.test', password: ' exact password ' });
    await page.reload();
    await expect(page.getByText('Người dùng thử', { exact: true })).toBeVisible();
    expect(calls.filter(call => call.path.endsWith('/test-authorization'))).toHaveLength(1);
    const sibling = await page.context().newPage();
    await fixture(sibling); await sibling.goto('/dashboard');
    if (remember) await expect(sibling.getByText('Người dùng thử', { exact: true })).toBeVisible();
    else await expect(sibling.getByRole('heading', { name: 'Đăng nhập AIHN' })).toBeVisible();
    await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
    await expect(page).toHaveURL(/\/login/);
    expect(await page.evaluate(key => localStorage.getItem(key) ?? sessionStorage.getItem(key), key)).toBeNull();
    expect(calls.filter(call => call.path.endsWith('/logout'))).toHaveLength(1);
    await expect(sibling.getByRole('heading', { name: 'Đăng nhập AIHN' })).toBeVisible();
    await sibling.close();
  });
}

test('ADMIN defaults to admin and re-verifies its role after reload', async ({ page }) => {
  const calls = await fixture(page, { admin: true });
  await page.goto('/login?returnTo=https%3A%2F%2Fevil.test'); await fill(page);
  await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Quyền quản trị chưa được xác minh' })).toBeVisible();
  await page.reload(); await expect(page.getByText('Người dùng thử', { exact: true })).toBeVisible();
  expect(calls.some(call => call.path.endsWith('/admin/me'))).toBe(true);
});

test('refresh failure on reload ends the session after one attempt and preserves the guarded return URL', async ({ page }) => {
  const calls = await fixture(page, { refreshFails: true });
  await page.addInitScript(({ key }) => { sessionStorage.setItem(key, JSON.stringify({ version: 1, ownerId: 71, rememberMe: false, tokens: { accessToken: 'expired', refreshToken: 'refresh' } })); }, { key });
  await page.goto('/roadmap');
  await expect(page.getByRole('heading', { name: 'Đăng nhập AIHN' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Không thể khôi phục phiên');
  await expect(page).toHaveURL(/returnTo=%2Froadmap/);
  expect(calls.filter(call => call.path.endsWith('/refresh'))).toHaveLength(1);
});

test('failed server logout clears device identity and reports the unconfirmed revocation', async ({ page }) => {
  await fixture(page, { logoutFails: true }); await page.goto('/login'); await fill(page);
  await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Chưa xác nhận');
  await expect(page.getByText('Người dùng thử', { exact: true })).toHaveCount(0);
});

for (const failure of ['network', 'server'] as const) {
  test(`a ${failure} failure retains the form and waits for an explicit retry`, async ({ page }) => {
    let calls = 0;
    await page.route('http://localhost:3000/api/v1/auth/login', async route => {
      calls++;
      if (failure === 'network') await route.abort('failed');
      else await route.fulfill({ status: 503, headers: { 'Access-Control-Allow-Origin': '*' }, body: '{}' });
    });
    await page.goto('/login'); await fill(page);
    await page.getByLabel('Ghi nhớ đăng nhập trên thiết bị này').check();
    await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →' }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByLabel('Email trường hoặc cá nhân')).toHaveValue('student@example.test');
    await expect(page.getByLabel('Mật khẩu', { exact: true })).toHaveValue(' exact password ');
    await expect(page.getByLabel('Ghi nhớ đăng nhập trên thiết bị này')).toBeChecked();
    expect(calls).toBe(1);
    await expect(page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →' })).toBeEnabled();
    await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →' }).click();
    await expect.poll(() => calls).toBe(2);
  });
}

test('Login supports password visibility, keyboard and links to registered auth pages', async ({ page }) => {
  await page.goto('/login');
  const password = page.getByLabel('Mật khẩu', { exact: true });
  await expect(password).toHaveAttribute('autocomplete', 'current-password');
  await page.getByRole('button', { name: 'Hiện mật khẩu' }).click();
  await expect(password).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ẩn mật khẩu' }).click();
  await expect(password).toHaveAttribute('type', 'password');
  await page.getByRole('link', { name: 'Quên mật khẩu?' }).click(); await expect(page).toHaveURL(/\/forgot-password$/);
  await page.goto('/login'); await page.getByRole('link', { name: 'Đăng ký miễn phí' }).click(); await expect(page).toHaveURL(/\/signup$/);
});

test('Login review screenshots and touch targets at standard and boundary viewports', async ({ page }, info) => {
  for (const [width, height] of [[320, 844], [390, 844], [768, 1024], [769, 1024], [1440, 900]]) {
    await page.setViewportSize({ width: width!, height: height! }); await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Đăng nhập AIHN' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390) {
      const text = await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →' }).evaluate(node => {
        const range = document.createRange(); range.selectNodeContents(node);
        return { height: range.getBoundingClientRect().height, lineHeight: parseFloat(getComputedStyle(node).lineHeight) };
      });
      expect(text.height).toBeLessThanOrEqual(text.lineHeight * 1.1);
    }
    for (const element of [...await page.getByRole('button').all(), ...await page.getByRole('link').all()]) {
      if (!await element.isVisible() || await element.getAttribute('class') === 'skip-link') continue;
      const box = (await element.boundingBox())!; expect(box.height).toBeGreaterThanOrEqual(44); expect(box.width).toBeGreaterThanOrEqual(44);
    }
    const screenshot = info.outputPath(`login-${width}.png`);
    await page.screenshot({ path: screenshot, fullPage: true }); await info.attach(`login-${width}`, { path: screenshot, contentType: 'image/png' });
  }
});
