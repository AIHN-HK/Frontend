import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const fields = { email: 'student@example.test', fullname: 'Nguyễn Hoàng Nam', password: ' exact signup password ', yob: '2008-02-29', phone: '0901234567' };
type Options = { status?: number; malformed?: boolean; network?: boolean; delay?: Promise<void>; resendStatus?: number };
async function fixture(page: Page, options: Options = {}) {
  const calls: { path: string; body: unknown }[] = [];
  await page.route('http://localhost:3000/api/v1/**', async route => {
    const request = route.request();
    const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
    if (request.method() === 'OPTIONS') { await route.fulfill({ status: 204, headers }); return; }
    const path = new URL(request.url()).pathname;
    calls.push({ path, body: request.postDataJSON() as unknown });
    const register = path === '/api/v1/auth/register', resend = path.endsWith('/resend-otp');
    if (register || resend) await options.delay;
    if ((register || resend) && options.network) { await route.abort('failed'); return; }
    const status = register ? options.status ?? 201 : resend ? options.resendStatus ?? 201 : 201;
    const data = status !== 201 || options.malformed && register ? null : register ? { user: { id: 7, email: fields.email, fullname: fields.fullname } } : { sent: true };
    await route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify({ status, data, message: register ? 'User registered successfully' : 'OTP_Register sent successfully', errors: null }) });
  });
  return calls;
}
async function signup(page: Page) {
  await page.goto('/signup');
  await page.getByLabel('Họ và tên của bạn').fill(fields.fullname);
  await page.getByLabel('Địa chỉ Email').fill(fields.email);
  await page.getByLabel('Ngày sinh').fill(fields.yob);
  await page.getByLabel('Số điện thoại').fill(fields.phone);
  await page.getByLabel('Tạo mật khẩu').fill(fields.password);
  await page.getByRole('button', { name: 'Tiếp tục xác thực OTP →' }).click();
  await expect(page).toHaveURL(/\/verify-otp$/);
  await expect(page.getByRole('heading', { name: 'Xác thực tài khoản' })).toBeVisible();
}
function digits(page: Page) { return page.getByRole('textbox', { name: /^Chữ số/ }); }
async function code(page: Page, value = '123456') { await digits(page).first().fill(value); }
async function noSecrets(page: Page) {
  const serialized = await page.evaluate(() => JSON.stringify({ url: location.href, history: history.state, local: { ...localStorage }, tab: { ...sessionStorage } }));
  for (const value of [fields.password, fields.email, fields.phone, '123456', 'otpCode', 'accessToken', 'refreshToken']) expect(serialized).not.toContain(value);
}

test('incomplete/non-numeric codes never submit; paste, arrows and Backspace control digits and focus', async ({ page }) => {
  const calls = await fixture(page);
  await signup(page);
  await expect(digits(page)).toHaveCount(6);
  for (let size = 1; size < 6; size++) {
    await code(page, '12345'.slice(0, size));
    await expect(page.getByRole('button', { name: 'Xác nhận đăng ký' })).toBeDisabled();
    await page.keyboard.press('Enter');
  }
  expect(calls).toHaveLength(1);
  await digits(page).first().fill('abc');
  await expect(digits(page).first()).toHaveValue('');
  await digits(page).first().evaluate(input => {
    const event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => '123456' } });
    input.dispatchEvent(event);
  });
  for (let i = 0; i < 6; i++) await expect(digits(page).nth(i)).toHaveValue(String(i + 1));
  await expect(digits(page).last()).toBeFocused();
  await page.keyboard.press('Backspace');
  await expect(digits(page).last()).toHaveValue('');
  await page.keyboard.press('Backspace');
  await expect(digits(page).nth(4)).toBeFocused();
  await expect(digits(page).nth(4)).toHaveValue('');
  await page.keyboard.press('ArrowLeft');
  await expect(digits(page).nth(3)).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(digits(page).nth(4)).toBeFocused();
  await noSecrets(page);
});

