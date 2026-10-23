import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const password = ' exact signup password ';
const submitName = 'Tiếp tục xác thực OTP →';
async function fixture(page: Page, options: { status?: number; network?: boolean; malformed?: boolean; emptyData?: boolean; delay?: Promise<void> } = {}) {
  const calls: { path: string; body: unknown }[] = [];
  await page.route('http://localhost:3000/api/v1/**', async route => {
    const request = route.request();
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } });
      return;
    }
    calls.push({ path: new URL(request.url()).pathname, body: request.postDataJSON() as unknown });
    await options.delay;
    if (options.network) { await route.abort('failed'); return; }
    const status = options.status ?? 201;
    await route.fulfill({ status, headers: { 'Access-Control-Allow-Origin': '*' }, contentType: 'application/json', body: JSON.stringify({ status, data: status === 201 && !options.emptyData ? { sent: !options.malformed } : null, message: 'OTP_Register sent successfully', errors: null }) });
  });
  return calls;
}
async function fill(page: Page) {
  await page.getByLabel('Họ và tên của bạn').fill('  Nguyễn Hoàng Nam  ');
  await page.getByLabel('Địa chỉ Email').fill('  student@example.test  ');
  await page.getByLabel('Ngày sinh').fill('2008-02-29');
  await page.getByLabel('Số điện thoại').fill(' 0901234567 ');
  await page.getByLabel('Tạo mật khẩu').fill(password);
}
async function noSecrets(page: Page) {
  const serialized = await page.evaluate(() => JSON.stringify({ url: location.href, history: history.state, local: { ...localStorage }, tab: { ...sessionStorage } }));
  expect(serialized).not.toContain(password);
  expect(serialized).not.toContain('student@example.test');
  expect(serialized).not.toContain('Nguyễn Hoàng Nam');
  expect(serialized).not.toContain('0901234567');
}

test('invalid email focuses the field and never sends OTP', async ({ page }) => {
  const calls = await fixture(page);
  await page.goto('/signup');
  await fill(page);
  await page.getByLabel('Địa chỉ Email').fill('invalid-email');
  await page.getByRole('button', { name: submitName }).click();
  await expect(page.getByLabel('Địa chỉ Email')).toBeFocused();
  await expect(page.getByLabel('Địa chỉ Email')).toHaveAttribute('aria-invalid', 'true');
  expect(calls).toEqual([]);
});

test('required birth date, phone and backend password bounds block submission', async ({ page }) => {
  const calls = await fixture(page);
  await page.goto('/signup');
  await fill(page);
  for (const [label, invalid] of [['Ngày sinh', ''], ['Ngày sinh', '2999-01-01'], ['Số điện thoại', '   '], ['Tạo mật khẩu', 'short'], ['Tạo mật khẩu', 'x'.repeat(73)]]) {
    await fill(page);
    await page.getByLabel(label!).fill(invalid!);
    await page.getByRole('button', { name: submitName }).click();
    await expect(page.getByLabel(label!)).toHaveAttribute('aria-invalid', 'true');
    await expect(page).toHaveURL(/\/signup$/);
  }
  expect(calls).toEqual([]);
});

