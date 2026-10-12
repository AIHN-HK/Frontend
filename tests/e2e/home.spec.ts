import { expect, test } from '@playwright/test';

test('guest sees public Home and explicitly labeled example data without personal requests', async ({ page }) => {
  const personal: string[] = [];
  const errors: string[] = [];
  page.on('request', request => { if (['fetch', 'xhr', 'websocket'].includes(request.resourceType())) personal.push(request.url()); });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('phù hợp nhất của bạn');
  await expect(page.getByRole('region', { name: 'Ví dụ bàn làm việc · Dữ liệu mẫu' })).toBeVisible();
  await expect(page.getByRole('banner').getByText('Minh Hải')).toHaveCount(0);
  await expect(page.getByRole('contentinfo').getByText('AIHN Career Guidance Platform')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(personal).toEqual([]);
  expect(errors).toEqual([]);
});

test('Home CTAs register the real URLs and enforce guest guards/unavailable catalog', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Làm trắc nghiệm Holland →', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Trang đang được chuẩn bị' })).toBeVisible();
  await page.goto('/');
  await page.getByRole('link', { name: 'Khám phá nghề nghiệp →', exact: true }).click();
  await expect(page).toHaveURL(/\/careers$/);
  await expect(page.getByRole('heading', { name: 'Trang đang được chuẩn bị' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Trang đang được chuẩn bị' })).toBeVisible();
  await page.goto('/');
  await page.getByRole('link', { name: 'Bắt đầu ngay →', exact: true }).click();
  await expect(page).toHaveURL(/\/signup$/);
});

test('every product example action uses a registered guarded destination', async ({ page }) => {
  const actions = [['Xem kết quả', '/assessment'], ['Khám phá ngay', '/recommendations'], ['Xem lộ trình', '/roadmap'], ['Đặt câu hỏi', '/advisor'], ['Xem tất cả →', '/recommendations']] as const;
  for (const [label, href] of actions) {
    await page.goto('/');
    const link = page.getByRole('region', { name: 'Ví dụ bàn làm việc · Dữ liệu mẫu' }).getByRole('link', { name: label, exact: true });
    await expect(link).toHaveAttribute('href', href);
    await link.click();
    await expect(page).toHaveURL(/\/login$/);
  }
});

for (const width of [320, 390, 768, 769, 1024, 1025, 1280, 1281, 1440]) {
  test(`Home remains usable at ${width}px including navigation and touch targets`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const opener = page.getByRole('button', { name: 'Mở menu' });
    const desktop = page.getByRole('navigation', { name: 'Điều hướng chính', exact: true });
    if (width <= 1280) {
      await expect(opener).toBeVisible();
      await expect(desktop).toBeHidden();
      await opener.click();
      await expect(page.getByRole('navigation', { name: 'Điều hướng di động' })).toBeVisible();
    } else {
      await expect(opener).toBeHidden();
      await expect(desktop).toBeVisible();
      const headerWidth = (await page.getByRole('banner').boundingBox())!.width;
      expect(headerWidth).toBeLessThanOrEqual(width);
    }
    for (const link of await page.getByRole('link').all()) {
      if (!await link.isVisible() || await link.getAttribute('class') === 'skip-link') continue;
      const box = (await link.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });
}

test('mobile menu supports keyboard, same-route close, Escape and resize reset', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const opener = page.getByRole('button', { name: 'Mở menu' });
  await opener.focus();
  await page.keyboard.press('Enter');
  const menu = page.getByRole('navigation', { name: 'Điều hướng di động' });
  await expect(menu).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(menu.getByRole('link', { name: 'Trang chủ', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(opener).toBeFocused();
  await opener.click();
  await menu.getByRole('link', { name: 'Trang chủ', exact: true }).click();
  await expect(menu).toBeHidden();
  await opener.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(menu).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(menu).toBeHidden();
  await opener.click();
  await menu.getByRole('link', { name: 'Khám phá nghề nghiệp', exact: true }).click();
  await expect(page).toHaveURL(/\/careers$/);
  await expect(menu).toBeHidden();
});

test('keyboard skip link reaches Home main content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Bỏ qua điều hướng' })).toBeFocused();
  expect(await page.getByRole('link', { name: 'Bỏ qua điều hướng' }).evaluate(node => {
    const box = node.getBoundingClientRect();
    return node.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
  })).toBe(true);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test('desktop header keeps login/signup text on a single line without clipping', async ({ page }) => {
  for (const width of [1281, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    for (const label of ['Đăng nhập', 'Bắt đầu ngay →']) {
      const link = page.getByRole('banner').getByRole('link', { name: label, exact: true });
      const text = await link.evaluate(node => {
        const range = document.createRange(); range.selectNodeContents(node);
        const box = range.getBoundingClientRect();
        return { height: box.height, lineHeight: parseFloat(getComputedStyle(node).lineHeight) };
      });
      expect(text.height).toBeLessThanOrEqual(text.lineHeight * 1.1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('Home review screenshots include loaded illustrations at standard viewports', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [width, height] of [[390, 844], [768, 1024], [1440, 900]]) {
    await page.setViewportSize({ width: width!, height: height! });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const image = page.getByRole('img', { name: 'Nữ sinh viên ôm laptop học tập tự tin và rạng rỡ' });
    await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
    await page.evaluate(() => document.fonts.ready);
    const screenshot = info.outputPath(`home-${width}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    await info.attach(`home-${width}`, { path: screenshot, contentType: 'image/png' });
  }
});
