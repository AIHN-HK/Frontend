import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const webp = Buffer.from('UklGRjgAAABXRUJQVlA4ICwAAACQAQCdASoCAAIAAUAmJaACdLoAA5gA/u3O3/Oz2Wxtf/9rQ/9Wh/6tD+SQAA==', 'base64');
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=', 'base64');
const file = { name: 'avatar.png', mimeType: 'image/png', buffer: png };
type Options = { saved?: boolean; readError?: boolean; putError?: boolean; putDelay?: Promise<void>; malformed?: boolean; owner?: number };
async function fixture(page: Page, options: Options = {}) {
  const puts: string[] = [], reads: number[] = [];
  await page.addInitScript(() => sessionStorage.setItem('aihn.auth.v1', JSON.stringify({ version: 1, ownerId: 71, rememberMe: false, tokens: { accessToken: 'test-access', refreshToken: 'test-refresh' } })));
  await page.route('http://localhost:3000/api/v1/**', async route => {
    const path = new URL(route.request().url()).pathname, method = route.request().method();
    const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
    if (method === 'OPTIONS') { await route.fulfill({ status: 204, headers }); return; }
    const owner = options.owner ?? 71;
    if (path.endsWith('/users/me/avatar')) {
      if (method === 'PUT') {
        puts.push(route.request().headers()['content-type'] ?? '');
        await options.putDelay;
        if (options.putError) { await route.fulfill({ status: 400, headers, json: { status: 400 } }); return; }
        options.saved = true;
        await route.fulfill({ headers, json: { status: 200, data: options.malformed ? {} : { saved: true } } }); return;
      }
      reads.push(owner);
      if (options.readError) { await route.fulfill({ status: 503, headers, json: { status: 503 } }); return; }
      await route.fulfill(options.saved && owner === 71 ? { headers, contentType: 'image/webp', body: webp } : { status: 404, headers, json: { status: 404 } }); return;
    }
    const user = { id: owner, fullname: `Student ${owner}`, role: 'USER' };
    const profile = { fullname: user.fullname, phone: '0901234567', email: 'student@example.test', address: null, gender: null, class: 12 };
    await route.fulfill({ headers, json: { status: 200, data: path.endsWith('/users/me') ? profile : path.endsWith('/history-by-user') ? { formattedHistory: [] } : user } });
  });
  return { puts, reads };
}
const upload = (page: Page) => page.getByRole('button', { name: 'Lưu ảnh đại diện', exact: true });
const choose = (page: Page) => page.getByLabel('Chọn ảnh đại diện', { exact: true });
const preview = (page: Page) => page.getByRole('img', { name: 'Xem trước ảnh đại diện', exact: true });

