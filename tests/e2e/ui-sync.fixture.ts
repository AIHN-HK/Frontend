import { expect, type Page } from '@playwright/test';

export async function reviewResponsive(page: Page, plan: string, selector: string) {
  const root = page.locator(selector);
  await expect(root).toBeVisible();
  for (const marker of await root.locator('[data-ce-enter]').all()) await expect(marker).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 768, 769, 1024, 1025, 1440, 1600]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : width === 768 ? 1024 : 900 });
    // Capture the sticky shell at the document top after form interactions scroll down.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('main')).toHaveCount(1);
    for (const control of await root.locator('button:visible,a:visible,input:visible,textarea:visible,select:visible').all()) {
      if (await control.getAttribute('type') === 'checkbox' || await control.getAttribute('type') === 'radio' || await control.getAttribute('type') === 'file') continue;
      expect((await control.boundingBox())!.height, `${plan} ${width}px: ${await control.evaluate(element => element.outerHTML)}`).toBeGreaterThanOrEqual(44);
    }
    if ([390, 768, 1440].includes(width)) await page.screenshot({ path: `.superpowers/ui-sync/${plan}/implementation-${width}.png`, fullPage: true });
  }
}
