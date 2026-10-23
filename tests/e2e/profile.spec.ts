import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const baseProfile = { fullname: 'Học sinh A', phone: '0901234567', address: 'Hà Nội', gender: 'FEMALE', class: 12, email: 'a@example.test', age: 18 };
type Options = { getError?: boolean; getDelay?: Promise<void>; patchDelay?: Promise<void>; patchStatus?: number; patchNetwork?: boolean; malformed?: boolean; ownerId?: number; profile?: typeof baseProfile; remember?: boolean };
async function fixture(page: Page, options: Options = {}) {
  const calls: { method: string; path: string; body: unknown; authorization: string | undefined; finished: boolean }[] = [];
  await page.addInitScript(remember => (remember ? localStorage : sessionStorage).setItem('aihn.auth.v1', JSON.stringify({ version: 1, ownerId: 71, rememberMe: remember, tokens: { accessToken: 'access', refreshToken: 'refresh' } })), options.remember ?? false);
  await page.route('http://localhost:3000/api/v1/**', async route => {
    const request = route.request(), method = request.method(), path = new URL(request.url()).pathname;
    const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
    if (method === 'OPTIONS') { await route.fulfill({ status: 204, headers }); return; }
    if (path.endsWith('/users/me/avatar')) { await route.fulfill({ status: 404, headers, json: { status: 404 } }); return; }
    const call = { method, path, body: request.postDataJSON() as unknown, authorization: request.headers().authorization, finished: false }; calls.push(call);
    const user = { id: options.ownerId ?? 71, fullname: (options.profile ?? baseProfile).fullname, role: 'USER' };
    let status = 200, data: unknown = user;
    if (path.endsWith('/login')) data = { user, accessToken: 'B-access', refreshToken: 'B-refresh' };
    if (path.endsWith('/history-by-user')) data = { formattedHistory: [] };
    if (path.endsWith('/me')) {
      if (method === 'PATCH') {
        const requestOwner = options.ownerId ?? 71;
        const profileAtRequest = options.profile ?? baseProfile;
        await options.patchDelay;
        if (options.patchNetwork) { await route.abort('failed'); return; }
        status = options.patchStatus ?? 200;
        const saved = { ...profileAtRequest, ...request.postDataJSON() as object };
        if (status === 200 && !options.malformed && (options.ownerId ?? 71) === requestOwner) options.profile = saved;
        data = options.malformed ? { saved: true } : saved;
      } else { const profileAtRequest = options.profile ?? baseProfile; await options.getDelay; status = options.getError ? 503 : 200; data = profileAtRequest; }
    }
    await route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify({ status, data }) });
    call.finished = true;
  });
  return calls;
}
const save = (page: Page) => page.getByRole('button', { name: 'Lưu cập nhật', exact: true });