test('sends only trimmed email, hands off without creating an account and keeps secrets only in memory', async ({ page }) => {
  const calls = await fixture(page);
  await page.goto('/login');
  await page.getByRole('link', { name: 'Đăng ký miễn phí' }).click();
  await fill(page);
  await page.getByRole('button', { name: 'Hiện mật khẩu' }).click();
  await expect(page.getByLabel('Tạo mật khẩu')).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ẩn mật khẩu' }).click();
  await page.getByRole('button', { name: submitName }).click();
  await expect(page).toHaveURL(/\/otp-verify$/);
  await expect(page.getByText('Tài khoản chưa được tạo.', { exact: false })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Xác thực tài khoản' })).toBeVisible();
  expect(calls).toEqual([{ path: '/api/v1/auth/register/send-otp', body: { email: 'student@example.test' } }]);
  await noSecrets(page);
  await page.getByRole('link', { name: 'Trở lại đăng ký' }).click();
  await expect(page.getByLabel('Tạo mật khẩu')).toHaveValue(password);
  await expect(page.getByLabel('Ngày sinh')).toHaveValue('2008-02-29');
  await expect(page.getByLabel('Số điện thoại')).toHaveValue('0901234567');
  await page.reload();
  await expect(page.getByLabel('Tạo mật khẩu')).toHaveValue('');
  await noSecrets(page);
});

for (const [name, options] of [['network', { network: true }], ['server', { status: 503 }], ['conflict', { status: 409 }], ['rate limit', { status: 429 }], ['unknown success', { malformed: true }]] as const) {
  test(`${name} failure preserves all fields, never reports success or replays`, async ({ page }) => {
    const calls = await fixture(page, options);
    await page.goto('/signup');
    await fill(page);
    await page.getByRole('button', { name: submitName }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/signup$/);
    await expect(page.getByLabel('Tạo mật khẩu')).toHaveValue(password);
    await expect(page.getByLabel('Họ và tên của bạn')).toHaveValue('  Nguyễn Hoàng Nam  ');
    await expect(page.getByLabel('Ngày sinh')).toHaveValue('2008-02-29');
    await expect(page.getByLabel('Số điện thoại')).toHaveValue(' 0901234567 ');
    await expect(page.getByRole('button', { name: submitName })).toBeEnabled();
    expect(calls).toHaveLength(1);
    await noSecrets(page);
    await page.getByRole('button', { name: submitName }).click();
    await expect.poll(() => calls.length).toBe(2);
    await expect(page.getByRole('alert')).toBeVisible();
  });
}

test('rapid click and Enter cannot submit twice; navigation discards delayed completion', async ({ page }) => {
  let release!: () => void;
  let loadLogin!: () => void;
  const loginChunk = new Promise<void>(resolve => { loadLogin = resolve; });
  await page.route('**/assets/LoginPage-*.js', async route => { await loginChunk; await route.continue(); });
  const calls = await fixture(page, { delay: new Promise<void>(resolve => { release = resolve; }) });
  await page.goto('/signup');
  await fill(page);
  await page.getByRole('button', { name: submitName }).evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
  await expect(page.getByRole('button', { name: 'Đang gửi OTP…' })).toBeDisabled();
  await page.keyboard.press('Enter');
  await expect.poll(() => calls.length).toBe(1);
  await expect(page.getByLabel('Địa chỉ Email')).toBeDisabled();
  await page.getByRole('link', { name: 'Đăng nhập ngay' }).click();
  await expect(page.getByRole('status')).toHaveText('Đang tải…');
  release();
  // The command must stop while Signup is still mounted during lazy navigation.
  await expect(page.locator('form')).toHaveAttribute('aria-busy', 'false');
  await expect(page.getByRole('button', { name: submitName })).toBeDisabled();
  loadLogin();
  await expect(page.getByRole('heading', { name: 'Đăng nhập AIHN' })).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('link', { name: 'Đăng ký miễn phí' }).click();
  await expect(page.getByLabel('Tạo mật khẩu')).toHaveValue(password);
  await noSecrets(page);
});

test('direct/reloaded OTP without a draft offers signup without inventing success', async ({ page }) => {
  const calls = await fixture(page);
  await page.goto('/verify-otp');
  await page.reload();
  await expect(page.getByText('Không có thông tin đăng ký trong tab này.', { exact: false })).toBeVisible();
  await page.getByRole('link', { name: 'Trở lại đăng ký' }).click();
  await expect(page.getByLabel('Tạo mật khẩu')).toHaveValue('');
  expect(calls).toEqual([]);
});

test('an empty success envelope reports an unknown OTP outcome and preserves the draft', async ({ page }) => {
  const calls = await fixture(page, { emptyData: true });
  await page.goto('/signup');
  await fill(page);
  await page.getByRole('button', { name: submitName }).click();
  await expect(page.getByRole('alert')).toContainText('Chưa xác nhận OTP đã được gửi');
  await expect(page.getByLabel('Tạo mật khẩu')).toHaveValue(password);
  await expect(page).toHaveURL(/\/signup$/);
  expect(calls).toHaveLength(1);
});

test('returning to the handoff after a failed retry preserves the draft without claiming OTP was sent', async ({ page }) => {
  await fixture(page);
  await page.goto('/signup');
  await fill(page);
  await page.getByRole('button', { name: submitName }).click();
  await expect(page).toHaveURL(/\/otp-verify$/);
  await page.goBack();
  await expect(page.getByLabel('Tạo mật khẩu')).toHaveValue(password);
  await fixture(page, { status: 503 });
  await page.getByRole('button', { name: submitName }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('status')).toContainText('Chưa xác nhận yêu cầu gửi OTP');
  await page.getByRole('link', { name: 'Trở lại đăng ký' }).click();
  await expect(page.getByLabel('Tạo mật khẩu')).toHaveValue(password);
});

for (const [width, height] of [[320, 844], [390, 844], [768, 1024], [769, 1024], [1024, 900], [1025, 900], [1440, 900]]) {
  test(`signup keyboard/scroll and touch targets fit ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width: width!, height: height! });
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: 'Tạo tài khoản mới' })).toBeVisible();
    await expect(page.getByLabel('Hiện tại bạn đang là')).toHaveCount(0);
    await fill(page);
    await page.getByLabel('Họ và tên của bạn').fill('Tên rất dài '.repeat(20));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const target of await page.locator('main input, main button, main a').all()) {
      const box = (await target.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
    await page.getByLabel('Họ và tên của bạn').focus();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Địa chỉ Email')).toBeFocused();
    await page.getByRole('link', { name: '← Về trang chủ' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('link', { name: '← Về trang chủ' })).toBeInViewport();
    const screenshot = info.outputPath(`signup-${width}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    await info.attach(`signup-${width}`, { path: screenshot, contentType: 'image/png' });
  });
}

test('signup dark card retains the real fields and scrolls at mobile breakpoints', async ({page}) => {
  const {reviewResponsive}=await import('./ui-sync.fixture');
  await fixture(page); await page.goto('/signup');
  await reviewResponsive(page,'P15','main>div');
});
