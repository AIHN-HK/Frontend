import { expect, test } from '@playwright/test';

test('public fallback and direct unknown URLs give an honest unavailable/404 state', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Trang đang được chuẩn bị' })).toBeVisible();
  await page.goto('/khong-ton-tai/deep-link');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Không tìm thấy trang' })).toBeVisible();
  await page.getByRole('link', { name: 'Về trang chủ' }).click();
  await expect(page).toHaveURL(/\/$/);
});

for (const [width, sidebarWidth] of [[320, 0], [390, 0], [768, 0], [769, 72], [1024, 72], [1025, 256], [1440, 256]]) {
  test(`student shell fits ${width}px and uses the correct navigation mode`, async ({ page }) => {
    await page.setViewportSize({ width: width!, height: 900 });
    await page.goto('/preview/student');
    const sidebar = page.getByTestId('workspace-sidebar');
    const bottom = page.getByRole('navigation', { name: 'Điều hướng chính di động' });
    const opener = page.getByRole('button', { name: 'Mở menu phụ' });
    if (sidebarWidth) {
      await expect(sidebar).toBeVisible();
      expect((await sidebar.boundingBox())!.width).toBe(sidebarWidth);
      await expect(bottom).toBeHidden();
      await expect(opener).toBeHidden();
    } else {
      await expect(sidebar).toBeHidden();
      await expect(bottom).toBeVisible();
      await expect(opener).toBeVisible();
      expect((await bottom.boundingBox())!.height).toBe(64);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const main = (await page.getByRole('main').boundingBox())!;
    expect(main.width).toBeLessThanOrEqual(1240);
    expect(main.x).toBeGreaterThanOrEqual(sidebarWidth!);
    expect(main.y).toBeGreaterThanOrEqual(60);
    if (!sidebarWidth) {
      const links = await bottom.getByRole('link').all();
      for (const link of links) {
        const box = (await link.boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
}

test('admin/student palettes stay scoped across client navigation', async ({ page }) => {
  await page.goto('/preview/student');
  await expect(page.getByTestId('workspace-shell')).toHaveCSS('background-color', 'rgb(243, 250, 252)');
  await expect(page.getByRole('button', { name: 'Mở hộp thoại' })).toHaveCSS('background-color', 'rgb(2, 143, 148)');
  await page.getByRole('link', { name: 'Xem giao diện quản trị' }).click();
  await expect(page.getByTestId('workspace-shell')).toHaveCSS('background-color', 'rgb(248, 250, 252)');
  await expect(page.getByRole('button', { name: 'Mở hộp thoại' })).toHaveCSS('background-color', 'rgb(13, 148, 136)');
  await page.getByRole('link', { name: 'Xem giao diện sinh viên' }).click();
  await expect(page.getByTestId('workspace-shell')).toHaveCSS('background-color', 'rgb(243, 250, 252)');
});

test('mobile drawer locks scrolling, contains keyboard focus and restores the opener', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/preview/student');
  const opener = page.getByRole('button', { name: 'Mở menu phụ' });
  await opener.click();
  const drawer = page.getByRole('dialog', { name: 'Điều hướng' });
  await expect(drawer).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await expect(drawer.getByRole('button', { name: 'Đóng' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  expect(await drawer.evaluate(node => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Tab');
  await expect(drawer.getByRole('button', { name: 'Đóng' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(opener).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('drawer closes on navigation and when switching to desktop', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/preview/student');
  await page.getByRole('button', { name: 'Mở menu phụ' }).click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole('dialog', { name: 'Điều hướng' })).toBeHidden();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Mở menu phụ' }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'Trang của tôi' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('modal remains keyboard accessible and restores focus', async ({ page }) => {
  await page.goto('/preview/admin');
  const opener = page.getByRole('button', { name: 'Mở hộp thoại' });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Thông báo' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Đóng' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Đã hiểu' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Đóng' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

for (const route of ['/dashboard', '/admin', '/admin/questions']) {
  test(`anonymous access to ${route} requires a session without exposing a private shell`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Trang đang được chuẩn bị' })).toBeVisible();
    await expect(page.getByTestId('workspace-shell')).toHaveCount(0);
  });
}

test('public entry does not eagerly request workspace layouts or legacy runtime chunks', async ({ page }) => {
  const scripts: string[] = [];
  const errors: string[] = [];
  page.on('request', request => { if (request.resourceType() === 'script') scripts.push(request.url()); });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Trang đang được chuẩn bị' })).toBeVisible();
  expect(scripts.join('\n')).not.toMatch(/AdminLayout|StudentLayout|WorkspaceShell|socket|expo|react-native/i);
  expect(errors).toEqual([]);
  await page.goto('/preview/admin');
  await expect(page.getByTestId('workspace-shell')).toBeVisible();
  expect(scripts.some(url => url.includes('AdminLayout'))).toBe(true);
});

test('lazy navigation shows pending state until the route chunk arrives', async ({ page }) => {
  let release!: () => void;
  const ready = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/assets/AdminLayout-*.js', async route => { await ready; await route.continue(); });
  await page.goto('/');
  await page.getByRole('link', { name: 'Giao diện quản trị', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Đang tải…');
  release();
  await expect(page.getByTestId('workspace-shell')).toBeVisible();
  await expect(page.getByRole('status')).toHaveCount(0);
});

test('a failed lazy route chunk offers an explicit recovery action', async ({ page }) => {
  await page.route('**/assets/AdminLayout-*.js', route => route.abort());
  await page.goto('/');
  await page.getByRole('link', { name: 'Giao diện quản trị', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Không thể tải trang' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tải lại trang' })).toBeVisible();
});

test('shell review screenshots at the three reference viewports', async ({ page }, info) => {
  for (const [width, height] of [[390, 844], [768, 1024], [1440, 900]]) {
    await page.setViewportSize({ width: width!, height: height! });
    for (const kind of ['student', 'admin', 'auth']) {
      await page.goto(`/preview/${kind}`);
      await expect(page.getByRole('heading', { name: kind === 'admin' ? 'Không gian quản trị' : 'Chào mừng đến với AIHN Career', exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const screenshot = info.outputPath(`${kind}-${width}.png`);
      await page.screenshot({ path: screenshot });
      await info.attach(`${kind}-${width}`, { path: screenshot, contentType: 'image/png' });
    }
  }
});
