import { expect, test } from '@playwright/test';
import catalog from '../../src/modules/careers/preview/catalog-preview.json' with { type: 'json' };
import { advisorFixture } from './advisor.fixture';

const software = '/preview/careers/preview-software';
const data = '/preview/careers/preview-data-engineer';
const fixture = '**/assets/catalog-preview-*.json';

test('real detail never fetches preview records or claims a verified career', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (r) => {
    if (/catalog-preview|\/api\/.*career/.test(r.url())) requests.push(r.url());
  });
  await page.goto('/careers/preview-software');
  await expect(page.getByText('Mã nghề không hợp lệ.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Nhiệm vụ & Trách nhiệm điển hình' })).toHaveCount(0);
  expect(requests).toEqual([]);
});

test('public preview loads the requested record on direct entry and reload without personal requests', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (r) => {
    if (['fetch', 'xhr', 'websocket'].includes(r.resourceType())) requests.push(r.url());
  });
  await page.goto(software);
  await expect(page.getByRole('heading', { level: 1, name: 'Kỹ sư Phần mềm' })).toBeVisible();
  await expect(page.getByRole('note')).toContainText('Dữ liệu mẫu');
  await expect(page.getByRole('heading', { name: 'Nhiệm vụ & Trách nhiệm điển hình' })).toBeVisible();
  await expect(
    page.getByText('Phân tích yêu cầu và thiết kế giải pháp phần mềm.', { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Kỹ sư Phần mềm' })).toBeVisible();
  expect(requests.every((url) => url.includes('/assets/catalog-preview-'))).toBe(true);
  await expect(page.getByText(/92%|26\.0|15 - 45|15-1252\.00/)).toHaveCount(0);
});

test('every explorer fixture ID has its own detail and never falls back to the first career', async ({
  page,
}) => {
  for (const career of catalog.careers) {
    await page.goto(`/preview/careers/${career.id}`);
    await expect(page.getByRole('heading', { level: 1, name: career.name, exact: true })).toBeVisible();
  }
});

test('partial detail keeps section structure and shows missing salary/admissions/tasks/skills/sources honestly', async ({
  page,
}) => {
  await page.goto('/preview/careers/preview-nurse');
  await expect(page.getByRole('heading', { level: 1, name: 'Điều dưỡng' })).toBeVisible();
  await expect(page.getByText('Chưa có nhiệm vụ minh họa cho nghề mẫu này.', { exact: true })).toBeVisible();
  await expect(page.getByText('Chưa có kỹ năng chuyên môn minh họa.', { exact: true })).toBeVisible();
  await expect(page.getByText('Chưa có kỹ năng mềm minh họa.', { exact: true })).toBeVisible();
  await expect(page.getByText('Chưa có nguồn lương được xác nhận.', { exact: true })).toBeVisible();
  await expect(page.getByText('Chưa có dữ liệu tuyển sinh được xác nhận.', { exact: true })).toBeVisible();
  await expect(page.getByText('Chưa có tài liệu tham khảo cho nghề mẫu này.', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /MDN|PostgreSQL/ })).toHaveCount(0);
});

for (const id of ['123', 'preview-', 'preview-software%2Fextra']) {
  test(`invalid ID ${id} is rejected without a fixture fetch`, async ({ page }) => {
    let reads = 0;
    page.on('request', (request) => {
      if (request.url().includes('/assets/catalog-preview-')) reads++;
    });
    await page.goto(`/preview/careers/${id}`);
    await expect(page.getByRole('heading', { name: 'Mã nghề mẫu không hợp lệ' })).toBeVisible();
    expect(reads).toBe(0);
  });
}

test('unknown valid ID is not found and supports return to the filtered explorer', async ({ page }) => {
  await page.goto('/preview/careers/preview-does-not-exist?category=data');
  await expect(page.getByRole('heading', { name: 'Không tìm thấy nghề mẫu' })).toBeVisible();
  await page.getByRole('link', { name: 'Quay lại khám phá nghề' }).click();
  await expect(page).toHaveURL(/\/preview\/careers\?category=data$/);
  await expect(page.getByRole('article')).toHaveCount(2);
});

test('Explorer to Detail to reload and back retains search, all filters and page', async ({ page }) => {
  const query = '?q=vi+du&category=technology&category=data&category=health&riasec=I&page=2';
  await page.goto(`/preview/careers${query}`);
  await expect(page.getByRole('article')).toHaveCount(2);
  await page.getByRole('article').first().getByRole('link').click();
  await expect(page).toHaveURL(`/preview/careers/preview-psychology${query}`);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Chuyên viên Tâm lý học' })).toBeVisible();
  await page.getByRole('link', { name: 'Quay lại khám phá nghề' }).click();
  await expect(page).toHaveURL(`/preview/careers${query}`);
  await expect(page.getByRole('searchbox')).toHaveValue('vi du');
  await expect(page.getByRole('status')).toContainText('5–6');
  await page.getByRole('article').last().getByRole('link').click();
  await expect(page.getByRole('heading', { level: 1, name: 'Chuyên viên An toàn Thông tin' })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(`/preview/careers${query}`);
});

test('loading and explicit retry never turn failed reads into not-found', async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let reads = 0;
  await page.route(fixture, async (route) => {
    if (++reads === 1) {
      await held;
      await route.fulfill({ status: 503, body: '' });
    } else await route.continue();
  });
  await page.goto(software);
  await expect(page.getByRole('status').filter({ hasText: 'Đang tải hồ sơ nghề mẫu' })).toContainText(
    'Đang tải hồ sơ nghề mẫu',
  );
  release();
  await expect(page.getByRole('heading', { name: 'Không thể tải hồ sơ nghề mẫu' })).toBeVisible();
  expect(reads).toBe(1);
  await page.getByRole('button', { name: 'Thử lại' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Kỹ sư Phần mềm' })).toBeVisible();
});

test('malformed provenance and unsafe external URLs are rejected', async ({ page }) => {
  await page.route(fixture, (route) =>
    route.fulfill({
      json: {
        ...catalog,
        careers: [
          {
            ...catalog.careers[0],
            detail: {
              kind: 'T13 UI fixtures',
              updatedAt: '2026-10-14',
              references: [{ label: 'Unsafe', url: 'javascript:alert(1)', checkedAt: '2026-10-14' }],
            },
          },
        ],
      },
    }),
  );
  await page.goto(software);
  await expect(page.getByRole('heading', { name: 'Không thể tải hồ sơ nghề mẫu' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Unsafe' })).toHaveCount(0);
});

test('an obsolete detail read cannot replace the next career or its references', async ({ page }) => {
  let release!: () => void,
    settled!: () => void,
    reads = 0;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const obsoleteSettled = new Promise<void>((resolve) => {
    settled = resolve;
  });
  await page.route(fixture, async (route) => {
    const obsolete = ++reads === 2;
    if (obsolete) await held;
    await route.continue().catch(() => {});
    if (obsolete) settled();
  });
  await page.goto('/preview/careers');
  await expect(page.getByRole('article')).toHaveCount(4);
  await page.getByRole('article').first().getByRole('link').click();
  await expect(page.getByRole('status').filter({ hasText: 'Đang tải hồ sơ nghề mẫu' })).toContainText(
    'Đang tải hồ sơ nghề mẫu',
  );
  await page.goBack();
  await expect(page.getByRole('article')).toHaveCount(4);
  await page.getByRole('article').nth(1).getByRole('link').click();
  await expect(page.getByRole('heading', { level: 1, name: 'Kỹ sư Dữ liệu' })).toBeVisible();
  release();
  await obsoleteSettled;
  await expect(page.getByRole('heading', { level: 1, name: 'Kỹ sư Dữ liệu' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'MDN · Học phát triển web' })).toHaveCount(0);
});

test('learning references belong to the current record and open safely; they are not salary/admissions evidence', async ({
  page,
  context,
}) => {
  await page.goto(software);
  const mdn = page.getByRole('link', { name: 'MDN · Học phát triển web' });
  await expect(mdn).toHaveAttribute('href', 'https://developer.mozilla.org/en-US/docs/Learn_web_development');
  await expect(mdn).toHaveAttribute('target', '_blank');
  await expect(mdn).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(
    page.getByText('Không dùng các tài liệu này để xác nhận mức lương hoặc tuyển sinh.', { exact: true }),
  ).toBeVisible();
  await context.route('https://developer.mozilla.org/en-US/docs/Learn_web_development', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<h1>External link navigation fixture</h1>' }),
  );
  const popupPromise = page.waitForEvent('popup');
  await mdn.click();
  const popup = await popupPromise;
  await popup.waitForURL('https://developer.mozilla.org/en-US/docs/Learn_web_development');
  await popup.close();
  await page.goto(data);
  await expect(page.getByRole('link', { name: 'PostgreSQL · Hướng dẫn SQL' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'MDN · Học phát triển web' })).toHaveCount(0);
});

test('guest personal CTAs go through login without creating chat or fake match', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (r) => {
    if (r.resourceType() === 'websocket' || /chat|test-session/.test(r.url())) requests.push(r.url());
  });
  await page.goto(software);
  await expect(page.getByRole('region', { name: 'Độ phù hợp cá nhân' })).toContainText(
    'Phân tích độ phù hợp cho nghề này chưa có dữ liệu.',
  );
  await page.getByRole('link', { name: 'Trao đổi với Cố vấn AI', exact: true }).click();
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fadvisor$/);
  await expect(page.getByRole('heading', { name: 'Đăng nhập AIHN' })).toBeVisible();
  expect(requests).toEqual([]);
});

test('a verified signed-in session still gets no invented match or automatic socket/context', async ({
  page,
}) => {
  const backend = await advisorFixture(page);
  await page.goto(software);
  await expect(page.getByRole('region', { name: 'Độ phù hợp cá nhân' })).toContainText('Bạn đã đăng nhập.');
  await expect(page.getByRole('region', { name: 'Độ phù hợp cá nhân' })).toContainText(
    'Phân tích độ phù hợp cho nghề này chưa có dữ liệu.',
  );
  expect(backend.handshakes).toHaveLength(0);
  expect(backend.requests.filter((r) => /chat|history-by-user/.test(r.path))).toEqual([]);
});

test('long text renders as text and the back target cannot become an external redirect', async ({ page }) => {
  const name = 'Nghề minh họa với tên và nội dung rất dài '.repeat(12);
  await page.route(fixture, (route) =>
    route.fulfill({
      json: {
        ...catalog,
        careers: [
          { ...catalog.careers[0], name, summary: '<img src=x onerror=alert(1)>', detail: undefined },
        ],
      },
    }),
  );
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(`${software}?returnTo=https%3A%2F%2Fevil.test&category=data`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(name.trim());
  await expect(page.locator('.career-detail img[onerror]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('link', { name: 'Quay lại khám phá nghề' })).toHaveAttribute(
    'href',
    '/preview/careers?category=data',
  );
});

for (const width of [320, 390, 768, 769, 1024, 1025, 1440]) {
  test(`career detail fits ${width}px with 44px controls and readable sections`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(software);
    await expect(page.getByRole('heading', { level: 1, name: 'Kỹ sư Phần mềm' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const link of await page.locator('.career-detail a').all()) {
      const box = (await link.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });
}
