import { expect, test } from '@playwright/test';
import { resultFixture } from './result.fixture';

test('late snapshot bars reach their real targets and reduced motion preserves them', async ({ page }) => {
  await resultFixture(page);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release=resolve; });
  await page.route('**/api/v1/result/attempt/snapshots/812',async route => { await gate; await route.fallback(); });
  await page.goto('/assessment/results/812');
  await expect(page.getByText('TopCode: ISC',{exact:true})).toBeVisible();
  await expect(page.locator('[data-ce-score-fill]')).toHaveCount(0);
  release();
  const fills = page.locator('[data-ce-score-fill]');
  await expect(fills).toHaveCount(6);
  await expect.poll(() => fills.nth(1).evaluate(node => (node as HTMLElement).style.width)).toBe('50%');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(fills.nth(1)).toHaveAttribute('style', /width: 50%/);
  await page.reload();
  await expect(fills.nth(1)).toHaveAttribute('style', /width: 50%/);
});

for (const width of [320,390,768,1024,1025,1440,1600]) {
  test(`result design preserves photo, timeline and responsive layout at ${width}px`,async ({page}) => {
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.setViewportSize({width,height:width===768?1024:900});
    await resultFixture(page);
    await page.goto('/assessment/results/812');
    await expect(page.getByText('TopCode: ISC',{exact:true})).toBeVisible();
    const sidebar = page.getByRole('complementary',{name:'Tiến trình'});
    if (width<=1024) await expect(sidebar).toBeHidden();
    else {
      await expect(sidebar).toBeVisible();
      expect((await sidebar.boundingBox())!.width).toBe(width>=1600?460:420);
      for (const node of await sidebar.locator('[data-ce-node]').all()) {
        const box=(await node.boundingBox())!; expect(box.width).toBe(26);expect(box.height).toBe(26);
      }
    }
    const frame=page.locator('[data-ce-photo-frame]'), badge=page.locator('[data-ce-photo-badge]');
    const a=(await frame.boundingBox())!,b=(await badge.boundingBox())!;
    expect(Math.round(b.x-a.x)).toBe(13);
    expect(Math.round(a.y+a.height-b.y-b.height)).toBe(13);
    expect(await frame.evaluate(node => {const r=node.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.tagName;})).toBe('IMG');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:`.superpowers/ui-sync/P03/result-${width}.png`,fullPage:true});
  });
}
