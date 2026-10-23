import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const email = 'student@example.test';
const password = ' exact new password ';
type Options = { sendStatus?: number; verifyStatus?: number; resetStatus?: number; malformed?: 'send' | 'reset'; network?: 'send' | 'reset'; delay?: Promise<void>; resendStatus?: number };
async function fixture(page: Page, options: Options = {}) {
  const calls: { path: string; body: unknown }[] = [];
  await page.route('http://localhost:3000/api/v1/**', async route => {
    const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
    if (route.request().method() === 'OPTIONS') { await route.fulfill({ status: 204, headers }); return; }
    const path = new URL(route.request().url()).pathname;
    calls.push({ path, body: route.request().postDataJSON() as unknown });
    const kind = path.endsWith('/reset-password') ? 'reset' : path.endsWith('/send-otp') ? 'send' : path.endsWith('/resend-otp') ? 'resend' : 'verify';
    if (kind === 'send' || kind === 'reset') await options.delay;
    if (options.network === kind) { await route.abort('failed'); return; }
    const status = kind === 'send' ? options.sendStatus ?? 201 : kind === 'reset' ? options.resetStatus ?? 201 : kind === 'resend' ? options.resendStatus ?? 201 : options.verifyStatus ?? 201;
    const data = status !== 201 || options.malformed === kind ? null : kind === 'verify' ? true : kind === 'reset' ? { reset: true } : { sent: true };
    await route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify({ status, data, message: 'Recovery result', errors: null }) });
  });
  return calls;
}
async function start(page: Page) {
  await page.goto('/forgot-password');
  await page.getByLabel('Email tài khoản').fill(email);
  await page.getByRole('button', { name: 'Gửi mã OTP', exact: true }).click();
  await expect(page).toHaveURL(/\/otp-verify$/);
  await expect(page.getByRole('heading', { name: 'Xác thực khôi phục mật khẩu' })).toBeVisible();
}
async function verified(page: Page) {
  await start(page);
  await page.getByRole('textbox', { name: 'Chữ số 1', exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Xác nhận mã', exact: true }).click();
  await expect(page).toHaveURL(/\/reset-password$/);
}
async function fillPassword(page: Page, confirmation = password) {
  await page.getByLabel('Mật khẩu mới', { exact: true }).fill(password);
  await page.getByLabel('Xác nhận mật khẩu mới', { exact: true }).fill(confirmation);
}
async function noSecrets(page: Page) {
  const state = await page.evaluate(() => JSON.stringify({ url: location.href, history: history.state, local: { ...localStorage }, tab: { ...sessionStorage } }));
  for (const value of [email, password, '123456', 'newPassword', 'verifiedOtp']) expect(state).not.toContain(value);
}

test('invalid email prevents requests and login links open forgot', async ({ page }) => {
  const calls = await fixture(page);
  await page.goto('/login'); await page.getByRole('link', { name: 'Quên mật khẩu?' }).click();
  await page.getByLabel('Email tài khoản').fill('invalid');
  await page.getByRole('button', { name: 'Gửi mã OTP', exact: true }).click();
  await expect(page.getByText('Vui lòng nhập email hợp lệ.', { exact: true })).toBeVisible();
  expect(calls).toEqual([]);
});

test('full recovery sends exact payloads, rejects mismatch, clears credentials and returns to login', async ({ page }) => {
  const calls = await fixture(page);
  await verified(page); await fillPassword(page, 'different password');
  await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
  await expect(page.getByText('Mật khẩu xác nhận không khớp.', { exact: true })).toBeVisible();
  expect(calls).toHaveLength(2);
  await page.getByLabel('Xác nhận mật khẩu mới', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Hiện mật khẩu mới', exact: true }).click();
  await expect(page.getByLabel('Mật khẩu mới', { exact: true })).toHaveAttribute('type', 'text');
  await noSecrets(page);
  await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('status').filter({ hasText: 'Đặt lại mật khẩu thành công' })).toBeVisible();
  expect(calls).toEqual([
    { path: '/api/v1/auth/forgot-password/send-otp', body: { email } },
    { path: '/api/v1/auth/verify-forget-password-otp', body: { email, otp: '123456' } },
    { path: '/api/v1/auth/reset-password', body: { email, otp: '123456', newPassword: password } },
  ]);
  await noSecrets(page);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Thiếu thông tin xác thực' })).toBeVisible();
});

for (const options of [{ sendStatus: 409 }, { sendStatus: 429 }, { sendStatus: 503 }, { network: 'send' as const }, { malformed: 'send' as const }]) {
  test(`send failure retains email without false success or replay ${JSON.stringify(options)}`, async ({ page }) => {
    const calls = await fixture(page, options);
    await page.goto('/forgot-password'); await page.getByLabel('Email tài khoản').fill(email);
    await page.getByRole('button', { name: 'Gửi mã OTP', exact: true }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(page.getByLabel('Email tài khoản')).toHaveValue(email);
    expect(calls).toHaveLength(1); await noSecrets(page);
    if ('network' in options || 'malformed' in options || options.sendStatus === 503) {
      await expect(page.getByRole('alert')).toContainText('Chưa xác nhận');
      await page.getByRole('link', { name: 'Tôi đã nhận mã OTP' }).click();
      await expect(page.getByRole('heading', { name: 'Xác thực khôi phục mật khẩu' })).toBeVisible();
    }
  });
}

for (const options of [{ resetStatus: 401 }, { resetStatus: 409 }, { resetStatus: 429 }, { resetStatus: 503 }, { network: 'reset' as const }, { malformed: 'reset' as const }]) {
  test(`reset failure retains passwords and never replays ${JSON.stringify(options)}`, async ({ page }) => {
    const calls = await fixture(page, options);
    await verified(page); await fillPassword(page);
    await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/reset-password$/);
    await expect(page.getByLabel('Mật khẩu mới', { exact: true })).toHaveValue(password);
    await expect(page.getByLabel('Xác nhận mật khẩu mới', { exact: true })).toHaveValue(password);
    expect(calls.filter(call => call.path.endsWith('/reset-password'))).toHaveLength(1);
    await noSecrets(page);
  });
}

test('unverified, direct and refreshed reset paths reject query credentials', async ({ page }) => {
  const calls = await fixture(page);
  await page.goto('/reset-password?email=intruder@example.test&otp=654321');
  await expect(page.getByRole('heading', { name: 'Không thể đặt lại mật khẩu' })).toBeVisible();
  expect(calls).toEqual([]);
  await start(page); await page.goto('/reset-password');
  await expect(page.getByRole('heading', { name: 'Không thể đặt lại mật khẩu' })).toBeVisible();
  await verified(page); await fillPassword(page); await page.reload();
  await expect(page.getByRole('heading', { name: 'Không thể đặt lại mật khẩu' })).toBeVisible();
  expect(calls.some(call => call.path.endsWith('/reset-password'))).toBe(false);
});

test('expired OTP and local TTL cannot reset; resend uses recovery endpoint', async ({ page }) => {
  const calls = await fixture(page, { verifyStatus: 401 });
  await page.clock.install(); await start(page);
  await page.getByRole('textbox', { name: 'Chữ số 1', exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Xác nhận mã', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('hết hạn');
  await page.clock.fastForward(61_000);
  await page.getByRole('button', { name: 'Gửi lại mã qua email' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'gửi lại' })).toBeVisible();
  expect(calls.at(-1)).toEqual({ path: '/api/v1/auth/forgot-password/resend-otp', body: { email } });
  await page.clock.fastForward(601_000);
  await expect(page.getByRole('heading', { name: 'Thiếu thông tin xác thực' })).toBeVisible();
});

for (const phase of ['send', 'reset'] as const) test(`${phase} pending prevents duplicate submits and aborts on navigation`, async ({ page }) => {
  let release!: () => void;
  const options: Options = {};
  const calls = await fixture(page, options);
  if (phase === 'reset') { await verified(page); await fillPassword(page); }
  else { await page.goto('/forgot-password'); await page.getByLabel('Email tài khoản').fill(email); }
  options.delay = new Promise<void>(resolve => { release = resolve; });
  const command = page.getByRole('button', { name: phase === 'send' ? 'Gửi mã OTP' : 'Đặt lại mật khẩu', exact: true });
  await command.evaluate(element => { const form = element.closest('form')!; form.requestSubmit(); form.requestSubmit(); });
  await expect(page.getByRole('button', { name: phase === 'send' ? 'Đang gửi OTP…' : 'Đang đặt lại…' })).toBeDisabled();
  await expect.poll(() => calls.filter(call => call.path.endsWith(phase === 'send' ? '/send-otp' : '/reset-password')).length).toBe(1);
  const failed: string[] = []; page.on('requestfailed', request => { failed.push(request.url()); });
  await page.getByRole('link', { name: 'Quay lại đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/); release();
  await expect(page.getByRole('heading', { name: 'Đăng nhập AIHN' })).toBeVisible();
  await expect.poll(() => failed.length).toBeGreaterThan(0);
});

test('reset local TTL expires while typing; session change clears draft and cancels pending command', async ({ page }) => {
  const options: Options = {};
  await fixture(page, options); await page.clock.install();
  await verified(page); await fillPassword(page); await page.clock.fastForward(601_000);
  await expect(page.getByRole('heading', { name: 'Không thể đặt lại mật khẩu' })).toBeVisible();
  await verified(page); await fillPassword(page);
  let release!: () => void; options.delay = new Promise<void>(resolve => { release = resolve; });
  await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Đang đặt lại…' })).toBeDisabled();
  const failed: string[] = []; page.on('requestfailed', request => failed.push(request.url()));
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'aihn.auth.v1', newValue: null, storageArea: localStorage })));
  await expect(page.getByRole('heading', { name: 'Không thể đặt lại mật khẩu' })).toBeVisible();
  await expect.poll(() => failed.length).toBeGreaterThan(0); release();
  await noSecrets(page);
});

test('failed reset draft survives re-verification in the same tab', async ({ page }) => {
  await fixture(page, { resetStatus: 401 }); await verified(page); await fillPassword(page);
  await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('link', { name: 'Xác thực lại mã OTP' }).click();
  await page.getByRole('textbox', { name: 'Chữ số 1', exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Xác nhận mã', exact: true }).click();
  await expect(page.getByLabel('Mật khẩu mới', { exact: true })).toHaveValue(password);
});

test('send unknown retains cooldown and continuation after remount; password bounds block reset', async ({ page }) => {
  const options: Options = { network: 'send' };
  const calls = await fixture(page, options);
  await page.clock.install(); await page.goto('/forgot-password');
  await page.getByLabel('Email tài khoản').fill(email);
  await page.getByRole('button', { name: 'Gửi mã OTP', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Chưa xác nhận');
  await page.getByRole('link', { name: 'Quay lại đăng nhập' }).click();
  await page.getByRole('link', { name: 'Quên mật khẩu?' }).click();
  await expect(page.getByLabel('Email tài khoản')).toHaveValue(email);
  await expect(page.getByRole('button', { name: 'Gửi mã OTP', exact: true })).toBeDisabled();
  expect(calls).toHaveLength(1);
  await page.getByRole('link', { name: 'Tôi đã nhận mã OTP' }).click();
  await page.getByRole('textbox', { name: 'Chữ số 1', exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Xác nhận mã', exact: true }).click();
  for (const value of ['short', 'x'.repeat(73)]) {
    await page.getByLabel('Mật khẩu mới', { exact: true }).fill(value);
    await page.getByLabel('Xác nhận mật khẩu mới', { exact: true }).fill(value);
    await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
    await expect(page.locator('#reset-password-description')).toBeVisible();
  }
  expect(calls.some(call => call.path.endsWith('/reset-password'))).toBe(false);
});

test('forgot and reset cards fit viewports and keep keyboard targets at least 44px', async ({ page }) => {
  await fixture(page); await verified(page);
  for (const route of ['/reset-password', '/forgot-password']) {
    await page.getByRole('link', { name: route === '/reset-password' ? 'Xác thực lại mã OTP' : 'Quay lại đăng nhập' }).click();
    if (route === '/reset-password') { await page.getByRole('textbox', { name: 'Chữ số 1', exact: true }).fill('123456'); await page.getByRole('button', { name: 'Xác nhận mã', exact: true }).click(); }
    else await page.getByRole('link', { name: 'Quên mật khẩu?' }).click();
    await expect(page).toHaveURL(new RegExp(`${route}$`));
    await expect(page.getByRole('heading', { name: route === '/reset-password' ? 'Đặt lại mật khẩu' : 'Khôi phục mật khẩu', exact: true })).toBeVisible();
    for (const width of [320, 390, 768, 769, 1024, 1025, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const layout = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, targets: Array.from(document.querySelectorAll('main input, main button, main a')).map(el => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })) }));
      expect(layout.overflow).toBe(false);
      for (const box of layout.targets) { expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44); }
    }
  }
});

test('recovery dark cards show real verified steps and fit responsive viewports', async ({page}) => {
  const {reviewResponsive}=await import('./ui-sync.fixture');
  await fixture(page); await page.goto('/forgot-password');
  await expect(page.locator('[aria-current=step]')).toHaveText('1. Email');
  await reviewResponsive(page,'P17/forgot','main>div');
  await verified(page);
  await expect(page.locator('[aria-current=step]')).toHaveText('3. Mật khẩu');
  await reviewResponsive(page,'P17/reset','main>div');
});