test('registration sends the exact draft once, clears it and returns to login without JWT or auto-login', async ({ page }) => {
  const calls = await fixture(page);
  await signup(page); await code(page);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('status').filter({ hasText: 'Đăng ký thành công' })).toBeVisible();
  expect(calls).toEqual([
    { path: '/api/v1/auth/register/send-otp', body: { email: fields.email } },
    { path: '/api/v1/auth/register', body: { ...fields, otpCode: '123456' } },
  ]);
  await noSecrets(page);
  await page.getByRole('link', { name: 'Đăng ký miễn phí' }).click();
  await expect(page.getByLabel('Tạo mật khẩu')).toHaveValue('');
});

for (const [name, options] of [['invalid/expired', { status: 401 }], ['conflict', { status: 409 }], ['throttled', { status: 429 }], ['server', { status: 503 }], ['network', { network: true }], ['malformed', { malformed: true }]] as const) {
  test(`${name} registration failure retains draft and supports explicit retry without replay`, async ({ page }) => {
    const calls = await fixture(page, options);
    await signup(page); await code(page);
    await page.getByRole('button', { name: 'Xác nhận đăng ký' }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    if ('status' in options && options.status === 401) await expect(page.getByRole('alert')).toContainText('không đúng hoặc đã hết hạn');
    if (name === 'server' || name === 'network' || name === 'malformed') await expect(page.getByRole('alert')).toContainText('Chưa xác nhận');
    await expect(page).toHaveURL(/\/verify-otp$/);
    await expect(page.getByRole('button', { name: 'Xác nhận đăng ký' })).toBeEnabled();
    expect(calls).toHaveLength(2);
    await noSecrets(page);
    await page.getByRole('button', { name: 'Xác nhận đăng ký' }).click();
    await expect.poll(() => calls.length).toBe(3);
    await expect(page.getByRole('alert')).toBeVisible();
    await page.getByRole('link', { name: 'Trở lại đăng ký' }).click();
    await expect(page.getByLabel('Tạo mật khẩu')).toHaveValue(fields.password);
  });
}

test('resend waits 60 seconds, survives remount and prevents duplicate/pending register requests', async ({ page }) => {
  let release!: () => void;
  const calls = await fixture(page, { delay: new Promise<void>(resolve => { release = resolve; }) });
  await page.clock.install();
  await signup(page);
  const resend = page.getByRole('button', { name: 'Gửi lại mã qua email', exact: true });
  await expect(resend).toBeDisabled();
  await page.clock.fastForward(30_000);
  await page.goBack();
  await expect(page.getByLabel('Tạo mật khẩu')).toHaveValue(fields.password);
  await page.goForward();
  await expect(resend).toBeDisabled();
  await page.clock.fastForward(31_000);
  await expect(resend).toBeEnabled();
  await code(page);
  await resend.evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
  await expect(page.getByRole('button', { name: 'Đang gửi lại…' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Xác nhận đăng ký' })).toBeDisabled();
  expect(calls).toEqual([
    { path: '/api/v1/auth/register/send-otp', body: { email: fields.email } },
    { path: '/api/v1/auth/register/resend-otp', body: { email: fields.email } },
  ]);
  release();
  await expect(page.getByRole('status').filter({ hasText: 'Máy chủ đã xác nhận yêu cầu gửi lại' })).toBeVisible();
  await expect(digits(page).first()).toHaveValue('');
  await expect(digits(page).first()).toBeFocused();
  await expect(resend).toBeDisabled();
  await noSecrets(page);
});

for (const status of [429, 503]) test(`resend ${status} retains draft and never invents sent success`, async ({ page }) => {
  const calls = await fixture(page, { resendStatus: status });
  await page.clock.install(); await signup(page);
  await page.clock.fastForward(61_000);
  await page.getByRole('button', { name: 'Gửi lại mã qua email', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Gửi lại mã qua email', exact: true })).toBeDisabled();
  expect(calls).toHaveLength(2);
  await page.getByRole('link', { name: 'Trở lại đăng ký' }).click();
  await expect(page.getByLabel('Tạo mật khẩu')).toHaveValue(fields.password);
});

test('rapid register clicks and Enter send one command; outgoing lazy navigation ignores a late success', async ({ page }) => {
  let release!: () => void, loadLogin!: () => void;
  const chunk = new Promise<void>(resolve => { loadLogin = resolve; });
  await page.route('**/assets/LoginPage-*.js', async route => { await chunk; await route.continue(); });
  const calls = await fixture(page, { delay: new Promise<void>(resolve => { release = resolve; }) });
  await signup(page); await code(page);
  await page.getByRole('button', { name: 'Xác nhận đăng ký' }).evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Đang xác nhận…' })).toBeDisabled();
  await expect(digits(page).first()).toBeDisabled();
  await page.getByRole('link', { name: 'Đăng nhập' , exact: true }).click();
  await expect(page.locator('form')).toHaveAttribute('aria-busy', 'false');
  release(); loadLogin();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Đăng ký thành công', { exact: false })).toHaveCount(0);
  expect(calls).toHaveLength(2);
  await page.getByRole('link', { name: 'Đăng ký miễn phí' }).click();
  await expect(page.getByLabel('Tạo mật khẩu')).toHaveValue(fields.password);
});

test('direct link and reload lose memory draft and never request registration', async ({ page }) => {
  const calls = await fixture(page);
  await page.goto('/verify-otp?purpose=registration&email=fake@example.test');
  await expect(page.getByText('Không có thông tin đăng ký trong tab này.', { exact: false })).toBeVisible();
  await expect(digits(page)).toHaveCount(0);
  expect(calls).toEqual([]);
  await signup(page); await code(page); await page.reload();
  await expect(page.getByText('Không có thông tin đăng ký trong tab này.', { exact: false })).toBeVisible();
  await expect(digits(page)).toHaveCount(0);
  expect(calls).toHaveLength(1);
});

test('a cross-tab session invalidation drops the draft and ignores an in-flight OTP response', async ({ page }) => {
  let release!: () => void;
  let cancelled = 0;
  page.on('requestfailed', request => { if (new URL(request.url()).pathname === '/api/v1/auth/register') cancelled++; });
  const calls = await fixture(page, { delay: new Promise<void>(resolve => { release = resolve; }) });
  await signup(page); await code(page);
  await page.getByRole('button', { name: 'Xác nhận đăng ký' }).click();
  await expect(page.getByRole('button', { name: 'Đang xác nhận…' })).toBeDisabled();
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'aihn.auth.v1', storageArea: localStorage })));
  await expect(page.getByRole('heading', { name: 'Thiếu thông tin xác thực' })).toBeVisible();
  await expect.poll(() => cancelled).toBe(1);
  release();
  await expect(page).toHaveURL(/\/verify-otp$/);
  await expect(digits(page)).toHaveCount(0);
  expect(calls).toHaveLength(2);
  await page.getByRole('link', { name: 'Trở lại đăng ký' }).click();
  await expect(page.getByLabel('Tạo mật khẩu')).toHaveValue('');
});

for (const [width, height] of [[320, 844], [390, 844], [768, 1024], [769, 1024], [1024, 900], [1025, 900], [1440, 900]]) test(`OTP keyboard/touch/no overflow at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width: width!, height: height! });
  await fixture(page); await signup(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const boxes = await Promise.all((await digits(page).all()).map(target => target.boundingBox()));
  for (let index = 1; index < boxes.length; index++) expect(boxes[index - 1]!.x + boxes[index - 1]!.width).toBeLessThanOrEqual(boxes[index]!.x);
  for (const target of await page.locator('main input, main button, main a').all()) {
    const box = (await target.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await digits(page).first().focus(); await page.keyboard.type('123456');
  await expect(digits(page).last()).toHaveValue('6');
  await expect(digits(page).last()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Xác nhận đăng ký' })).toBeFocused();
});
