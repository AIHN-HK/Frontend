import { expect, test } from '@playwright/test';
import { resultFixture } from './result.fixture';
import { advisorFixture } from './advisor.fixture';
import { adminFixture } from './admin.fixture';
import { questionsFixture } from './admin-questions.fixture';
import { scoringFixture } from './admin-scoring.fixture';
import { studentDetailFixture } from './admin-student-detail.fixture';

test('fixture journey: signup OTP login profile boolean test result history and Advisor', async ({
  page,
}) => {
  await resultFixture(page, { workflow: true, authenticated: false });
  let completed = false;
  let profile = {
    fullname: 'Học sinh 71',
    phone: '0901234567',
    address: null,
    gender: null,
    class: 12,
    email: 'journey@example.test',
  };
  await page.route(/\/api\/v1\/auth\/register(?:\/send-otp)?$/, async (route) => {
    await route.fulfill({
      status: 201,
      json: {
        status: 201,
        data: route.request().url().endsWith('send-otp')
          ? { sent: true }
          : { user: { id: 71, email: 'journey@example.test', fullname: 'Học sinh 71' } },
      },
    });
  });
  await page.route('**/api/v1/users/me', async (route) => {
    if (route.request().method() === 'PATCH') profile = { ...profile, ...route.request().postDataJSON() };
    await route.fulfill({ json: { status: 200, data: profile } });
  });
  await page.route('**/api/v1/users/me/avatar', async route => {
    await route.fulfill({ status: 404, json: { status: 404 } });
  });
  await page.route('**/api/v1/answer/submit-v2', async (route) => {
    completed = true;
    await route.fallback();
  });
  await page.route('**/api/v1/test-session/history-by-user*', async (route) => {
    await route.fulfill({
      json: {
        status: 200,
        data: {
          formattedHistory: completed
            ? [{ attemptId: 812, finishAt: '14/10/2026', analyzeType: 'NORMAL', primaryAnalyze: null }]
            : [],
          pageInfo: { hasNext: false, nextCursor: null },
        },
      },
    });
  });
  await page.goto('/signup');
  await page.getByLabel('Họ và tên của bạn').fill('Học sinh 71');
  await page.getByLabel('Địa chỉ Email').fill('journey@example.test');
  await page.getByLabel('Ngày sinh').fill('2008-01-01');
  await page.getByLabel('Số điện thoại').fill('0901234567');
  await page.getByLabel('Tạo mật khẩu').fill('JourneyPassword!');
  await page.getByRole('button', { name: 'Tiếp tục xác thực OTP →' }).click();
  await page
    .getByRole('textbox', { name: /^Chữ số/ })
    .first()
    .fill('123456');
  await page.getByRole('button', { name: 'Xác nhận đăng ký' }).click();
  await expect(page).toHaveURL(/login$/);
  await page.getByLabel('Email trường hoặc cá nhân').fill('journey@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('JourneyPassword!');
  await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →' }).click();
  await expect(page).toHaveURL(/dashboard$/);
  await page.goto('/career-profile');
  await page.getByLabel('Họ và tên', { exact: true }).fill('Học sinh hành trình');
  await page.getByRole('button', { name: 'Lưu cập nhật', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã lưu cập nhật hồ sơ.' })).toBeVisible();
  await page.goto('/assessment');
  await page.getByRole('button', { name: 'Bắt đầu bài trắc nghiệm', exact: true }).click();
  for (let i = 0; i < 3; i++) {
    await page.getByRole('radio', { name: 'Có — Tôi thích', exact: true }).check();
    if (i < 2) await page.getByRole('button', { name: 'Tiếp theo', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Nộp bài', exact: true }).click();
  await expect(page.getByText('TopCode: ISC', { exact: true })).toBeVisible();
  await page.goto('/history');
  await expect(page.getByRole('article', { name: 'Lần làm #812', exact: true })).toBeVisible();
  const advisor = await advisorFixture(page);
  await page.goto('/advisor');
  await page.getByLabel('Câu hỏi của bạn', { exact: true }).fill('Tôi nên bắt đầu khám phá nghề như thế nào?');
  await page.getByRole('button', { name: 'Gửi', exact: true }).click();
  await expect(page.getByText('Lượt trả lời đã hoàn tất.', { exact: true })).toBeVisible();
  expect(advisor.commands.filter(command => command.event === 'ask')).toHaveLength(1);
});

test('fixture admin journey: overview questions priorities students and logout', async ({ page }) => {
  await studentDetailFixture(page);
  await questionsFixture(page, {}, false);
  await scoringFixture(page, {}, false);
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Tổng quan hệ thống' })).toBeVisible();
  await page.getByRole('link', { name: 'Ngân hàng câu hỏi', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Ngân hàng câu hỏi Holland' })).toBeVisible();
  await page.getByRole('link', { name: 'Cấu hình chấm điểm', exact: true }).click();
  await expect(page.getByLabel('Ưu tiên R', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Quản lý sinh viên', exact: true }).click();
  await page.getByRole('link', { name: 'Học sinh 100', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Học sinh 100', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await expect(page).toHaveURL(/login/);
  await expect(page.getByTestId('workspace-shell')).toHaveCount(0);
});

test('student dark theme covers assessment and dashboard without changing admin palette', async ({
  page,
}) => {
  await resultFixture(page);
  await page.addInitScript(() =>
    localStorage.setItem(
      'aihn.appearance.v1',
      JSON.stringify({ version: 1, preset: 'dark', accent: 'teal', background: 'flat', sidebar: 'light' }),
    ),
  );
  for (const path of [
    '/dashboard',
    '/career-profile',
    '/assessment',
    '/assessment/results/812',
    '/history',
    '/advisor',
    '/settings',
  ]) {
    await page.goto(path);
    await expect(page.locator('.student-theme').first()).toBeVisible();
    expect(
      await page
        .locator('.student-theme')
        .first()
        .evaluate((el) => getComputedStyle(el).getPropertyValue('--bg-app').trim().toLowerCase()),
    ).toBe('#0b0f19');
  }
  await page.goto('/preview/admin');
  expect(
    await page
      .locator('.admin-theme')
      .first()
      .evaluate((el) => getComputedStyle(el).getPropertyValue('--bg-app').trim().toLowerCase()),
  ).toBe('#f8fafc');
});

test('revoked admin permission hides cached private data immediately', async ({ page }) => {
  const options = { overviewStatus: 200 };
  await adminFixture(page, options);
  await page.goto('/admin');
  await expect(page.getByTestId('count-students')).toHaveText('3');
  options.overviewStatus = 403;
  await page.getByRole('button', { name: 'Làm mới dữ liệu' }).click();
  await expect(page.getByRole('heading', { name: 'Bạn không có quyền quản trị' })).toBeVisible();
  await expect(page.getByTestId('workspace-shell')).toHaveCount(0);
});

test('late admin snapshot from account A cannot appear in account B', async ({ page }) => {
  let release!: () => void;
  const options = {
    owner: 71,
    overviewCount: 3,
    overviewGate: new Promise<void>((r) => (release = r)) as Promise<void> | undefined,
  };
  const calls = await adminFixture(page, options);
  await page.goto('/admin');
  await expect.poll(() => calls.filter((c) => c.path.endsWith('/overview')).length).toBe(1);
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  options.owner = 72;
  options.overviewCount = 7;
  options.overviewGate = undefined;
  await page.getByLabel('Email trường hoặc cá nhân').fill('b@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Password123!');
  await page.getByRole('button', { name: 'Đăng nhập vào Trang của tôi →' }).click();
  await expect(page.getByTestId('count-students')).toHaveText('7');
  release();
  await expect(page.getByTestId('count-students')).toHaveText('7');
});

test('preview recommendation detail leads to a read-only roadmap template', async ({ page }) => {
  await page.goto('/preview/recommendations');
  await page.getByRole('link', { name: 'Xem phân tích mẫu' }).first().click();
  await page.getByRole('link', { name: 'Xem mẫu lộ trình chỉ đọc' }).click();
  await expect(page.getByRole('heading', { name: 'Chọn lộ trình mẫu' })).toBeVisible();
  await page.getByLabel('Mục tiêu mẫu').selectOption('software');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Lộ trình mẫu: Kỹ sư Phần mềm' })).toBeVisible();
});
