import { expect, test } from '@playwright/test';
import { careerPlatformFixture } from './career-platform.fixture';

const preview = '/preview/careers';
const fixture = '**/assets/catalog-preview-*.json';

test('runtime catalog failure never falls back to preview data', async ({ page }) => {
  await careerPlatformFixture(page);
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

// Runtime catalog: source records and server filters stay separate from preview fixtures.
test('runtime catalog submits only supported filters and resets pagination with keyboard controls', async ({ page }) => {
  const { sourceCareer } = await import('./career-platform.fixture');
  await careerPlatformFixture(page);
  const requests: URL[] = [];
  await page.route('**/api/v1/careers?**', async route => {
    const url = new URL(route.request().url());
    requests.push(url);
    await route.fulfill({ json: { data: { items: [sourceCareer], total: 25, page: Number(url.searchParams.get('page')), limit: 12 } } });
  });
  await page.goto('/careers?page=2');
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByRole('searchbox').fill('Software');
  const group = page.getByRole('combobox', { name: 'Nhóm RIASEC nổi bật' });
  await group.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Tìm kiếm', exact: true }).click();
  await expect(page).toHaveURL(/page=1/);
  await expect.poll(() => requests.at(-1)?.searchParams.get('q')).toBe('Software');
  expect([...requests.at(-1)!.searchParams.keys()].sort()).toEqual(['code', 'limit', 'page', 'q']);
  expect(requests.at(-1)!.searchParams.get('code')).toBe('I');
  await page.getByRole('button', { name: 'Trang sau', exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await page.goBack();
  await expect(page).toHaveURL(/page=1/);
  await expect(page.getByRole('searchbox')).toHaveValue('Software');
  await expect(page.getByRole('article').getByRole('link', { name: 'Nguồn O*NET: Software Developers' })).toHaveAttribute('href', sourceCareer.sourceUrl);
});

test('runtime catalog distinguishes empty source, no results, out-of-range and retry', async ({ page }) => {
  await careerPlatformFixture(page);
  let fail = true;
  await page.route('**/api/v1/careers?**', route => {
    const url = new URL(route.request().url());
    return route.fulfill(fail ? { status: 503, json: {} } : { json: { data: { items: [], total: url.searchParams.get('page') === '999' ? 20 : 0, page: Number(url.searchParams.get('page')), limit: 12 } } });
  });
  await page.goto('/careers');
  await expect(page.getByRole('alert')).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Thử tải lại dữ liệu nghề' }).click();
  await expect(page.getByRole('heading', { name: 'Danh mục nghề chưa có dữ liệu' })).toBeVisible();
  await page.getByRole('searchbox').fill('missing');
  await page.getByRole('searchbox').press('Enter');
  await expect(page.getByRole('heading', { name: 'Không có nghề phù hợp' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Phân trang nghề', exact: true })).toHaveCount(0);
  await page.goto('/careers?page=999');
  await expect(page.getByRole('heading', { name: 'Trang này vượt quá kết quả' })).toBeVisible();
  await page.getByRole('button', { name: 'Về trang đầu' }).click();
  await expect(page).toHaveURL(/page=1/);
});

test('runtime catalog ignores late search responses and invalid source records', async ({ page }) => {
  const { sourceCareer } = await import('./career-platform.fixture');
  await careerPlatformFixture(page);
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/v1/careers?**', async route => {
    const q = new URL(route.request().url()).searchParams.get('q');
    if (q === 'old') await held;
    await route.fulfill({ json: { data: { items: [{ ...sourceCareer, title: q === 'old' ? 'Obsolete career' : 'Current career', sourceUrl: q === 'invalid' ? 'https://example.com/fake' : sourceCareer.sourceUrl }], total: 1, page: 1, limit: 12 } } });
  });
  await page.goto('/careers?q=old');
  await expect(page.getByRole('status')).toContainText('Đang tải');
  await page.getByRole('searchbox').fill('new');
  await page.getByRole('searchbox').press('Enter');
  await expect(page.getByRole('heading', { name: 'Current career' })).toBeVisible();
  release();
  await expect(page.getByRole('heading', { name: 'Obsolete career' })).toHaveCount(0);
  await page.getByRole('searchbox').fill('invalid');
  await page.getByRole('searchbox').press('Enter');
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
});

test('runtime catalog fits breakpoints, has one shell and keeps source cards visible with both motion preferences', async ({ page }) => {
  const { sourceCareer } = await import('./career-platform.fixture');
  await careerPlatformFixture(page);
  await page.route('**/api/v1/careers?**', route => route.fulfill({ json: { data: { items: Array.from({ length: 6 }, (_, n) => ({ ...sourceCareer, id: `15-1252.0${n}`, title: `${sourceCareer.title} ${n + 1}` })), total: 6, page: 1, limit: 12 } } }));
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const reducedMotion of ['reduce', 'no-preference'] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto('/careers');
    await expect(page.getByRole('article')).toHaveCount(6);
    await expect(page.getByRole('article').first()).toHaveCSS('opacity', '1');
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('banner')).toHaveCount(1);
    for (const width of [320, 390, 768, 769, 1024, 1025, 1440, 1600]) {
      await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const control of await page.locator('main button, main a, main input, main .ant-select').all()) {
        if (!await control.isVisible()) continue;
        const box = (await control.boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
      if (reducedMotion === 'reduce') await page.screenshot({ path: `.superpowers/ui-sync/P07/implementation-${width}.png`, fullPage: true });
    }
  }
  expect(errors).toEqual([]);
});

test('runtime catalog returns to the guarded filtered URL after login', async ({ page }) => {
  const { resultFixture } = await import('./result.fixture');
  await resultFixture(page, { authenticated: false });
  const fixture = await careerPlatformFixture(page, { anonymous: true });
  await page.goto('/careers?q=Software&code=I&page=1');
  await expect(page).toHaveURL(/\/login\?returnTo=/);
  await expect(page.getByRole('article')).toHaveCount(0);
  expect(fixture.calls).toHaveLength(0);
  await page.getByLabel('Email trường hoặc cá nhân').fill('student@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('password123');
  await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →' }).click();
  await expect(page).toHaveURL('/careers?q=Software&code=I&page=1');
  await expect(page.getByRole('heading', { name: 'Software Developers' })).toBeVisible();
  await expect(page.getByRole('searchbox')).toHaveValue('Software');
  await expect(page.getByRole('combobox', { name: 'Nhóm RIASEC nổi bật' })).toBeVisible();
});
