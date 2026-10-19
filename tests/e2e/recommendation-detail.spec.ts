import { expect, test } from '@playwright/test';
import { advisorFixture } from './advisor.fixture';
const url = '/preview/recommendations/preview-rec-software';
test('recommendation detail reads exact ID and retains list sort after reload', async ({ page }) => {
  await page.goto(`${url}?sort=name`);
  await expect(page.getByRole('heading', { level: 1, name: 'Phân tích mẫu: Kỹ sư Phần mềm' })).toBeVisible();
  await expect(page.getByRole('note')).toContainText('Dữ liệu mẫu');
  await expect(page.getByText('Chưa có dữ liệu đóng góp RIASEC được xác nhận.')).toBeVisible();
  await page.reload();
  await page.getByRole('link', { name: 'Quay lại gợi ý mẫu' }).click();
  await expect(page).toHaveURL(/preview\/recommendations\?sort=name$/);
});
test('invalid and unknown IDs never fall back to a different recommendation', async ({ page }) => {
  await page.goto('/preview/recommendations/71');
  await expect(page.getByRole('heading', { name: 'Mã gợi ý mẫu không hợp lệ' })).toBeVisible();
  await page.goto('/preview/recommendations/preview-rec-unknown');
  await expect(page.getByRole('heading', { name: 'Không tìm thấy gợi ý mẫu' })).toBeVisible();
});
test('stale preview is labeled, general sources are not personal evidence and no target is saved', async ({
  page,
}) => {
  const calls: string[] = [];
  page.on('request', (r) => {
    if (/\/api\/|socket.io/.test(r.url())) calls.push(r.url());
  });
  await page.goto(`${url}?scenario=stale`);
  await expect(page.getByRole('alert')).toContainText('Hồ sơ mẫu đã thay đổi');
  await expect(
    page.getByText('Tài liệu nghề chung, không phải bằng chứng độ phù hợp cá nhân.'),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /Lưu|Đặt mục tiêu/ })).toHaveCount(0);
  expect(calls).toEqual([]);
});
test('runtime is owned/guarded unavailable and does not fetch preview data', async ({ page }) => {
  const fixture = await advisorFixture(page);
  await page.goto('/recommendations/71');
  await expect(page.getByRole('heading', { name: 'Phân tích gợi ý chưa sẵn sàng' })).toBeVisible();
  expect(fixture.requests.filter((r) => /recommendation/.test(r.path))).toEqual([]);
});
for (const width of [320, 390, 768, 769, 1024, 1025, 1440])
  test(`recommendation detail fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(url);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Phân tích mẫu: Kỹ sư Phần mềm' }),
    ).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const a of await page.locator('.recommendation-detail a').all())
      expect((await a.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });
