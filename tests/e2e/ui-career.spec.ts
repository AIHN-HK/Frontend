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

const detailRun = () => ({
  id:'run-detail', userId:71, attemptId:812, algorithmVersion:'fixture-algorithm', createdAt:'2026-10-23T08:00:00Z', input:{profileRevision:0},
  items:[['15-1252.00','Software Developers'],['15-2051.00','Data Scientists']].map(([careerId,title])=>({
    careerId,title,sourceVersion:'O*NET fixture',sourceUrl:`https://www.onetonline.org/link/summary/${careerId}`,score:72,skillCoverage:0,
    components:{riasec:72,skills:null,interests:null},contributions:[{key:'riasec',value:72,weight:1,contribution:72}],missing:['skills','interests'],gaps:[],
  })),
});

test('saved recommendation detail reloads the explicit item and preserves old run links as a chooser',async ({page})=>{
  const fixture=await careerPlatformFixture(page);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('**/api/v1/career/recommendations/run-detail',route=>route.fulfill({json:{status:200,data:detailRun()}}));
  await page.goto('/recommendations/run-detail?careerId=15-2051.00');
  await expect(page.getByRole('heading',{level:1})).toHaveText('Data Scientists');
  await expect(page.getByRole('link',{name:'Nguồn nghề của bản gợi ý'})).toHaveAttribute('href','https://www.onetonline.org/link/summary/15-2051.00');
  await page.reload();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Data Scientists');
  for(const width of [320,390,768,769,1024,1025,1440,1600]){
    await page.setViewportSize({width,height:width===768?1024:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(width <= 1024) await expect(page.getByRole('complementary',{name:'Tiến trình'})).toBeHidden();
    else await expect(page.getByRole('complementary',{name:'Tiến trình'})).toBeVisible();
    await page.screenshot({path:`.superpowers/ui-sync/P06/detail-${width}.png`,fullPage:true});
  }
  await page.goto('/recommendations/run-detail');
  await expect(page.getByRole('heading',{name:'Chọn nghề trong bản gợi ý đã lưu'})).toBeVisible();
  await expect(page.locator('[data-ce-photo-frame]')).toHaveCount(0);
  await page.getByRole('link',{name:'Xem gợi ý nghề này'}).nth(1).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Data Scientists');
  expect(fixture.calls.filter(c=>c.method==='POST')).toHaveLength(0);
});

for(const query of ['careerId=unknown','careerId=15-1252.00&careerId=15-2051.00']) {
  test(`unknown or ambiguous recommendation item never falls back to the first career: ${query}`,async ({page})=>{
    await careerPlatformFixture(page);
    await page.route('**/api/v1/career/recommendations/run-detail',route=>route.fulfill({json:{status:200,data:detailRun()}}));
    await page.goto(`/recommendations/run-detail?${query}`);
    await expect(page.getByRole('alert')).toContainText('không thuộc bản gợi ý này');
    await expect(page.locator('[data-ce-photo-frame]')).toHaveCount(0);
  });
}
for(const invalid of ['owner','run'] as const) {
  test(`recommendation detail rejects mismatched ${invalid} data`,async ({page})=>{
    await careerPlatformFixture(page);
    const run=detailRun(); if(invalid==='owner')run.userId=72;else run.id='other-run';
    await page.route('**/api/v1/career/recommendations/run-detail',route=>route.fulfill({json:{status:200,data:run}}));
    await page.goto('/recommendations/run-detail?careerId=15-1252.00');
    await expect(page.getByRole('alert')).toContainText('Không tìm thấy bản gợi ý đã lưu');
    await expect(page.getByText('72.0 / 100',{exact:true})).toHaveCount(0);
  });
}

test('delayed saved run reveals its requested career after the entrance completes', async ({page}) => {
  await careerPlatformFixture(page);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/v1/career/recommendations/run-detail', async route => {
    await gate;
    await route.fulfill({json:{status:200,data:detailRun()}});
  });
  try {
    await page.goto('/recommendations/run-detail?careerId=15-2051.00');
    await expect(page.getByRole('status')).toHaveText('Đang tải dữ liệu nghề…');
    await expect(page.locator('[data-ce-photo-frame]')).toHaveCount(0);
    release();
    const title = page.getByRole('heading',{level:1,name:'Data Scientists'});
    await expect(title).toBeVisible();
    await expect.poll(() => title.evaluate(element => getComputedStyle(element.closest('section')!).opacity)).toBe('1');
    await expect(page.locator('[data-ce-photo-frame] img')).toBeVisible();
    expect(errors).toEqual([]);
  } finally { release(); }
});

test('missing ranking and component scores remain unavailable rather than becoming zero', async ({page}) => {
  await careerPlatformFixture(page);
  const run = detailRun();
  const unavailable = {...run, items:run.items.map(item => ({...item,score:null,
    components:{riasec:null,skills:null,interests:null},contributions:[],missing:['riasec','skills','interests']}))};
  await page.route('**/api/v1/career/recommendations/run-detail', route => route.fulfill({json:{status:200,data:unavailable}}));
  await page.goto('/recommendations/run-detail?careerId=15-2051.00');
  await expect(page.getByRole('heading',{level:1})).toHaveText('Data Scientists');
  await expect(page.getByText('Chưa đủ tín hiệu',{exact:true})).toBeVisible();
  await expect(page.getByText('Chưa có dữ liệu',{exact:true})).toBeVisible();
  await expect(page.getByText('0.0 / 100',{exact:true})).toHaveCount(0);
});

for (const status of [403,404]) {
  test(`saved recommendation read ${status} exposes no career and sends no mutation`, async ({page}) => {
    const fixture = await careerPlatformFixture(page);
    await page.route('**/api/v1/career/recommendations/run-detail', route => route.fulfill({status,json:{message:'Unavailable run'}}));
    await page.goto('/recommendations/run-detail?careerId=15-2051.00');
    await expect(page.getByRole('alert')).toContainText('Không tải được dữ liệu nghề');
    await expect(page.locator('[data-ce-photo-frame]')).toHaveCount(0);
    expect(fixture.calls.every(call => call.method === 'GET')).toBe(true);
  });
}

test('logout discards a pending saved recommendation without revealing its career', async ({page}) => {
  await careerPlatformFixture(page);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/v1/career/recommendations/run-detail', async route => {
    await gate;
    await route.fulfill({json:{status:200,data:detailRun()}}).catch(() => {});
  });
  try {
    await page.goto('/recommendations/run-detail?careerId=15-2051.00');
    await expect(page.getByRole('status')).toHaveText('Đang tải dữ liệu nghề…');
    await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();
    await expect(page).toHaveURL(/\/login/);
    release();
    await expect(page.getByRole('heading',{name:'Đăng nhập AIHN'})).toBeVisible();
    await expect(page.getByText('Data Scientists',{exact:true})).toHaveCount(0);
  } finally { release(); }
});
