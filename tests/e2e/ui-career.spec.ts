import { expect, test } from '@playwright/test';
import { careerPlatformFixture } from './career-platform.fixture';

test('recommendation filters keep the saved run and explicit career detail context',async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  const fixture=await careerPlatformFixture(page);
  await page.goto('/recommendations');
  await page.getByRole('button',{name:'Tạo gợi ý nghề',exact:true}).click();
  await expect(page.getByRole('heading',{name:'1. Software Developers'})).toBeVisible();
  await expect(page.getByRole('link',{name:'Xem gợi ý nghề này'})).toHaveAttribute('href',/\/recommendations\/[^?]+\?careerId=15-1252.00$/);
  await page.getByRole('button',{name:'Có điểm xếp hạng',exact:true}).click();
  await expect(page.getByText('80.0 / 100',{exact:true})).toBeVisible();
  expect(fixture.calls.filter(c=>c.method==='POST'&&c.path==='/api/v1/career/recommendations')).toHaveLength(1);
  for(const width of [390,768,1440]) {
    await page.setViewportSize({width,height:width===768?1024:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:`.superpowers/ui-sync/P05/recommendations-${width}.png`,fullPage:true});
  }
});
