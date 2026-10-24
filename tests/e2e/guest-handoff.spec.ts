import { expect, test, type Page } from '@playwright/test';
import { completeGuest, guestFixture } from './guest-assessment.fixture';

async function login(page: Page) {
  await page.getByLabel('Email trường hoặc cá nhân').fill('guest@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Password123!');
  await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →', exact: true }).click();
}
test('existing account automatically imports once then opens the requested AI feature', async ({ page }) => {
  const { calls } = await guestFixture(page); await completeGuest(page);
  await page.getByRole('link', { name: 'Tư vấn với AI', exact: true }).click(); await expect(page).toHaveURL(/login\?returnTo=/);
  await expect(page.getByRole('note')).toContainText('lưu bài Holland vừa làm'); await login(page);
  await expect(page).toHaveURL('/advisor');
  expect(calls.filter(call => call.path.endsWith('/guest-assessment/claim') && call.method === 'POST')).toHaveLength(1);
  expect(await page.evaluate(() => sessionStorage.getItem('aihn.assessment.guest.v1'))).toBeNull();
});
test('registration and OTP preserve the guest result and roadmap destination through login', async ({ page }) => {
  const { calls } = await guestFixture(page); await completeGuest(page);
  await page.getByRole('link', { name: 'Xây dựng lộ trình', exact: true }).click();
  await page.getByRole('link', { name: 'Đăng ký miễn phí' }).click(); await expect(page).toHaveURL(/signup\?returnTo=/);
  await page.getByLabel('Họ và tên của bạn').fill('Guest Student'); await page.getByLabel('Địa chỉ Email').fill('guest@example.test');
  await page.getByLabel('Ngày sinh').fill('2008-01-01'); await page.getByLabel('Số điện thoại', { exact: true }).fill('0901234567');
  await page.getByLabel('Tạo mật khẩu', { exact: true }).fill('Password123!'); await page.getByRole('button', { name: 'Tiếp tục xác thực OTP →' }).click();
  await expect(page).toHaveURL(/otp-verify\?returnTo=/); await page.getByRole('textbox', { name: 'Chữ số 1', exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Xác nhận đăng ký', exact: true }).click(); await expect(page).toHaveURL(/login\?returnTo=/);
  expect(await page.evaluate(() => sessionStorage.getItem('aihn.assessment.guest.v1'))).not.toBeNull();
  expect(calls.filter(call => call.path.endsWith('/guest-assessment/claim'))).toHaveLength(0);
  await login(page); await expect(page).toHaveURL('/roadmap');
  expect(calls.filter(call => call.path.endsWith('/guest-assessment/claim'))).toHaveLength(1);
  expect(await page.evaluate(() => sessionStorage.getItem('aihn.assessment.guest.v1'))).toBeNull();
});
test('unknown import acknowledgement survives reload and reconciles with GET without another POST', async ({ page }) => {
  const options = { claimFailure: true, claimed: false }; const { calls } = await guestFixture(page, options); await completeGuest(page);
  await page.getByRole('link', { name: 'Tư vấn với AI', exact: true }).click(); await login(page);
  await expect(page.getByRole('alert')).toContainText('Chưa xác nhận bài đã lưu'); await page.reload();
  await page.getByRole('button', { name: 'Kiểm tra bài đã lưu', exact: true }).click(); await expect(page).toHaveURL('/advisor');
  expect(calls.filter(call => call.path.endsWith('/guest-assessment/claim') && call.method === 'POST')).toHaveLength(1);
});
test('not-found reconciliation enables only an explicit idempotent import retry', async ({ page }) => {
  const options = { claimFailure: true, claimed: false }; const { calls } = await guestFixture(page, options); await completeGuest(page);
  await page.getByRole('link', { name: 'Xây dựng lộ trình', exact: true }).click(); await login(page);
  await expect(page.getByRole('alert')).toBeVisible(); options.claimed = false;
  const retry = page.getByRole('button', { name: 'Thử lưu lại', exact: true }); await expect(retry).toBeDisabled();
  await page.getByRole('button', { name: 'Kiểm tra bài đã lưu', exact: true }).click(); await expect(retry).toBeEnabled();
  options.claimFailure = false; await retry.click(); await expect(page).toHaveURL('/roadmap');
  expect(calls.filter(call => call.path.endsWith('/guest-assessment/claim') && call.method === 'POST')).toHaveLength(2);
});
test('leaving during import preserves its checkpoint and late success cannot clear the guest result', async ({ page }) => {
  let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; }); const options = { claimGate: gate, claimed: false };
  const { calls } = await guestFixture(page, options); await completeGuest(page); await page.getByRole('link', { name: 'Tư vấn với AI', exact: true }).click(); await login(page);
  await expect(page.getByRole('status')).toHaveText('Đang xác nhận và lưu bài…');
  await page.goto('/assessment/guest-result'); release(); await expect(page.getByRole('heading', { name: 'TopCode: ISC' })).toBeVisible();
  await page.goto('/assessment/claim?target=roadmap'); await expect(page.getByRole('button', { name: 'Kiểm tra bài đã lưu' })).toBeEnabled();
  expect(calls.filter(call => call.path.endsWith('/guest-assessment/claim') && call.method === 'POST')).toHaveLength(1);
  await page.getByRole('button', { name: 'Kiểm tra bài đã lưu' }).click(); await expect(page).toHaveURL('/roadmap');
});
test('changing accounts cannot automatically attach an uncertain guest claim to another owner', async ({ page }) => {
  const options = { claimFailure: true, owner: 71 }; const { calls } = await guestFixture(page, options); await completeGuest(page);
  await page.getByRole('link', { name: 'Tư vấn với AI', exact: true }).click(); await login(page); await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click(); options.owner = 72; await login(page);
  await expect(page.getByRole('alert')).toContainText('tài khoản khác');
  expect(calls.filter(call => call.path.endsWith('/guest-assessment/claim') && call.method === 'POST')).toHaveLength(1);
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('aihn.assessment.guest.v1')!).claim.ownerId)).toBe(71);
});
test('a denied import checkpoint never dispatches a POST that could be replayed after reload', async ({ page }) => {
  const { calls } = await guestFixture(page); await completeGuest(page);
  await page.addInitScript(() => { const set = Storage.prototype.setItem; Storage.prototype.setItem = function(key, value) { if (key === 'aihn.assessment.guest.v1') throw new Error('denied'); return set.call(this, key, value); }; });
  await page.reload(); await page.getByRole('link', { name: 'Tư vấn với AI', exact: true }).click(); await login(page);
  await expect(page.getByRole('alert')).toContainText('quyền lưu trữ');
  expect(calls.filter(call => call.path.endsWith('/guest-assessment/claim') && call.method === 'POST')).toHaveLength(0);
});
