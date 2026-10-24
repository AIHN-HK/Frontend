import { expect, test } from "@playwright/test";
import { careerPlatformFixture } from "./career-platform.fixture";
test("roadmap requires a target, shows deterministic gaps and tracks evidenced phase completion", async ({
  page,
}) => {
  const fixture = await careerPlatformFixture(page, { seedProfile: true });
  await page.goto("/roadmap");
  await expect(
    page.getByRole("cell", { name: "Programming", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Tạo lộ trình từ mục tiêu", exact: true })
    .click();
  await expect(
    page.getByText("0/4 nhiệm vụ hoàn thành · phiên bản 1", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("button", { name: "Xác nhận hoàn thành", exact: true })
      .nth(1),
  ).toBeDisabled();
  await page
    .getByRole("textbox", {
      name: "Minh chứng — Fixture roadmap explore",
      exact: true,
    })
    .fill("Đã đọc mô tả công việc và ghi nhận lý do quan tâm.");
  await page
    .getByRole("button", { name: "Xác nhận hoàn thành", exact: true })
    .first()
    .click();
  await expect(
    page.getByText("1/4 nhiệm vụ hoàn thành · phiên bản 2", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Cập nhật lộ trình từ hồ sơ hiện tại" })
    .click();
  await expect(
    page.getByText("1/4 nhiệm vụ hoàn thành · phiên bản 3", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("textbox", {
      name: "Minh chứng — Fixture roadmap explore",
      exact: true,
    }),
  ).toHaveValue("Đã đọc mô tả công việc và ghi nhận lý do quan tâm.");
  expect(fixture.calls.filter((c) => c.method === "PATCH")).toHaveLength(1);
});
test("unknown progress write keeps evidence across reload and does not replay", async ({
  page,
}) => {
  const fixture = await careerPlatformFixture(page, {
    seedProfile: true,
    failTask: true,
  });
  await page.goto("/roadmap");
  await page
    .getByRole("button", { name: "Tạo lộ trình từ mục tiêu", exact: true })
    .click();
  const input = page.getByRole("textbox", {
    name: "Minh chứng — Fixture roadmap explore",
    exact: true,
  });
  await input.fill("Evidence draft to review");
  await page
    .getByRole("button", { name: "Xác nhận hoàn thành", exact: true })
    .first()
    .click();
  await expect(page.getByText(/Chưa xác nhận lưu:/)).toBeVisible();
  await page.reload();
  await expect(input).toHaveValue("Evidence draft to review");
  expect(fixture.calls.filter((c) => c.method === "PATCH")).toHaveLength(1);
});
test("dashboard compares snapshot-normalized RIASEC and displays real counts", async ({
  page,
}) => {
  await careerPlatformFixture(page);
  await page.goto("/dashboard");
  const analytics = page.getByRole("region", {
    name: "Phân tích hành trình hướng nghiệp",
  });
  await expect(analytics).toContainText("2 bài hoàn thành");
  await expect(analytics).toContainText("I: +10.0");
  await expect(
    analytics.getByRole("link", { name: "#812", exact: true }),
  ).toHaveAttribute("href", "/assessment/results/812");
});
test("admin publishes or archives by revision and inspects skill and usage provenance", async ({
  page,
}) => {
  const fixture = await careerPlatformFixture(page, { admin: true });
  await page.goto("/admin/careers");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Dữ liệu nghề và phân tích hệ thống",
  );
  await page.getByRole("button", { name: "Ẩn nghề", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Xuất bản nghề", exact: true }),
  ).toBeVisible();
  expect(fixture.calls.find((c) => c.method === "PATCH")?.body).toEqual({
    revision: 1,
    active: false,
  });
  await expect(
    page.getByText("2.B.3.e: Programming", { exact: true }),
  ).toBeVisible();
});
for (const width of [320, 390, 768, 769, 1024, 1025, 1440])
  test(`progress and analytics remain usable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await careerPlatformFixture(page, { seedProfile: true });
    await page.goto("/roadmap");
    await page
      .getByRole("button", { name: "Tạo lộ trình từ mục tiêu", exact: true })
      .click();
    await expect(
      page.getByText("0/4 nhiệm vụ hoàn thành · phiên bản 1", { exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const control of await page
      .locator(
        ".career-platform button:visible,.career-platform textarea:visible,.career-platform a:visible",
      )
      .all())
      expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });

test('roadmap timeline uses confirmed tasks and fits responsive source layouts', async ({ page }) => {
  const { reviewResponsive } = await import('./ui-sync.fixture');
  const fixture = await careerPlatformFixture(page, { seedProfile: true });
  await page.goto('/roadmap');
  await page.getByRole('button', { name: 'Tạo lộ trình từ mục tiêu', exact: true }).click();
  await expect(page.getByText('0/4 nhiệm vụ hoàn thành · phiên bản 1', { exact: true })).toBeVisible();
  await expect(page.locator('[data-phase-state=done]')).toHaveCount(0);
  await reviewResponsive(page, 'P09', '.career-platform');
  expect(fixture.calls.filter(c => c.method === 'POST')).toHaveLength(1);
});
