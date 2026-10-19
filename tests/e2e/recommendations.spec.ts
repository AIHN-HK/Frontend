import { expect, test } from '@playwright/test';
import { advisorFixture } from './advisor.fixture';
import output from '../../src/modules/recommendations/preview/recommendations-preview.json' with { type: 'json' };

const preview = '/preview/recommendations';
const source = '**/assets/recommendations-preview-*.json';

test('guest runtime requires login; authenticated runtime has no fixture ranking or mutations', async ({
  page,
}) => {
  await page.goto('/recommendations');
  await expect(page).toHaveURL(/\/login\?returnTo=%2Frecommendations$/);
  const backend = await advisorFixture(page);
  const fixtureReads: string[] = [];
  page.on('request', (r) => {
    if (/recommendations-preview|catalog-preview/.test(r.url())) fixtureReads.push(r.url());
  });
  await page.goto('/recommendations');
  await expect(page.getByRole('heading', { name: 'Gợi ý nghề nghiệp có giải thích' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('article')).toHaveCount(0);
  expect(fixtureReads).toEqual([]);
  expect(backend.commands).toEqual([]);
  expect(backend.requests.filter(r => /recommendation|target/.test(r.path)).every(r => r.method === 'GET')).toBe(true);
});

test('preview explicitly labels context, ranks, match scores and skills as mock data', async ({ page }) => {
  const privateReads: string[] = [];
  page.on('request', (r) => {
    if (/\/api\/|socket\.io/.test(r.url())) privateReads.push(r.url());
  });
  await page.goto(preview);
  await expect(page.getByRole('note')).toContainText('Dữ liệu mẫu');
  await expect(page.getByRole('article')).toHaveCount(4);
  await expect(page.getByRole('status')).toContainText('4 gợi ý mẫu');
  await expect(page.getByText('Holland mẫu: ISC', { exact: true })).toBeVisible();
  await expect(page.getByRole('article').first()).toContainText('92% · Điểm minh họa');
  await expect(
    page.getByText('Đặt mục tiêu chưa sẵn sàng. Nghề mẫu không được lưu vào hồ sơ.', { exact: true }),
  ).toBeVisible();
  expect(privateReads).toEqual([]);
});

test('sorting uses fixture fields, keeps source ranks and restores URL after reload/back', async ({
  page,
}) => {
  await page.goto(preview);
  await expect(page.getByRole('article').first()).toContainText('Kỹ sư Phần mềm');
  await page.getByLabel('Sắp xếp gợi ý mẫu').selectOption('name');
  await expect(page).toHaveURL(/sort=name/);
  await expect(page.getByRole('article').first()).toContainText('Chuyên viên An toàn Thông tin');
  await expect(page.getByRole('article').first()).toContainText('Thứ tự mẫu: 3');
  await page.reload();
  await expect(page.getByLabel('Sắp xếp gợi ý mẫu')).toHaveValue('name');
  await page.getByLabel('Sắp xếp gợi ý mẫu').selectOption('score');
  await expect(page.getByRole('article').first()).toContainText('Kỹ sư Phần mềm');
  await page.goBack();
  await expect(page.getByRole('article').first()).toContainText('Chuyên viên An toàn Thông tin');
});

for (const [scenario, title] of [
  ['no-test', 'Chưa có kết quả Holland · Tình huống mẫu'],
  ['no-profile', 'Thiếu thông tin hồ sơ · Tình huống mẫu'],
  ['empty', 'Không có gợi ý · Tình huống mẫu'],
  ['error', 'Không thể tạo gợi ý · Tình huống mẫu'],
]) {
  test(`${scenario} is a distinct labeled preview state with no fabricated recommendations`, async ({
    page,
  }) => {
    await page.goto(`${preview}?scenario=${scenario}`);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(0);
    await expect(page.getByRole('note')).toContainText('Dữ liệu mẫu');
  });
}

test('generating preview uses Ant Design Skeleton and stops when another scenario is chosen', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (r) => {
    if (['fetch', 'xhr', 'websocket'].includes(r.resourceType())) requests.push(r.url());
  });
  await page.goto(`${preview}?scenario=generating`);
  await expect(page.getByRole('status', { name: 'Đang tạo gợi ý · Minh họa' })).toBeVisible();
  await expect(page.locator('.recommendations-skeleton .ant-skeleton')).toHaveCount(3);
  await expect(page.getByRole('article')).toHaveCount(0);
  await page.getByLabel('Tình huống preview').selectOption('empty');
  await expect(page.locator('.recommendations-skeleton')).toHaveCount(0);
  expect(requests).toEqual([]);
});

test('stale profile fixture is explicitly read-only, never treated as current personal output', async ({
  page,
}) => {
  await page.goto(`${preview}?scenario=stale`);
  await expect(page.getByRole('alert')).toContainText('Hồ sơ mẫu đã thay đổi');
  await expect(page.getByRole('article')).toHaveCount(4);
  await expect(page.getByText('Hồ sơ nguồn: preview-profile-v1', { exact: true })).toBeVisible();
  await expect(page.getByText('Hồ sơ hiện tại (mẫu): preview-profile-v2', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Lưu|Đặt mục tiêu|Tạo lại/ })).toHaveCount(0);
});