test('explicit preview/upload/reload persists the avatar without saving or replacing text drafts', async ({ page }) => {
  const calls = await fixture(page); await page.goto('/career-profile');
  await expect(page.getByText('Chưa có ảnh đại diện', { exact: true })).toBeVisible();
  await page.getByLabel('Họ và tên', { exact: true }).fill('Unsaved text draft');
  await choose(page).setInputFiles(file);
  await expect(preview(page)).toBeVisible(); expect(calls.puts).toHaveLength(0);
  await upload(page).dblclick(); await expect(page.getByText('Đã lưu ảnh đại diện.', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Họ và tên', { exact: true })).toHaveValue('Unsaved text draft');
  expect(calls.puts).toHaveLength(1); expect(calls.puts[0]).toMatch(/^multipart\/form-data; boundary=/);
  await expect(preview(page)).toHaveCount(0);
  await page.reload();
  const saved = page.getByRole('img', { name: 'Ảnh đại diện đã lưu', exact: true });
  await expect(saved).toBeVisible(); await expect.poll(() => saved.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  expect(calls.puts).toHaveLength(1);
});

test('invalid type, empty or oversized file never uploads', async ({ page }) => {
  const calls = await fixture(page); await page.goto('/career-profile');
  for (const input of [{ name: 'script.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') }, { ...file, buffer: Buffer.alloc(0) }, { ...file, buffer: Buffer.alloc(5 * 1024 * 1024 + 1) }]) {
    await choose(page).setInputFiles(input);
    await expect(page.getByRole('region', { name: 'Ảnh đại diện', exact: true }).getByRole('alert')).toBeVisible(); await expect(upload(page)).toBeDisabled();
  }
  expect(calls.puts).toHaveLength(0);
});

test('failed upload preserves selected preview and current saved image for explicit retry', async ({ page }) => {
  const options = { saved: true, putError: true }; const calls = await fixture(page, options); await page.goto('/career-profile');
  await choose(page).setInputFiles(file); await upload(page).click();
  await expect(page.getByRole('region', { name: 'Ảnh đại diện', exact: true }).getByRole('alert')).toContainText('Không thể lưu ảnh');
  await expect(preview(page)).toBeVisible(); await expect(page.getByRole('img', { name: 'Ảnh đại diện đã lưu', exact: true })).toBeVisible();
  expect(calls.puts).toHaveLength(1); options.putError = false;
  await upload(page).click(); await expect(page.getByText('Đã lưu ảnh đại diện.', { exact: true })).toBeVisible(); expect(calls.puts).toHaveLength(2);
});

test('unknown save acknowledgement requires a server review before any explicit retry', async ({ page }) => {
  const options = { malformed: true }; const calls = await fixture(page, options); await page.goto('/career-profile');
  await choose(page).setInputFiles(file); await upload(page).click();
  await expect(page.getByRole('region', { name: 'Ảnh đại diện', exact: true }).getByRole('alert')).toContainText('Chưa xác nhận ảnh');
  await expect(preview(page)).toBeVisible(); await expect(upload(page)).toBeDisabled();
  await page.getByRole('button', { name: 'Kiểm tra ảnh đã lưu', exact: true }).click();
  await expect(page.getByRole('img', { name: 'Ảnh đại diện đã lưu', exact: true })).toBeVisible();
  expect(calls.puts).toHaveLength(1);
  await page.getByRole('button', { name: 'Đã kiểm tra, cho phép lưu lại', exact: true }).click();
  options.malformed = false; await upload(page).click();
  await expect(page.getByText('Đã lưu ảnh đại diện.', { exact: true })).toBeVisible(); expect(calls.puts).toHaveLength(2);
});

test('initial image read failure is retried without losing the selected file or issuing a write', async ({ page }) => {
  const options = { readError: true }; const calls = await fixture(page, options); await page.goto('/career-profile');
  await expect(page.getByRole('region', { name: 'Ảnh đại diện', exact: true }).getByRole('alert')).toContainText('Không tải được ảnh');
  await choose(page).setInputFiles(file); await expect(upload(page)).toBeDisabled();
  options.readError = false; await page.getByRole('button', { name: 'Kiểm tra ảnh đã lưu', exact: true }).click();
  await expect(upload(page)).toBeEnabled(); await expect(preview(page)).toBeVisible(); expect(calls.puts).toHaveLength(0);
});

test('leaving during upload aborts the request and a late response cannot show stale avatar success', async ({ page }) => {
  let release!: () => void; const options = { putDelay: new Promise<void>(resolve => { release = resolve; }) };
  const calls = await fixture(page, options); await page.goto('/career-profile');
  await choose(page).setInputFiles(file); await upload(page).click();
  await expect(page.getByRole('button', { name: 'Đang lưu ảnh…', exact: true })).toBeDisabled();
  await page.getByRole('link', { name: 'Về Trang của tôi' }).click(); release();
  await expect(page).toHaveURL(/\/dashboard$/); expect(calls.puts).toHaveLength(1);
  await page.goto('/career-profile'); await expect(page.getByText('Đã lưu ảnh đại diện.', { exact: true })).toHaveCount(0);
});

for (const width of [320, 390, 768, 1440]) {
  test(`avatar controls and long filenames fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 }); await fixture(page); await page.goto('/career-profile');
    await choose(page).setInputFiles({ ...file, name: 'avatar-'.repeat(30) + '.png' });
    await expect(preview(page)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const button = await upload(page).boundingBox(); expect(button?.height).toBeGreaterThanOrEqual(44);
  });
}
