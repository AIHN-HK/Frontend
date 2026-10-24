import { expect, test } from "@playwright/test";
import { careerPlatformFixture } from "./career-platform.fixture";
test("guarded catalog and exact career detail use API provenance without preview fixtures", async ({
  page,
}) => {
  const fixture = await careerPlatformFixture(page);
  await page.goto("/careers");
  await expect(
    page.getByRole("heading", { name: "Software Developers" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Xem chi tiết nghề", exact: true })
    .click();
  await expect(page).toHaveURL(/15-1252.00$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Software Developers",
  );
  await expect(
    page.getByRole("cell", { name: "Programming", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Đọc nguồn nghề gốc" }),
  ).toHaveAttribute(
    "href",
    "https://www.onetonline.org/link/summary/15-1252.00",
  );
  expect(fixture.calls.every((c) => c.method === "GET")).toBe(true);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Software Developers",
  );
});
test("profile saves explicit zero ratings and target with revision, then generates an explained run once", async ({
  page,
}) => {
  const fixture = await careerPlatformFixture(page);
  await page.goto("/career-profile?target=15-1252.00");
  await expect(page.getByLabel("Mã nghề mục tiêu")).toHaveValue("15-1252.00");
  await page.getByLabel("Mức Programming").selectOption("0");
  await page.getByRole("button", { name: "Lưu hồ sơ định hướng" }).click();
  await expect.poll(() => fixture.profile().revision).toBe(1);
  expect(fixture.profile().skills).toEqual([{ skillId: "2.B.3.e", level: 0 }]);
  await page.goto("/recommendations");
  await page
    .getByRole("button", { name: "Tạo gợi ý nghề", exact: true })
    .dblclick();
  await expect(
    page.getByRole("heading", { name: "1. Software Developers" }),
  ).toBeVisible();
  await expect(page.getByText("80.0 / 100", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Hình dạng RIASEC: 80.0 × 100.0% = 80.0 điểm", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole('link',{name:'Nguồn nghề của bản gợi ý',exact:true})).toHaveAttribute('href','https://www.onetonline.org/link/summary/15-1252.00');
  expect(
    fixture.calls.filter(
      (c) => c.path === "/api/v1/career/recommendations" && c.method === "POST",
    ),
  ).toHaveLength(1);
  await page.getByRole("link", { name: "Đường dẫn bản gợi ý này" }).click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "1. Software Developers" }),
  ).toBeVisible();
});
test("failed profile save retains owner draft across reload without replay", async ({
  page,
}) => {
  const fixture = await careerPlatformFixture(page, { failSave: true });
  await page.goto("/career-profile");
  await page.getByLabel("Mức Programming").selectOption("2");
  await page.getByRole("button", { name: "Lưu hồ sơ định hướng" }).click();
  await expect(page.getByText(/Chưa xác nhận lưu:/)).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Mức Programming")).toHaveValue("2");
  expect(fixture.calls.filter((c) => c.method === "PUT")).toHaveLength(1);
});
test('choosing a career after viewing an unchanged profile fills the new target', async ({ page }) => {
  await careerPlatformFixture(page);
  await page.goto('/career-profile');
  await expect(page.getByLabel('Mã nghề mục tiêu')).toHaveValue('');
  await page.goto('/careers/15-1252.00');
  await page.getByRole('link', { name: 'Chọn làm mục tiêu trong hồ sơ' }).click();
  await expect(page.getByLabel('Mã nghề mục tiêu')).toHaveValue('15-1252.00');
});
test('choosing a career preserves edited skills and asks before replacing a draft target', async ({ page }) => {
  await careerPlatformFixture(page);
  await page.goto('/career-profile');
  await page.getByLabel('Mức Programming').selectOption('2');
  await page.goto('/careers/15-1252.00');
  await page.getByRole('link', { name: 'Chọn làm mục tiêu trong hồ sơ' }).click();
  await expect(page.getByLabel('Mức Programming')).toHaveValue('2');
  await expect(page.getByLabel('Mã nghề mục tiêu')).toHaveValue('');
  await page.getByRole('button', { name: 'Dùng nghề vừa chọn' }).click();
  await expect(page.getByLabel('Mã nghề mục tiêu')).toHaveValue('15-1252.00');
  await expect(page.getByLabel('Mức Programming')).toHaveValue('2');
});
for (const width of [320, 390, 768, 1440])
  test(`sourced career detail fits ${width}px with usable controls`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await careerPlatformFixture(page);
    await page.goto("/careers/15-1252.00");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Software Developers",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

test('runtime career detail shows source scales and honest unavailable local context', async ({ page }) => {
  await careerPlatformFixture(page);
  await page.goto('/careers/15-1252.00');
  await expect(page.getByRole('heading', { name: 'Mô tả công việc', exact: true })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Thông tin tham khảo nghề' })).toContainText('I: 7 / 7');
  await expect(page.getByText('Thu nhập tại Việt Nam', { exact: true })).toBeVisible();
  await expect(page.getByText('Chưa có dữ liệu có nguồn.')).toHaveCount(4);
  await expect(page.getByRole('link', { name: 'Chọn làm mục tiêu trong hồ sơ', exact: true })).toHaveAttribute('href', '/career-profile?target=15-1252.00');
  await expect(page.getByText(/94%|24tr|4 năm|Remote OK/)).toHaveCount(0);
});

test('runtime career detail handles missing, forbidden and invalid records without substituting a career', async ({ page }) => {
  await careerPlatformFixture(page);
  const { sourceCareer } = await import('./career-platform.fixture');
  for (const status of [404, 403, 503]) {
    await page.route('**/api/v1/careers/15-1252.00', route => route.fulfill({ status, json: {} }));
    await page.goto('/careers/15-1252.00');
    await expect(page.getByRole('alert')).toContainText(status === 404 ? 'Không tìm thấy nghề' : status === 403 ? 'Không có quyền' : 'Không tải được dữ liệu nghề');
    await expect(page.getByRole('link', { name: 'Chọn làm mục tiêu trong hồ sơ' })).toHaveCount(0);
    await expect(page.locator('[data-ce-photo-frame]')).toHaveCount(0);
  }
  await page.route('**/api/v1/careers/15-1252.00', route => route.fulfill({ json: { data: sourceCareer } }));
  await page.getByRole('button', { name: 'Thử tải lại dữ liệu nghề' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(sourceCareer.title);
  await page.route('**/api/v1/careers/15-1252.00', route => route.fulfill({ json: { data: { ...sourceCareer, id: '15-2051.00', title: 'Wrong career' } } }));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('không khớp mã');
  await expect(page.getByRole('heading', { name: 'Wrong career' })).toHaveCount(0);
  await page.goto('/careers/invalid-id');
  await expect(page.getByRole('alert')).toContainText('Mã nghề không hợp lệ.');
});

test('runtime career detail fits long source content and keeps the illustration badge at its edge', async ({ page }) => {
  await careerPlatformFixture(page);
  const { sourceCareer } = await import('./career-platform.fixture');
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const longTitle = 'Source occupation with a very long title '.repeat(4);
  await page.route('**/api/v1/careers/15-1252.00', route => route.fulfill({ json: { data: { ...sourceCareer, title: longTitle, skills: [{ ...sourceCareer.skills[0], skill: { id: '2.B.3.e', name: 'LongSkillName'.repeat(18) } }] } } }));
  await page.goto('/careers/15-1252.00');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(longTitle.trim());
  for (const width of [320, 390, 768, 769, 1024, 1025, 1440, 1600]) {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 });
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('banner')).toHaveCount(1);
    const frame = (await page.locator('[data-ce-photo-frame]').boundingBox())!;
    const badge = (await page.locator('[data-ce-photo-badge]').boundingBox())!;
    expect(badge.y + badge.height).toBeLessThanOrEqual(frame.y + frame.height);
    expect(badge.y).toBeGreaterThan(frame.y + frame.height * .6);
    for (const control of await page.locator('main a, main button').all()) {
      if (await control.isVisible()) expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
  }
  await page.route('**/api/v1/careers/15-1252.00', route => route.fulfill({ json: { data: { ...sourceCareer, skills: [] } } }));
  await page.reload();
  await expect(page.getByText('Chưa có dữ liệu kỹ năng.', { exact: true })).toBeVisible();
  await page.route('**/api/v1/careers/15-1252.00', route => route.fulfill({ json: { data: sourceCareer } }));
  await page.reload();
  await expect(page.getByRole('cell', { name: 'Programming', exact: true })).toBeVisible();
  await expect.poll(() => page.locator('[data-ce-photo-frame] img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  for (const [width, height] of [[390, 844], [768, 1024], [1440, 900]]) {
    await page.setViewportSize({ width: width!, height: height! });
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await page.screenshot({ path: `.superpowers/ui-sync/P08/implementation-${width}.png`, fullPage: true });
  }
  expect(errors).toEqual([]);
});

test('runtime career detail shows delayed source data and keeps late responses out of a new route', async ({ page }) => {
  const { sourceCareer } = await import('./career-platform.fixture');
  await careerPlatformFixture(page);
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/v1/careers/15-1252.00', async route => {
    await held;
    await route.fulfill({ json: { data: sourceCareer } });
  });
  await page.goto('/careers/15-1252.00');
  await expect(page.getByRole('status')).toContainText('Đang tải');
  await expect(page.locator('[data-ce-photo-frame]')).toHaveCount(0);
  await page.getByRole('link', { name: 'Về danh mục nghề', exact: true }).click();
  await expect(page).toHaveURL('/careers');
  release();
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Khám phá nghề nghiệp');
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(sourceCareer.title);
  await expect(page.locator('[data-ce-photo-frame] img')).toBeVisible();
  await expect(page.locator('[data-ce-enter]').first()).toHaveCSS('opacity', '1');
});

test('protected source detail returns to the exact career after login and hides a pending response after logout', async ({ page }) => {
  const { resultFixture } = await import('./result.fixture');
  const { sourceCareer } = await import('./career-platform.fixture');
  await resultFixture(page, { authenticated: false });
  await careerPlatformFixture(page, { anonymous: true });
  await page.goto('/careers/15-1252.00');
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fcareers%2F15-1252.00$/);
  await page.getByLabel('Email trường hoặc cá nhân').fill('student@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('password123');
  await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →' }).click();
  await expect(page).toHaveURL('/careers/15-1252.00');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(sourceCareer.title);
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/v1/careers/15-1252.00', async route => {
    await held;
    await route.fulfill({ json: { data: sourceCareer } });
  });
  await page.reload();
  await expect(page.getByRole('status')).toContainText('Đang tải');
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  release();
  await expect(page.getByRole('heading', { name: 'Đăng nhập AIHN' })).toBeVisible();
  await expect(page.locator('[data-ce-photo-frame]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: sourceCareer.title })).toHaveCount(0);
});