test('loading failure is distinct from simulated AI error and retries the read only after a click', async ({
  page,
}) => {
  let release!: () => void,
    reads = 0;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(source, async (route) => {
    if (++reads === 1) {
      await held;
      await route.fulfill({ status: 503, body: '' });
    } else await route.continue();
  });
  await page.goto(preview);
  await expect(page.getByRole('status', { name: 'Đang tải gợi ý mẫu' })).toBeVisible();
  release();
  await expect(page.getByRole('heading', { name: 'Không thể tải gợi ý mẫu' })).toBeVisible();
  expect(reads).toBe(1);
  await page.getByRole('button', { name: 'Thử tải lại dữ liệu mẫu' }).click();
  await expect(page.getByRole('article')).toHaveCount(4);
});

test('late output cannot contaminate the newly selected empty scenario', async ({ page }) => {
  let release!: () => void, settle!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const settled = new Promise<void>((resolve) => {
    settle = resolve;
  });
  await page.route(source, async (route) => {
    await held;
    await route.continue().catch(() => {});
    settle();
  });
  await page.goto(preview);
  await expect(page.getByRole('status', { name: 'Đang tải gợi ý mẫu' })).toBeVisible();
  await page.getByLabel('Tình huống preview').selectOption('empty');
  release();
  await settled;
  await expect(page.getByRole('heading', { name: 'Không có gợi ý · Tình huống mẫu' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
});

test('analysis uses recommendationId; general career information uses careerId', async ({ page }) => {
  await page.goto(`${preview}?sort=name`);
  const first = page.getByRole('article').first();
  await expect(first.getByRole('link', { name: 'Xem phân tích mẫu →' })).toHaveAttribute(
    'href',
    '/preview/recommendations/preview-rec-security?sort=name',
  );
  await expect(first.getByRole('link', { name: 'Xem hồ sơ nghề mẫu' })).toHaveAttribute(
    'href',
    '/preview/careers/preview-security',
  );
  await first.getByRole('link', { name: 'Xem phân tích mẫu →' }).click();
  await expect(
    page.getByRole('heading', { name: 'Phân tích mẫu: Chuyên viên An toàn Thông tin' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Quay lại gợi ý mẫu' }).click();
  await expect(page.getByLabel('Sắp xếp gợi ý mẫu')).toHaveValue('name');
});

test('authenticated preview remains isolated from account data and never saves targets or creates chat', async ({
  page,
}) => {
  const options = { owner: 71 };
  const backend = await advisorFixture(page, options);
  await page.goto(preview);
  await expect(page.getByRole('article')).toHaveCount(4);
  await expect(page.getByRole('note')).toContainText('không phải gợi ý cho tài khoản của bạn');
  options.owner = 72;
  await page.evaluate(() =>
    sessionStorage.setItem(
      'aihn.auth.v1',
      JSON.stringify({
        version: 1,
        ownerId: 72,
        rememberMe: false,
        tokens: { accessToken: 'B-access', refreshToken: 'B-refresh' },
      }),
    ),
  );
  await page.reload();
  await expect(page.getByRole('complementary', { name: 'Tài khoản hiện tại' })).toContainText('Học sinh 72');
  await expect(page.getByText('Hồ sơ nguồn: preview-profile-v1', { exact: true })).toBeVisible();
  expect(backend.handshakes).toHaveLength(0);
  expect(backend.commands).toHaveLength(0);
  expect(backend.requests.filter((r) => /recommendation|target|history-by-user|chat/.test(r.path))).toEqual(
    [],
  );
});

test('partial mock output does not invent missing scores/reasons/skills and rejects unknown career IDs', async ({
  page,
}) => {
  await page.route(source, (route) =>
    route.fulfill({
      json: { ...output, items: [{ ...output.items[0], mockMatchPercent: null, reason: null, skills: [] }] },
    }),
  );
  await page.goto(preview);
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('article')).toContainText('Chưa có điểm minh họa');
  await expect(page.getByRole('article')).toContainText('Chưa có lý do minh họa');
  await expect(page.getByRole('article')).toContainText('Chưa có kỹ năng minh họa');
  await page.route(source, (route) =>
    route.fulfill({ json: { ...output, items: [{ ...output.items[0], careerId: 'preview-unknown' }] } }),
  );
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Không thể tải gợi ý mẫu' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
});

test('preview controls work with keyboard and skeleton respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${preview}?scenario=generating`);
  await expect(page.locator('.recommendations-skeleton .ant-skeleton-title').first()).toHaveCSS(
    'animation-name',
    'none',
  );
  const scenario = page.getByLabel('Tình huống preview');
  await scenario.focus();
  await page.keyboard.press('Home');
  await expect(scenario).toHaveValue('ready');
  await expect(page.getByRole('article')).toHaveCount(4);
  await expect(scenario).toBeFocused();
});

for (const width of [320, 390, 768, 769, 1024, 1025, 1440]) {
  test(`recommendations preview fits ${width}px with 44px controls`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(preview);
    await expect(page.getByRole('article')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const control of await page
      .locator('.recommendations-preview a, .recommendations-preview select')
      .all()) {
      const box = (await control.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
}
