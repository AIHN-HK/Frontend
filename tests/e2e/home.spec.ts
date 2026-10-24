import { expect, test } from '@playwright/test';

const headline = 'Khám phá con đường';

test('public editorial Home and its alias render labeled examples without personal requests', async ({page}) => {
  const personal:string[]=[], errors:string[]=[];
  page.on('request', request => { if(['fetch','xhr','websocket'].includes(request.resourceType())) personal.push(request.url()); });
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading',{level:1})).toContainText(headline);
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('region',{name:'Ví dụ kết quả RIASEC',exact:true})).toBeVisible();
  await expect(page.getByRole('region',{name:'Ví dụ giao diện Cố vấn AI',exact:true})).toContainText('Dữ liệu mẫu');
  await expect(page.getByRole('main')).not.toContainText(/60 câu|25 - 55|\+38%|94% MATCH|\+3 Điểm|Hoàng Nam|24\/7/);
  await expect(page.getByRole('link',{name:'AIHN trang chủ',exact:true})).toHaveAttribute('href','/');
  await expect(page).toHaveURL('/');
  await page.reload();
  await expect(page.getByRole('heading',{level:1})).toContainText(headline);
  await expect(page).toHaveURL('/');
  await page.goto('/preview/home');
  await expect(page.getByRole('heading',{level:1})).toContainText(headline);
  expect(personal).toEqual([]);
  expect(errors).toEqual([]);
});

test('Home actions use real guarded feature routes and the how-it-works anchor', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.getByRole('region',{name:'Khám phá con đường phù hợp',exact:true}).getByRole('link',{name:'Bắt đầu khám phá',exact:true}).click();
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fassessment$/);
  await expect(page.getByRole('heading',{name:'Đăng nhập AIHN',exact:true})).toBeVisible();
  await page.goto('/');
  await page.getByRole('contentinfo').getByRole('link',{name:'Thư viện nghề nghiệp',exact:true}).click();
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fcareers$/);
  await page.goto('/');
  await page.getByRole('link',{name:'AIHN hoạt động thế nào?',exact:true}).click();
  await expect(page).toHaveURL('/#how-it-works');
  await expect(page.getByRole('heading',{name:'Hành trình chuyển hóa từ hiểu mình đến hiện thực'})).toBeInViewport();
  await page.goto('/');
  await page.getByRole('banner').getByRole('link',{name:'Đăng nhập',exact:true}).click();
  await expect(page).toHaveURL('/login');
  await page.getByRole('link',{name:'Đăng ký miễn phí',exact:true}).click();
  await expect(page).toHaveURL('/signup');
});

test('public Advisor prompts open the real Advisor without simulating a reply', async ({page}) => {
  const requests:string[]=[];
  page.on('request', request => { if(['fetch','xhr','websocket'].includes(request.resourceType())) requests.push(request.url()); });
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const advisor=page.getByRole('region',{name:'Ví dụ giao diện Cố vấn AI',exact:true});
  await expect(advisor.getByRole('link')).toHaveCount(4);
  await expect(advisor).toContainText('Dữ liệu mẫu');
  await advisor.getByRole('link').first().click();
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fadvisor$/);
  expect(requests).toEqual([]);
});

for (const width of [320,390,768,769,1024,1025,1280,1281,1440,1600]) {
  test(`editorial Home remains usable at ${width}px including navigation and touch targets`, async ({page}) => {
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.setViewportSize({width,height:900});
    await page.goto('/');
    await expect(page.getByRole('heading',{level:1})).toContainText(headline);
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const opener=page.getByRole('button',{name:'Mở menu',exact:true});
    const desktop=page.getByRole('navigation',{name:'Điều hướng chính',exact:true});
    if(width<=1024) {
      await expect(opener).toBeVisible();
      await expect(desktop).toBeHidden();
      await opener.click();
      await expect(page.getByRole('navigation',{name:'Điều hướng di động',exact:true})).toBeVisible();
    } else {
      await expect(opener).toBeHidden();
      await expect(desktop).toBeVisible();
    }
    for (const control of await page.locator('a:visible,button:visible').all()) {
      const box=(await control.boundingBox())!;
      expect(box.height,await control.innerText()).toBeGreaterThanOrEqual(44);
      expect(box.width,await control.innerText()).toBeGreaterThanOrEqual(44);
    }
  });
}

