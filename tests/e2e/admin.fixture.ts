import type { Page } from '@playwright/test';
export type AdminOptions = { role?: 'ADMIN'|'USER'; identityStatus?: number; identityGate?: Promise<void>; overviewStatus?: number; owner?: number };
export async function adminFixture(page: Page, options: AdminOptions = {}) {
  const calls: { path: string; method: string; body: unknown }[] = [];
  await page.addInitScript(() => { if (!sessionStorage.getItem('admin.fixture.initialized')) { sessionStorage.setItem('admin.fixture.initialized','1'); sessionStorage.setItem('aihn.auth.v1', JSON.stringify({ version:1, ownerId:71, rememberMe:false, tokens:{ accessToken:'access', refreshToken:'refresh' } })); } });
  await page.route('http://localhost:3000/api/v1/**', async route => {
    const r=route.request(),path=new URL(r.url()).pathname; if(r.method()==='OPTIONS'){await route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'*'}});return;}
    calls.push({path,method:r.method(),body:r.postDataJSON()});
    let status=200, data:unknown={id:options.owner??71,fullname:'Quản trị thử',role:options.role??'ADMIN'};
    if(path.endsWith('/admin/me')){await options.identityGate;status=options.identityStatus??(options.role==='USER'?403:200);}
    if(path.endsWith('/admin/overview')){status=options.overviewStatus??200;data={counts:{students:3,completedTests:2,chatSessions:1,questions:6},recentAttempts:[{id:812,finishAt:'2026-10-14T07:00:00Z',user:{id:81,fullname:'Học sinh thử'},result:{topCode:'ISC',scoreR:1,scoreI:3,scoreA:1,scoreS:2,scoreE:1,scoreC:2}}]};}
    if(path.endsWith('/users/me')) data={fullname:'Quản trị thử',phone:null,address:null,gender:null,class:null,email:'admin@example.test'};
    await route.fulfill({status,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({status,data})});
  }); return calls;
}
