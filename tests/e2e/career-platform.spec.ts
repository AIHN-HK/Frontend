import { expect, test } from "@playwright/test";
import { careerPlatformFixture } from "./career-platform.fixture";
test("public catalog and exact career detail use API provenance without preview fixtures", async ({
  page,
}) => {
  const fixture = await careerPlatformFixture(page, { anonymous: true });
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
for (const width of [320, 390, 768, 1440])
  test(`sourced career detail fits ${width}px with usable controls`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await careerPlatformFixture(page, { anonymous: true });
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
