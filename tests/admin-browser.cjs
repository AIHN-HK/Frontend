const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const origin = process.env.ADMIN_WEB_ORIGIN || "http://localhost:8085";
const artifactDir = process.env.ADMIN_ARTIFACT_DIR || "/tmp";

(async () => {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    await context.addInitScript(() => {
      if (localStorage.getItem("__admin_seeded")) return;
      localStorage.setItem("__admin_seeded", "true");
      for (const [k, v] of Object.entries({
        access_token: "admin-A",
        refresh_token: "refresh-A",
        USER_ID: 2,
        USER_NAME: "Quản trị viên",
      }))
        localStorage.setItem(k, JSON.stringify(v));
    });
    const page = await context.newPage();
    let deny = false,
      failSave = true,
      saves = 0,
      searchSeen = false;
    const groups = ["R", "I", "A", "S", "E", "C"];
    let priorities = groups.map((type, i) => ({
      id: i + 1,
      type,
      priority: i + 1,
    }));
    const questions = [
      {
        id: 1,
        content: "Tôi thích khám phá khoa học",
        type: "I",
        dimension: "INTEREST",
        used: false,
        editable: true,
      },
      {
        id: 2,
        content: "Tôi thích giúp đỡ mọi người",
        type: "S",
        dimension: "INTEREST",
        used: true,
        editable: false,
      },
    ];
    await page.route("**/api/v1/**", async (route) => {
      const req = route.request(),
        url = new URL(req.url()),
        path = url.pathname;
      let data;
      if (path.endsWith("/admin/me")) {
        if (deny)
          return route.fulfill({ status: 403, json: { message: "Forbidden" } });
        data = {
          id: req.headers().authorization === "Bearer admin-B" ? 3 : 2,
          fullname: "Quản trị viên",
          role: "ADMIN",
        };
      } else if (path.endsWith("/admin/overview"))
        data = {
          counts: {
            students: 12,
            completedTests: 18,
            chatSessions: 9,
            questions: 108,
          },
          recentAttempts: [
            {
              id: 7,
              finishAt: "2026-10-10",
              user: { id: 1, fullname: "Nguyễn An" },
              result: { topCode: "ISA" },
            },
          ],
        };
      else if (path.endsWith("/admin/questions"))
        data = { activeAttempts: 0, items: questions };
      else if (path.endsWith("/question") && req.method() === "POST") {
        saves++;
        if (failSave)
          return route.fulfill({
            status: 503,
            json: { message: "Lưu thất bại, hãy thử lại." },
          });
        const body = req.postDataJSON();
        questions.push({ ...body, id: 3, used: false, editable: true });
        data = { data: body };
      } else if (path.endsWith("/admin/topcodes"))
        data = groups.map((code) => ({
          code,
          title: `Nhóm ${code}`,
          description: null,
          personality: ["Đặc điểm"],
          strengths: ["Điểm mạnh"],
          weaknesses: ["Điểm cần cải thiện"],
          careers: ["Nghề nghiệp"],
        }));
      else if (path.endsWith("/priority")) data = priorities;
      else if (path.endsWith("/admin/priorities")) {
        const body = req.postDataJSON();
        assert.equal(body.priorities.length, 6);
        assert.equal(body.priorities[0].type, "I");
        priorities = body.priorities.map((p) => ({
          ...p,
          id: groups.indexOf(p.type) + 1,
        }));
        data = priorities;
      } else if (path.endsWith("/topcode")) {
        const body = req.postDataJSON();
        assert.equal(body.title, "Nhóm kỹ thuật mới");
        data = body;
      } else if (path.endsWith("/admin/students")) {
        searchSeen = url.searchParams.get("q") === "An";
        data = {
          items: [
            {
              id: 1,
              fullname: "Nguyễn An",
              email: "an@example.test",
              class: 11,
            },
          ],
          total: 1,
          page: 1,
          limit: 20,
        };
      } else if (path.endsWith("/admin/students/1"))
        data = {
          student: {
            id: 1,
            fullname: "Nguyễn An",
            email: "an@example.test",
            class: 11,
          },
          attempts: {
            items: [
              {
                id: 7,
                finishAt: "2026-10-10",
                result: {
                  topCode: "ISA",
                  scoreR: 1,
                  scoreI: 8,
                  scoreA: 6,
                  scoreS: 7,
                  scoreE: 3,
                  scoreC: 2,
                },
              },
            ],
            total: 1,
            page: 1,
            limit: 20,
          },
        };
      else if (path.endsWith("/auth/login")) {
        const other = req.postDataJSON().email.startsWith("b-admin");
        data = {
          accessToken: other ? "admin-B" : "admin-A",
          refreshToken: "refresh-A",
          user: { id: other ? 3 : 2, fullname: "Quản trị viên", role: "ADMIN" },
        };
      } else data = {};
      return route.fulfill({ json: { data } });
    });
    await page.goto(`${origin}/admin`);
    await page.getByTestId("admin-overview").waitFor({ timeout: 60000 });
    await page.getByText("Nguyễn An", { exact: true }).waitFor();
    await page.screenshot({
      path: `${artifactDir}/admin-desktop.png`,
      fullPage: true,
    });
    await page.getByTestId("admin-nav-questions").click();
    await page.getByTestId("admin-add-question").click();
    await page
      .getByTestId("admin-question-content")
      .fill("Câu hỏi mới của tôi");
    await page.getByTestId("admin-question-save").click();
    await page
      .getByText("Lưu thất bại, hãy thử lại.", { exact: true })
      .waitFor();
    assert.equal(
      await page.getByTestId("admin-question-content").inputValue(),
      "Câu hỏi mới của tôi",
    );
    assert.equal(saves, 1);
    failSave = false;
    await page.getByTestId("admin-question-save").click();
    await page.getByText("Câu hỏi mới của tôi", { exact: true }).waitFor();
    assert.equal(saves, 2);
    assert.equal(await page.getByTestId("admin-question-edit-2").count(), 0);
    await page.getByTestId("admin-nav-holland").click();
    await page.getByTestId("admin-holland-R").click();
    await page.getByTestId("admin-holland-title").fill("Nhóm kỹ thuật mới");
    await page.getByTestId("admin-holland-save").click();
    await page.getByText("Đã lưu nội dung Holland.", { exact: true }).waitFor();
    await page.getByTestId("admin-nav-priorities").click();
    await page.getByTestId("admin-priority-up-I").click();
    await page.getByTestId("admin-priorities-save").click();
    await page.getByText("Đã lưu thứ tự ưu tiên.", { exact: true }).waitFor();
    await page.getByText("Khôi phục thứ tự đã tải", { exact: true }).click();
    assert.equal(
      await page.getByTestId("admin-priority-up-I").isDisabled(),
      true,
      "reset must use the newly saved order",
    );
    await page.getByTestId("admin-nav-students").click();
    await page.getByTestId("admin-student-search").fill("An");
    await page.getByTestId("admin-student-search-submit").click();
    await page.waitForTimeout(250);
    assert.ok(searchSeen);
    await page.getByTestId("admin-student-1").click();
    await page.getByTestId("admin-student-detail").waitFor();
    await page.getByText("ISA", { exact: true }).waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: `${artifactDir}/admin-mobile.png`,
      fullPage: true,
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    assert.equal(
      overflow,
      false,
      "admin page must not overflow a 390px viewport",
    );
    for (const section of [
      "overview",
      "questions",
      "holland",
      "priorities",
      "students",
    ]) {
      await page.getByTestId(`admin-nav-${section}`).click();
      await page.waitForTimeout(150);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        ),
        false,
        `${section} must fit mobile viewport`,
      );
      await page.screenshot({
        path: `${artifactDir}/admin-${section}-mobile.png`,
        fullPage: true,
      });
    }
    await page.getByTestId("admin-nav-questions").click();
    await page.getByTestId("admin-add-question").click();
    await page
      .getByTestId("admin-question-content")
      .fill("Bản nháp khi token hết hạn");
    await page.route(
      "**/api/v1/question",
      async (route) =>
        route.fulfill({ status: 401, json: { message: "Unauthorized" } }),
      { times: 1 },
    );
    await page.getByTestId("admin-question-save").click();
    await page.waitForURL((url) => !url.pathname.startsWith("/admin"));
    await page
      .locator('input[placeholder="Số điện thoại hoặc email"]:visible')
      .last()
      .fill("b-admin@example.test");
    await page
      .locator('input[placeholder="Mật khẩu"]:visible')
      .last()
      .fill("test-only-password");
    await page.getByText("Đăng nhập", { exact: true }).last().click();
    await page.getByTestId("admin-overview").waitFor();
    await page.getByTestId("admin-nav-questions").click();
    assert.equal(
      await page.getByTestId("admin-question-content").count(),
      0,
      "a different admin cannot see the original draft",
    );
    await page.getByText("Đăng xuất", { exact: true }).click();
    await page.waitForURL((url) => !url.pathname.startsWith("/admin"));
    await page
      .locator('input[placeholder="Số điện thoại hoặc email"]:visible')
      .last()
      .fill("admin@example.test");
    await page
      .locator('input[placeholder="Mật khẩu"]:visible')
      .last()
      .fill("test-only-password");
    await page.getByText("Đăng nhập", { exact: true }).last().click();
    await page.getByTestId("admin-overview").waitFor();
    await page.getByTestId("admin-nav-questions").click();
    await page.getByTestId("admin-question-content").waitFor({ timeout: 5000 });
    assert.equal(
      await page.getByTestId("admin-question-content").inputValue(),
      "Bản nháp khi token hết hạn",
    );
    assert.equal(
      saves,
      2,
      "expired-token mutation must never replay automatically",
    );
    deny = true;
    await page.goto(`${origin}/admin`);
    await page.getByTestId("admin-forbidden").waitFor();
    assert.equal(await page.getByTestId("admin-overview").count(), 0);
    await page.evaluate(() => {
      for (const key of ["access_token", "refresh_token", "USER_ID"])
        localStorage.removeItem(key);
    });
    await page.reload();
    await page.waitForURL((url) => !url.pathname.startsWith("/admin"));
    console.log(
      "PASS admin browser: overview, question draft/retry/locks, Holland, atomic priority, student search/detail, mobile, USER/guest guard",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