test('mobile menu supports keyboard, same-route close, Escape and resize reset', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  const opener=page.getByRole('button',{name:'Mở menu',exact:true});
  await opener.focus(); await page.keyboard.press('Enter');
  const menu=page.getByRole('navigation',{name:'Điều hướng di động',exact:true});
  await expect(menu).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(menu.getByRole('link',{name:'Trang chủ',exact:true})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden(); await expect(opener).toBeFocused();
  await opener.click(); await menu.getByRole('link',{name:'Trang chủ',exact:true}).click();
  await expect(menu).toBeHidden();
  await opener.click(); await page.setViewportSize({width:1440,height:900});
  await expect(menu).toBeHidden();
  await page.setViewportSize({width:390,height:844}); await expect(menu).toBeHidden();
  await opener.click(); await menu.getByRole('link',{name:'Nghề nghiệp',exact:true}).click();
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fcareers$/);
});

test('keyboard skip link reaches Home main content', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('heading',{level:1})).toContainText(headline);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'Bỏ qua điều hướng',exact:true})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test('all six story steps work with keyboard and the demo keeps boolean answers local', async ({page}) => {
  const requests:string[]=[];
  page.on('request',request=>{if(['fetch','xhr','websocket'].includes(request.resourceType()))requests.push(request.url());});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const story=page.getByRole('region',{name:'AIHN hoạt động thế nào',exact:true});
  const steps=story.getByRole('button',{name:/^0[1-6] /});
  await expect(steps).toHaveCount(6);
  for(let index=0;index<6;index++) {
    await steps.nth(index).focus(); await page.keyboard.press('Enter');
    await expect(steps.nth(index)).toHaveAttribute('aria-pressed','true');
    await expect(story.getByRole('region',{name:`Minh họa bước ${index+1}`,exact:true})).toBeVisible();
    await expect(story.getByRole('region',{name:/Minh họa bước/})).toHaveCount(1);
  }
  await steps.first().click();
  const no=story.getByRole('button',{name:'Không — Không hứng thú',exact:true});
  await no.click(); await expect(no).toHaveAttribute('aria-pressed','true');
  await expect(story.getByRole('button',{name:'Có — Hứng thú',exact:true})).toHaveAttribute('aria-pressed','false');
  await expect(story).toContainText('Câu trả lời không được lưu');
  expect(requests).toEqual([]);
});

test('scrolling follows the story, navbar contrast and route cleanup without trapping short screens', async ({page}) => {
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/');
  await expect(page.getByRole('heading',{level:1})).toHaveCSS('opacity','1');
  const intro=page.getByRole('heading',{name:/Không chỉ chọn một nghề/});
  await intro.evaluate(element=>window.scrollTo(0,element.closest('section')!.offsetTop+100));
  await expect(page.getByRole('banner')).toHaveAttribute('data-surface','light');
  const story=page.getByRole('region',{name:'AIHN hoạt động thế nào',exact:true});
  await story.evaluate(element=>window.scrollTo(0,element.getBoundingClientRect().top+scrollY-70+1600));
  await expect(story.getByRole('button',{name:'04 Phân tích Skill Gap',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.setViewportSize({width:1024,height:650});
  await expect.poll(()=>page.locator('.pin-spacer').count()).toBe(0);
  await page.getByRole('banner').getByRole('link',{name:'Đăng nhập',exact:true}).click();
  await expect(page).toHaveURL('/login');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.getByRole('banner')).toHaveCount(0);
  await page.getByRole('link',{name:'← Về trang chủ',exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toContainText(headline);
  expect(errors).toEqual([]);
});

test('editorial Home screenshots use local fonts at the three reference viewports', async ({page},info) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [width,height] of [[390,844],[768,1024],[1440,900]]) {
    await page.setViewportSize({width:width!,height:height!});await page.goto('/');
    await expect(page.getByRole('heading',{level:1})).toContainText(headline);
    await page.evaluate(()=>document.fonts.ready);
    expect(await page.evaluate(()=>document.fonts.check('400 40px "AIHN Home Newsreader"'))).toBe(true);
    expect(await page.evaluate(()=>document.fonts.check('400 16px "AIHN Home Plus Jakarta Sans"'))).toBe(true);
    const screenshot=info.outputPath(`home-${width}.png`);
    await page.screenshot({path:screenshot,fullPage:true});await info.attach(`home-${width}`,{path:screenshot,contentType:'image/png'});
    await page.screenshot({path:`.superpowers/ui-sync/P19/implementation-${width}.png`,fullPage:true});
  }
});