test('loads owned profile, saves only supported fields and reloads persisted values', async ({ page }) => {
  const calls = await fixture(page); await page.goto('/career-profile');
  await expect(page.getByLabel('Họ và tên', { exact: true })).toHaveValue('Học sinh A');
  await page.getByLabel('Họ và tên', { exact: true }).fill('  Tên mới  ');
  await page.getByLabel('Số điện thoại', { exact: true }).fill(' 0987654321 ');
  await page.getByLabel('Địa chỉ', { exact: true }).fill('  Đà Nẵng  ');
  await page.getByLabel('Giới tính', { exact: true }).selectOption('OTHER');
  await page.getByLabel('Lớp hiện tại', { exact: true }).selectOption('11');
  await save(page).click(); await expect(page.getByRole('status').filter({ hasText: 'Đã lưu cập nhật hồ sơ.' })).toBeVisible();
  const patches = calls.filter(call => call.method === 'PATCH'); expect(patches).toHaveLength(1);
  expect(patches[0]?.body).toEqual({ fullname: 'Tên mới', phone: '0987654321', address: 'Đà Nẵng', gender: 'OTHER', class: 11 });
  await expect(page.getByRole('complementary', { name: 'Tài khoản hiện tại' })).toContainText('Tên mới');
  await page.reload(); await expect(page.getByLabel('Họ và tên', { exact: true })).toHaveValue('Tên mới');
  await expect(page.getByLabel('Địa chỉ', { exact: true })).toHaveValue('Đà Nẵng');
  await page.getByRole('link', { name: 'Về Trang của tôi' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tên mới');
});

test('local field validation focuses errors and never sends PATCH', async ({ page }) => {
  const calls = await fixture(page); await page.goto('/career-profile');
  const name = page.getByLabel('Họ và tên', { exact: true }); await name.fill(' '); await save(page).click();
  await expect(name).toBeFocused(); await expect(page.getByText('Vui lòng nhập họ và tên.', { exact: true })).toBeVisible();
  await name.fill('x'.repeat(121)); await save(page).click(); await expect(page.getByText('Họ và tên tối đa 120 ký tự.')).toBeVisible();
  await name.fill('Tên hợp lệ'); await page.getByLabel('Số điện thoại', { exact: true }).fill('12345'); await save(page).click();
  await expect(page.getByText('Số điện thoại cần 10 chữ số, bắt đầu bằng 0.')).toBeVisible();
  await page.getByLabel('Số điện thoại', { exact: true }).fill('0901234567'); await page.getByLabel('Địa chỉ', { exact: true }).fill('x'.repeat(501)); await save(page).click();
  await expect(page.getByText('Địa chỉ tối đa 500 ký tự.')).toBeVisible(); expect(calls.filter(call => call.method === 'PATCH')).toHaveLength(0);
});

test('blank optional values are sent as null; career fields are unavailable and never pretend to save', async ({ page }) => {
  const calls = await fixture(page); await page.goto('/career-profile');
  await page.getByLabel('Địa chỉ', { exact: true }).fill('   '); await page.getByLabel('Giới tính', { exact: true }).selectOption(''); await page.getByLabel('Lớp hiện tại', { exact: true }).selectOption('');
  await save(page).click(); await expect(page.getByText('Đã lưu cập nhật hồ sơ.', { exact: true })).toBeVisible();
  expect(calls.find(call => call.method === 'PATCH')?.body).toEqual({ fullname: 'Học sinh A', phone: '0901234567', address: null, gender: null, class: null });
  await expect(page.getByText('Trường THPT, tổ hợp môn và nguyện vọng đại học chưa sẵn sàng.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Kỹ năng, sở thích và nghề mục tiêu' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Hồ sơ kỹ năng và mục tiêu' })).toBeVisible();
  await expect(page.getByText(/85%|Đã tự động lưu|Python cơ bản|áp dụng ngay vào thuật toán/)).toHaveCount(0);
  expect(calls.filter(call => call.method === 'PATCH')).toHaveLength(1);
});

test('GET error can be retried and initializes an editable draft', async ({ page }) => {
  const options = { getError: true }; const calls = await fixture(page, options); await page.goto('/career-profile');
  await expect(page.getByText('Không tải được hồ sơ.')).toBeVisible(); await expect(save(page)).toHaveCount(0);
  options.getError = false; await page.getByRole('button', { name: 'Thử lại hồ sơ' }).click();
  await expect(page.getByLabel('Họ và tên', { exact: true })).toHaveValue('Học sinh A');
  await page.getByLabel('Họ và tên', { exact: true }).fill('Draft sau retry'); await save(page).click();
  await expect(page.getByText('Đã lưu cập nhật hồ sơ.', { exact: true })).toBeVisible(); expect(calls.filter(call => call.method === 'PATCH')).toHaveLength(1);
});

for (const failure of ['503', '400', 'network', 'malformed'] as const) {
  test(`save ${failure} keeps the draft, avoids replay and allows server comparison`, async ({ page }) => {
    const options: Options = { patchStatus: failure === '503' ? 503 : failure === '400' ? 400 : 200, patchNetwork: failure === 'network', malformed: failure === 'malformed' };
    const calls = await fixture(page, options); await page.goto('/career-profile');
    await page.getByLabel('Họ và tên', { exact: true }).fill('Draft chưa xác nhận'); await save(page).click();
    await expect(page.locator('form.career-profile-card').getByRole('alert')).toBeVisible(); await expect(page.getByLabel('Họ và tên', { exact: true })).toHaveValue('Draft chưa xác nhận');
    expect(calls.filter(call => call.method === 'PATCH')).toHaveLength(1);
    await page.getByRole('button', { name: 'Kiểm tra dữ liệu đã lưu' }).click();
    await expect(page.getByRole('region', { name: 'Dữ liệu đã lưu trên máy chủ' })).toContainText('Học sinh A');
    await expect(page.getByLabel('Họ và tên', { exact: true })).toHaveValue('Draft chưa xác nhận');
    expect(calls.filter(call => call.method === 'PATCH')).toHaveLength(1);
    options.patchStatus = 200; options.patchNetwork = false; options.malformed = false;
    await save(page).click(); await expect(page.getByText('Đã lưu cập nhật hồ sơ.', { exact: true })).toBeVisible(); expect(calls.filter(call => call.method === 'PATCH')).toHaveLength(2);
  });
}

test('real transport timeout preserves the draft and requires explicit review or retry', async ({ page }) => {
  test.setTimeout(25_000); let release!: () => void;
  const options = { patchDelay: new Promise<void>(resolve => { release = resolve; }) };
  const calls = await fixture(page, options); await page.goto('/career-profile');
  await page.getByLabel('Họ và tên', { exact: true }).fill('Draft timeout'); await save(page).click();
  await expect(page.locator('form.career-profile-card').getByRole('alert')).toContainText('Chưa xác nhận', { timeout: 15_000 });
  await expect(page.getByLabel('Họ và tên', { exact: true })).toHaveValue('Draft timeout'); expect(calls.filter(call => call.method === 'PATCH')).toHaveLength(1);
  release();
});

test('rapid submit is single-flight; navigation preserves uncertain draft and ignores late success', async ({ page }) => {
  let release!: () => void; const options: Options = { patchDelay: new Promise<void>(resolve => { release = resolve; }) };
  const calls = await fixture(page, options); await page.goto('/career-profile'); await page.getByLabel('Họ và tên', { exact: true }).fill('Draft sau navigation');
  await save(page).click(); await expect(page.getByRole('button', { name: 'Đang lưu…' })).toBeDisabled();
  await expect(page.getByLabel('Họ và tên', { exact: true })).toBeDisabled();
  await page.getByLabel('Họ và tên', { exact: true }).press('Enter'); expect(calls.filter(call => call.method === 'PATCH')).toHaveLength(1);
  await page.getByRole('link', { name: 'Về Trang của tôi' }).click(); await expect(page).toHaveURL(/\/dashboard$/);
  release(); await page.getByRole('link', { name: 'Xem hồ sơ', exact: true }).click();
  await expect(page.getByLabel('Họ và tên', { exact: true })).toHaveValue('Draft sau navigation');
  await expect(page.locator('form.career-profile-card').getByRole('alert')).toContainText('chưa được xác nhận');
  await expect(page.getByText('Đã lưu cập nhật hồ sơ.', { exact: true })).toHaveCount(0);
});

test('PATCH 401 logs out without refresh or mutation replay and clears owner draft', async ({ page }) => {
  const calls = await fixture(page, { patchStatus: 401 }); await page.goto('/career-profile'); await page.getByLabel('Họ và tên', { exact: true }).fill('Draft A'); await save(page).click();
  await expect(page).toHaveURL(/\/login/); expect(calls.filter(call => call.method === 'PATCH')).toHaveLength(1); expect(calls.filter(call => call.path.endsWith('/refresh'))).toHaveLength(0);
  await expect(page.getByText('Draft A', { exact: true })).toHaveCount(0);
});

test('unsaved edits survive route remount and server review does not replace them without a choice', async ({ page }) => {
  const calls = await fixture(page); await page.goto('/career-profile');
  await page.getByLabel('Họ và tên', { exact: true }).fill('Draft chưa gửi');
  await page.getByRole('link', { name: 'Về Trang của tôi' }).click(); await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole('link', { name: 'Xem hồ sơ', exact: true }).click(); await expect(page.getByLabel('Họ và tên', { exact: true })).toHaveValue('Draft chưa gửi');
  await page.getByRole('button', { name: 'Kiểm tra dữ liệu đã lưu' }).click();
  await expect(page.getByRole('region', { name: 'Dữ liệu đã lưu trên máy chủ' })).toContainText('Học sinh A');
  await expect(page.getByLabel('Họ và tên', { exact: true })).toHaveValue('Draft chưa gửi');
  await page.getByRole('button', { name: 'Thay bản nháp bằng dữ liệu đã lưu' }).click(); await expect(page.getByLabel('Họ và tên', { exact: true })).toHaveValue('Học sinh A');
  expect(calls.filter(call => call.method === 'PATCH')).toHaveLength(0);
});

test('background read failure while reviewing keeps the form and draft available', async ({ page }) => {
  const options: Options = {}; await fixture(page, options); await page.goto('/career-profile');
  await page.getByLabel('Họ và tên', { exact: true }).fill('Draft trong lúc GET lỗi');
  options.getError = true; await page.getByRole('button', { name: 'Kiểm tra dữ liệu đã lưu' }).click();
  await expect(page.locator('form.career-profile-card').getByRole('alert')).toContainText('Không tải được dữ liệu đã lưu');
  await expect(page.getByLabel('Họ và tên', { exact: true })).toHaveValue('Draft trong lúc GET lỗi'); await expect(save(page)).toBeEnabled();
  options.getError = false; await page.getByRole('button', { name: 'Kiểm tra dữ liệu đã lưu' }).click(); await expect(page.getByRole('region', { name: 'Dữ liệu đã lưu trên máy chủ' })).toBeVisible();
});

test('a stale background GET cannot replace the profile cache after successful PATCH', async ({ page }) => {
  const options: Options = {}; const calls = await fixture(page, options); await page.goto('/career-profile');
  await expect(page.getByLabel('Họ và tên', { exact: true })).toHaveValue('Học sinh A');
  let release!: () => void; options.getDelay = new Promise<void>(resolve => { release = resolve; });
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }); window.dispatchEvent(new Event('visibilitychange')); Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' }); window.dispatchEvent(new Event('visibilitychange')); });
  await expect.poll(() => calls.filter(call => call.method === 'GET' && call.path.endsWith('/me')).length).toBe(2);
  const stale = calls.filter(call => call.method === 'GET' && call.path.endsWith('/me'))[1]!;
  options.getDelay = undefined; await page.getByLabel('Họ và tên', { exact: true }).fill('Tên sau PATCH'); await save(page).click();
  await expect(page.getByText('Đã lưu cập nhật hồ sơ.', { exact: true })).toBeVisible(); release(); await expect.poll(() => stale.finished).toBe(true);
  let releaseDashboard!: () => void; options.getDelay = new Promise<void>(resolve => { releaseDashboard = resolve; });
  await page.getByRole('link', { name: 'Về Trang của tôi' }).click(); await expect(page.getByRole('heading', { level: 1 })).toContainText('Tên sau PATCH'); releaseDashboard();
});

test('long metadata and maximum-length draft fit a small screen and save stays visible and unobstructed', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await fixture(page, { profile: { ...baseProfile, email: 'long'.repeat(40) + '@example.test' } }); await page.goto('/career-profile');
  await page.getByLabel('Họ và tên', { exact: true }).fill('x'.repeat(120)); await page.getByLabel('Địa chỉ', { exact: true }).fill('x'.repeat(500));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await save(page).scrollIntoViewIfNeeded();
  await expect(save(page)).toBeInViewport();
  expect(await save(page).evaluate(element => {
    const box = element.getBoundingClientRect();
    const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    return box.bottom <= innerHeight && hit !== null && element.contains(hit);
  })).toBe(true);
});

test('account switch during PATCH cannot update B profile or carry A draft', async ({ page }) => {
  let release!: () => void; const options: Options = { remember: true, patchDelay: new Promise<void>(resolve => { release = resolve; }) };
  const calls = await fixture(page, options); await page.goto('/career-profile'); await page.getByLabel('Họ và tên', { exact: true }).fill('Draft A'); await save(page).click();
  await page.evaluate(() => { localStorage.removeItem('aihn.auth.v1'); window.dispatchEvent(new StorageEvent('storage', { key: 'aihn.auth.v1', storageArea: localStorage })); });
  await expect(page).toHaveURL(/\/login/); release();
  options.ownerId = 72; options.profile = { ...baseProfile, fullname: 'Học sinh B', email: 'b@example.test' }; options.patchDelay = undefined;
  await page.getByLabel('Email trường hoặc cá nhân').fill('b@example.test'); await page.getByLabel('Mật khẩu', { exact: true }).fill('b-password'); await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →' }).click();
  await expect(page).toHaveURL(/\/career-profile$/); await expect(page.getByLabel('Họ và tên', { exact: true })).toHaveValue('Học sinh B');
  expect(calls.filter(call => call.method === 'PATCH')).toHaveLength(1); await expect(page.getByText('Draft A', { exact: true })).toHaveCount(0);
});

for (const width of [320, 390, 768, 769, 1024, 1025, 1440]) {
  test(`profile fits ${width}px and exposes keyboard/touch controls`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 }); await fixture(page); await page.goto('/career-profile');
    await expect(page.getByLabel('Họ và tên', { exact: true })).toHaveValue('Học sinh A');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const node of [...await page.getByRole('button').all(), ...await page.getByRole('link').all(), ...await page.getByRole('textbox').all(), ...await page.getByRole('combobox').all()]) {
      if (!await node.isVisible() || await node.getAttribute('class') === 'skip-link') continue;
      const box = (await node.boundingBox())!; expect(box.height).toBeGreaterThanOrEqual(44); expect(box.width).toBeGreaterThanOrEqual(44);
    }
    await page.getByLabel('Họ và tên', { exact: true }).focus(); await page.keyboard.press('Tab'); await expect(page.getByLabel('Số điện thoại', { exact: true })).toBeFocused();
  });
}
