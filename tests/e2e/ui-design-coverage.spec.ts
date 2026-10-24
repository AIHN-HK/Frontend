import {expect,test,type Page} from '@playwright/test';
import {careerPlatformFixture} from './career-platform.fixture';
import {advisorFixture} from './advisor.fixture';
import {historyFixture} from './history.fixture';
import {adminFixture} from './admin.fixture';
import {questionsFixture} from './admin-questions.fixture';
import {scoringFixture} from './admin-scoring.fixture';
import {studentsFixture} from './admin-students.fixture';
import {studentDetailFixture} from './admin-student-detail.fixture';

type Screen={source:string;route:string;title:RegExp;setup?:(page:Page)=>Promise<unknown>;ready?:(page:Page)=>Promise<unknown>};
const student=(page:Page)=>careerPlatformFixture(page,{seedProfile:true});
const savedRun=async(page:Page)=>{
  await student(page);await page.goto('/recommendations');await page.getByRole('button',{name:'Tạo gợi ý nghề',exact:true}).click();await expect(page.getByRole('heading',{name:'1. Software Developers',exact:true})).toBeVisible();
};
const screens:Screen[]=[
  {source:'screens/home.html',route:'/',title:/Khám phá con đường/},
  {source:'screens/login.html',route:'/login',title:/Đăng nhập AIHN/},
  {source:'screens/signup.html',route:'/signup',title:/Tạo tài khoản|Đăng ký/},
  {source:'screens/forgot-reset-password.html',route:'/forgot-password',title:/Khôi phục mật khẩu/},
  {source:'screens/holland-test.html',route:'/assessment',title:/Trắc nghiệm.*Holland/,setup:student,ready:page=>expect(page.getByRole('button',{name:'Bắt đầu bài trắc nghiệm',exact:true})).toBeVisible()},
  {source:'screens/assessment-result.html',route:'/assessment/results/812',title:/TopCode: ISC/,setup:student},
  {source:'screens/dashboard.html',route:'/dashboard',title:/Xin chào/,setup:student,ready:page=>expect(page.getByRole('link',{name:'Mở kết quả Holland',exact:true})).toBeVisible()},
  {source:'screens/recommendations.html',route:'/recommendations',title:/Gợi ý nghề nghiệp/,setup:student,ready:async page=>{await page.getByRole('button',{name:'Tạo gợi ý nghề',exact:true}).click();await expect(page.getByRole('heading',{name:'1. Software Developers',exact:true})).toBeVisible();}},
  {source:'screens/recommendation-detail.html',route:'/recommendations/run-fixture-1?careerId=15-1252.00',title:/Software Developers/,setup:savedRun},
  {source:'screens/career-explorer.html',route:'/careers',title:/Khám phá nghề nghiệp/,setup:student,ready:page=>expect(page.getByRole('article')).toHaveCount(1)},
  {source:'screens/career-detail.html',route:'/careers/15-1252.00',title:/Software Developers/,setup:student},
  {source:'screens/career-profile.html',route:'/career-profile',title:/Hồ sơ Năng lực/,setup:student,ready:page=>expect(page.getByLabel('Mã nghề mục tiêu')).toHaveValue('15-1252.00')},
  {source:'screens/roadmap.html',route:'/roadmap',title:/Lộ trình và tiến độ/,setup:student,ready:async page=>{await page.getByRole('button',{name:'Tạo lộ trình từ mục tiêu',exact:true}).click();await expect(page.getByText('0/4 nhiệm vụ hoàn thành · phiên bản 1',{exact:true})).toBeVisible();}},
  {source:'screens/advisor.html',route:'/advisor',title:/Cố vấn AIHN|Cố vấn AI/,setup:advisorFixture},
  {source:'screens/history.html',route:'/history',title:/Lịch sử/,setup:historyFixture,ready:page=>expect(page.getByRole('article',{name:'Lần làm #812',exact:true})).toBeVisible()},
  {source:'screens/settings.html',route:'/settings',title:/Cài đặt/,setup:student},
  {source:'admin/overview.html',route:'/admin',title:/Tổng quan hệ thống/,setup:adminFixture,ready:page=>expect(page.getByTestId('count-students')).toHaveText('3')},
  {source:'admin/questions.html',route:'/admin/questions',title:/Ngân hàng câu hỏi Holland/,setup:questionsFixture,ready:page=>expect(page.getByText('Tôi thích tìm hiểu máy móc',{exact:true})).toBeVisible()},
  {source:'admin/scoring-config.html',route:'/admin/scoring',title:/Thứ tự ưu tiên Holland/,setup:scoringFixture,ready:page=>expect(page.getByRole('button',{name:/Lưu/})).toBeVisible()},
  {source:'admin/careers.html',route:'/admin/careers',title:/Dữ liệu nghề/,setup:page=>careerPlatformFixture(page,{admin:true}),ready:page=>expect(page.getByRole('heading',{name:'Software Developers',exact:true})).toBeVisible()},
  {source:'admin/students.html',route:'/admin/students',title:/Quản lý học sinh/,setup:studentsFixture,ready:page=>expect(page.getByRole('link',{name:'Học sinh 100',exact:true})).toBeVisible()},
  {source:'admin/student-detail.html',route:'/admin/students/100',title:/Học sinh 100/,setup:studentDetailFixture},
];
async function capture(page:Page,key:string) {
  for(const [width,height] of [[390,844],[768,1024],[1440,900]]) {
    await page.setViewportSize({width:width!,height:height!});await page.evaluate(()=>window.scrollTo(0,0));
    await page.evaluate(async()=>{await document.fonts.ready;await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));});
    await expect(page.getByRole('main')).toHaveCount(1);
    await page.screenshot({path:`.superpowers/ui-sync/P20/current/${key}-${width}.png`,fullPage:true});
  }
}
for(const screen of screens) test(`design coverage ${screen.source} → ${screen.route}`,async({page},info)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  if(screen.setup)await screen.setup(page);
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(screen.route);await expect(page.getByRole('heading',{level:1,name:screen.title})).toBeVisible();
  if(screen.ready)await screen.ready(page);
  await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
  await capture(page,screen.source.replace('.html','').replaceAll('/','-'));
  expect(errors).toEqual([]);await info.attach('OpenDesign source',{body:screen.source,contentType:'text/plain'});
});

test('design coverage OTP and verified password reset are reached through real auth handoffs',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('http://localhost:3000/api/v1/**',async route=>{
    const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'*'};
    if(route.request().method()==='OPTIONS'){await route.fulfill({status:204,headers});return;}
    const path=new URL(route.request().url()).pathname;
    await route.fulfill({status:201,headers,json:{status:201,data:path.endsWith('/verify-forget-password-otp')?true:{sent:true},message:'Fixture auth handoff'}});
  });
  await page.goto('/forgot-password');await page.getByLabel('Email tài khoản').fill('student@example.test');await page.getByRole('button',{name:'Gửi mã OTP',exact:true}).click();
  await expect(page).toHaveURL('/otp-verify');await capture(page,'screens-otp-verify');
  await page.getByRole('textbox',{name:'Chữ số 1',exact:true}).fill('123456');await page.getByRole('button',{name:'Xác nhận mã',exact:true}).click();
  await expect(page).toHaveURL('/reset-password');await expect(page.getByLabel('Mật khẩu mới',{exact:true})).toBeVisible();await capture(page,'screens-reset-password');
});
