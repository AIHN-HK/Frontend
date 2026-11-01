import {expect,test} from '@playwright/test';
import {advisorFixture} from './advisor.fixture';
import {careerPlatformFixture} from './career-platform.fixture';
import {analysisData,resultData,snapshotData} from './result.fixture';
import {reviewResponsive} from './ui-sync.fixture';

test('migrated runtime journey connects saved result, exact recommendation, target, roadmap and reopened chat', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  const advisor = await advisorFixture(page,{authenticated:false});
  const career = await careerPlatformFixture(page,{anonymous:true});
  await page.route(/^http:\/\/localhost:3000\/api\/v1\/result\//, async route => {
    if (route.request().method()==='OPTIONS') { await route.fallback(); return; }
    const path=new URL(route.request().url()).pathname;
    const data=path.includes('/snapshots/')?snapshotData(812):path.includes('/analyze-result/')?analysisData():resultData(812);
    await route.fulfill({headers:{'Access-Control-Allow-Origin':'*'},json:{status:200,data}});
  });
  await page.route('**/api/v1/users/me/avatar', async route => {
    if(route.request().method()==='OPTIONS') await route.fallback();
    else await route.fulfill({status:404,headers:{'Access-Control-Allow-Origin':'*'},json:{status:404}});
  });
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', {level:1})).toContainText('Hiểu mình trước');
  await page.getByRole('banner').getByRole('link', {name:'Đăng nhập',exact:true}).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Email').fill('student@example.test');
  await page.getByLabel('Mật khẩu',{exact:true}).fill('password123');
  await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
  await expect(page).toHaveURL('/dashboard');
  await page.getByRole('region',{name:'Trắc nghiệm Holland',exact:true}).getByRole('link',{name:'Xem kết quả',exact:true}).click();
  await expect(page).toHaveURL('/assessment/results/812');
  await page.getByRole('link',{name:'Xem nghề phù hợp',exact:true}).click();
  await page.getByRole('button',{name:'Xem nghề phù hợp',exact:true}).click();
  await page.getByRole('link',{name:'Xem lý do gợi ý',exact:true}).click();
  await expect(page).toHaveURL(/\/recommendations\/run-fixture-1\?careerId=15-1252.00$/);
  await expect(page.getByRole('heading',{level:1})).toHaveText('Software Developers');
  await page.getByRole('link',{name:'Tìm hiểu thêm',exact:true}).click();
  await expect(page).toHaveURL('/careers/15-1252.00');
  await page.getByRole('link',{name:'Chọn làm mục tiêu',exact:true}).click();
  await expect(page.getByLabel('Mã nghề mục tiêu')).toHaveValue('15-1252.00');
  await page.getByLabel('Mức Programming').selectOption('0');
  await page.getByRole('button',{name:'Lưu kỹ năng và mục tiêu',exact:true}).click();
  await expect.poll(()=>career.profile().revision).toBe(1);
  await expect(page.getByRole('button',{name:'Lưu kỹ năng và mục tiêu',exact:true})).toBeEnabled();
  await reviewResponsive(page,'P11','.career-profile-page');
  await page.goto('/roadmap');
  await page.getByRole('button',{name:'Tạo lộ trình',exact:true}).click();
  await expect(page.getByText('0/4 nhiệm vụ hoàn thành · phiên bản 1',{exact:true})).toBeVisible();
  await page.getByRole('textbox',{name:'Minh chứng cho Fixture roadmap explore',exact:true}).fill('Đã đọc nguồn nghề và ghi nhận lý do chọn mục tiêu.');
  await page.getByRole('button',{name:'Xác nhận hoàn thành',exact:true}).first().click();
  await expect(page.getByText('1/4 nhiệm vụ hoàn thành · phiên bản 2',{exact:true})).toBeVisible();
  await page.goto('/advisor');
  expect(advisor.sockets).toHaveLength(0);
  await page.getByRole('button',{name:'Kết nối',exact:true}).click();
  await expect(page).toHaveURL('/advisor?sessionId=100');
  await page.getByRole('textbox',{name:'Câu hỏi của bạn',exact:true}).fill('Tôi nên bắt đầu từ kỹ năng nào cho mục tiêu đã chọn?');
  await page.getByRole('button',{name:'Gửi',exact:true}).click();
  await expect(page.getByRole('log')).toContainText('Trả lời từ máy chủ.');
  await page.getByRole('link',{name:'Xem lịch sử',exact:true}).click();
  await page.getByRole('article',{name:'Phiên tư vấn #100',exact:true}).getByRole('link',{name:'Đọc lại hội thoại',exact:true}).click();
  await expect(page.getByRole('log')).toContainText('Trả lời từ máy chủ.');
  expect(advisor.sockets).toHaveLength(1);
  expect(advisor.commands.filter(command=>command.event==='ask')).toHaveLength(1);
  await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('log')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('earlier migrated runtime screens retain source-sized responsive captures after the final changes', async ({page}) => {
  test.setTimeout(90_000);
  await careerPlatformFixture(page);
  const screens = [
    ['P03','/assessment/results/812'],['P04','/dashboard'],['P05','/recommendations'],
    ['P06','/recommendations/run-fixture-1?careerId=15-1252.00'],['P07','/careers'],['P08','/careers/15-1252.00'],
  ];
  for(const [plan,url] of screens) {
    await page.goto(url!);
    if(plan === 'P03') await expect(page.locator('[data-ce-page=result]')).toBeVisible();
    if(plan === 'P04') await expect(page.getByRole('region',{name:'Trắc nghiệm Holland',exact:true}).getByRole('link',{name:'Xem kết quả',exact:true})).toBeVisible();
    if(plan === 'P05') {
      await page.getByRole('button',{name:'Xem nghề phù hợp',exact:true}).click();
      await expect(page.getByRole('heading',{name:'1. Software Developers',exact:true})).toBeVisible();
    }
    if(plan === 'P06' || plan === 'P08') await expect(page.getByRole('heading',{level:1})).toHaveText('Software Developers');
    if(plan === 'P07') await expect(page.getByRole('article')).toHaveCount(1);
    await reviewResponsive(page,plan!,'main');
  }
});
