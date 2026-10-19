import { expect, test } from '@playwright/test';

const preview = '/preview/careers';
const fixture = '**/assets/catalog-preview-*.json';

test('runtime catalog failure never falls back to preview data', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', r => { if (/catalog-preview|\/api\/.*career/.test(r.url())) requests.push(r.url()); });
  await page.route('**/api/v1/careers**', route => route.fulfill({ status: 503, json: { message: 'fixture unavailable' } }));
  await page.goto('/careers?q=phan+mem');
  await expect(page.getByText('Không tải được dữ liệu nghề. Hãy kiểm tra kết nối và thử lại.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('article')).toHaveCount(0);
  expect(requests.some(url => url.includes('catalog-preview'))).toBe(false);
  expect(requests.every(url => url.includes('/api/v1/careers'))).toBe(true);
});

test('preview labels the source, derives totals and links the exact fixture ID', async ({ page }) => {
  await page.goto(preview);
  await expect(page.getByRole('note')).toContainText('Dữ liệu mẫu');
  await expect(page.getByRole('status')).toContainText('12 nghề mẫu');
  await expect(page.getByRole('article')).toHaveCount(4);
  const first = page.getByRole('article').first();
  await expect(first).toContainText('Kỹ sư Phần mềm');
  await expect(first.getByRole('link')).toHaveAttribute('href', '/preview/careers/preview-software');
  await first.getByRole('link').click();
  await expect(page.getByRole('heading', { level: 1, name: 'Kỹ sư Phần mềm' })).toBeVisible();
});

test('accent-free search, OR within filters and AND across groups sync URL and reset page', async ({ page }) => {
  await page.goto(`${preview}?page=2`);
  await expect(page.getByRole('article')).toHaveCount(4);
  await page.getByRole('searchbox').fill('  DU LIEU  ');
  await page.getByRole('button', { name: 'Tìm kiếm', exact: true }).click();
  await expect(page).not.toHaveURL(/page=2/);
  await expect(page.getByRole('article')).toHaveCount(3);
  await page.getByRole('checkbox', { name: 'I · Nghiên cứu', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'I · Nghiên cứu', exact: true })).toBeChecked();
  await page.getByRole('checkbox', { name: 'R · Thực tế', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(3);
  await page.getByRole('checkbox', { name: /Dữ liệu & Trí tuệ nhân tạo/ }).click();
  await expect(page.getByRole('article')).toHaveCount(2);
  await expect(page).toHaveURL(/category=data/);
  await page.reload();
  await expect(page.getByRole('searchbox')).toHaveValue('DU LIEU');
  await expect(page.getByRole('checkbox', { name: 'I · Nghiên cứu', exact: true })).toBeChecked();
  await page.getByRole('checkbox', { name: /Công nghệ thông tin/ }).click();
  await expect(page.getByRole('article')).toHaveCount(3);
});

test('pagination, browser history and reset preserve source-derived state', async ({ page }) => {
  await page.goto(preview);
  await expect(page.getByRole('article')).toHaveCount(4);
  await page.getByRole('button', { name: 'Trang sau' }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByRole('status')).toContainText('5–8');
  await page.goBack();
  await expect(page.getByRole('status')).toContainText('1–4');
  await page.goForward();
  await expect(page.getByRole('status')).toContainText('5–8');
  await page.getByRole('button', { name: 'Trang sau' }).click();
  await expect(page.getByRole('button', { name: 'Trang sau' })).toBeDisabled();
  await page.getByRole('button', { name: 'Đặt lại bộ lọc', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('1–4');
});

test('no results and out-of-range page have honest distinct recovery', async ({ page }) => {
  await page.goto(`${preview}?q=khongco-nghe-nay`);
  await expect(page.getByRole('heading', { name: 'Không có nghề mẫu phù hợp' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Phân trang nghề mẫu' })).toHaveCount(0);
  await page.goto(`${preview}?category=data&page=999`);
  await expect(page.getByRole('heading', { name: 'Trang này vượt quá kết quả' })).toBeVisible();
  await page.getByRole('button', { name: 'Về trang đầu' }).click();
  await expect(page).toHaveURL(/category=data/);
  await expect(page).not.toHaveURL(/page=999/);
  await expect(page.getByRole('article')).toHaveCount(2);
});

test('slow obsolete source response cannot replace the newer query', async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  let settled!: () => void;
  const obsoleteSettled = new Promise<void>(resolve => { settled = resolve; });
  let count = 0;
  await page.route(fixture, async route => {
    const obsolete = ++count === 1;
    if (obsolete) await held;
    await route.continue().catch(() => {});
    if (obsolete) settled();
  });
  await page.goto(`${preview}?q=phan+mem&category=data`);
  await expect(page.getByRole('status')).toContainText('Đang tải');
  await page.getByRole('searchbox').fill('du lieu');
  await page.getByRole('button', { name: 'Tìm kiếm', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(2);
  release();
  await obsoleteSettled;
  await expect(page.getByRole('article').first()).toContainText('Kỹ sư Dữ liệu');
  await expect(page.getByRole('article')).toHaveCount(2);
  await expect(page.getByRole('searchbox')).toHaveValue('du lieu');
});

test('source failure has explicit retry and malformed fixture is rejected', async ({ page }) => {
  let count = 0;
  await page.route(fixture, route => ++count === 1 ? route.fulfill({ status: 503, body: '' }) : route.continue());
  await page.goto(preview);
  await expect(page.getByRole('heading', { name: 'Không thể tải dữ liệu mẫu' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
  await page.getByRole('button', { name: 'Thử lại' }).click();
  await expect(page.getByRole('article')).toHaveCount(4);
  await page.route(fixture, route => route.fulfill({ json: { careers: [{ id: 'real-fake' }] } }));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Không thể tải dữ liệu mẫu' })).toBeVisible();
});

test('mobile filter drawer traps focus, applies shared filters, Escape restores focus and resize closes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(preview);
  await expect(page.getByRole('article')).toHaveCount(4);
  const opener = page.getByRole('button', { name: /Mở bộ lọc/ });
  await opener.click();
  const drawer = page.getByRole('dialog', { name: 'Bộ lọc nghề mẫu' });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('button', { name: 'Đóng', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  expect(await drawer.evaluate(node => node.contains(document.activeElement))).toBe(true);
  await drawer.getByRole('checkbox', { name: /Dữ liệu & Trí tuệ nhân tạo/ }).click();
  await expect(drawer.getByRole('checkbox', { name: /Dữ liệu & Trí tuệ nhân tạo/ })).toBeChecked();
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(opener).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await expect(page.getByRole('article')).toHaveCount(2);
  await opener.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(drawer).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(drawer).toBeHidden();
});

for (const width of [320, 390, 768, 769, 1024, 1025, 1440]) {
  test(`explorer fits ${width}px with usable touch controls`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(preview);
    await expect(page.getByRole('article')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const control of await page.locator('.career-explorer button, .career-explorer a, .explorer-filters label, .explorer-search input').all()) {
      if (!await control.isVisible()) continue;
      const box = (await control.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });
}
