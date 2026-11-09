import { expect, test } from '@playwright/test';

// An inaccessible badge token, invisible focus ring, or skipped heading
// must fail here even when the page still builds successfully.
for (const width of [1440, 1024, 768, 390]) {
  test(`Home keeps readable labels and sequential headings at ${width}px`, async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: ({ 1440: 900, 1024: 768, 768: 1024, 390: 844 })[width]! });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Hiểu mình trước');
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    const story = page.getByRole('region', { name: 'AIHN hoạt động thế nào', exact: true });
    const steps = story.getByRole('button', { name: /^0[1-6] / });
    for (let index = 0; index < 6; index++) {
      await steps.nth(index).click();
      const levels = await page.getByRole('heading').evaluateAll(elements => elements.map(el => Number(el.tagName.slice(1))));
      expect(levels.filter((level, i) => i > 0 && level > levels[i - 1]! + 1)).toEqual([]);
    }

    const ratios = await page.getByRole('region', { name: 'Ví dụ kết quả RIASEC', exact: true })
      .locator('[class*="riasec-bar-badge"]').evaluateAll(elements => {
        const luminance = (rgb: number[]) => rgb.map(value => {
          const channel = value / 255;
          return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
        }).reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i]!, 0);
        const parse = (color: string) => color.match(/[\d.]+/g)!.slice(0, 3).map(Number);
        return elements.map(element => {
          const css = getComputedStyle(element);
          const a = luminance(parse(css.color)), b = luminance(parse(css.backgroundColor));
          return { label: element.textContent?.trim(), ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
        });
      });
    expect(ratios).toHaveLength(6);
    for (const { label, ratio } of ratios) expect(ratio, label).toBeGreaterThanOrEqual(4.5);
    const prompt = page.getByRole('region', { name: 'Ví dụ giao diện Cố vấn AI', exact: true }).getByRole('link').first();
    await page.keyboard.press('Tab');
    await prompt.focus();
    await expect(prompt).toHaveCSS('outline-color', 'rgb(81, 77, 140)');
    await page.screenshot({ path: info.outputPath(`home-${width}.png`), fullPage: true });
  });
}
