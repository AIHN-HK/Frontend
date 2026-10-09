const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();
 try {
  const context=await browser.newContext({viewport:{width:390,height:844}});
  await context.addInitScript(()=>{
   if(localStorage.getItem('__w02_seeded'))return;localStorage.setItem('__w02_seeded','1');
   for(const [key,value] of Object.entries({access_token:'A',refresh_token:'RA',USER_ID:1,USER_NAME:'An'}))localStorage.setItem(key,JSON.stringify(value));
   localStorage.setItem('huong-nghiep-quiz:1',JSON.stringify({state:{sessionId:'9',questions:[{title:'A draft',answer:[{id:'1',content:'A answer'}]}],answers:{1:true},currentQuestionIndex:0},version:0}));
  });
  const page=await context.newPage();let logouts=0;
  await page.route('**/api/v1/**',async route=>{
   const req=route.request();const path=new URL(req.url()).pathname;
   if(path.endsWith('/auth/logout')){logouts++;return route.fulfill({status:204});}
   if(path.endsWith('/auth/login')){const body=req.postDataJSON();const id=body.email.startsWith('b@')?2:1;return route.fulfill({status:201,json:{status:201,data:{accessToken:id===1?'A':'B',refreshToken:id===1?'RA':'RB',user:{id,fullname:id===1?'An':'Binh'}}}});}
   if(path.includes('history-by-user'))return route.fulfill({json:{data:{formattedHistory:[],pageInfo:{hasNext:false,nextCursor:null}}}});
   if(path.endsWith('/users/me')){const b=req.headers().authorization==='Bearer B';return route.fulfill({json:{data:{fullname:b?'Binh':'An',email:b?'b@example.test':'a@example.test',age:17,phone:'0901234567',address:null,gender:null,class:11}}});}
   return route.fulfill({json:{data:{questions:[]}}});
  });
  await page.goto('http://localhost:8083/profile');await page.getByTestId('profile-fullname').waitFor({timeout:60000});
  await page.getByTestId('profile-logout').click({timeout:3000});
  await page.locator('input[placeholder="Số điện thoại hoặc email"]:visible').last().waitFor();
  assert.equal(logouts,1);
  const cleared=await page.evaluate(()=>({token:localStorage.getItem('access_token'),name:localStorage.getItem('USER_NAME'),draft:localStorage.getItem('huong-nghiep-quiz:1')}));
  assert.equal(cleared.token,null);assert.equal(cleared.name,null);assert.ok(cleared.draft.includes('A draft'));
  await page.locator('input[placeholder="Số điện thoại hoặc email"]:visible').last().fill('b@example.test');await page.locator('input[placeholder="Mật khẩu"]:visible').last().fill('test-only-password');
  await page.getByText('Đăng nhập',{exact:true}).last().click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('USER_ID'))===2);
  await page.goto('http://localhost:8083/profile');await page.getByTestId('profile-fullname').waitFor();assert.equal(await page.getByTestId('profile-fullname').inputValue(),'Binh');
  assert.equal(await page.evaluate(()=>localStorage.getItem('huong-nghiep-quiz:2')),null);
  await page.getByTestId('profile-logout').scrollIntoViewIfNeeded();await page.mouse.wheel(0,2000);await page.waitForTimeout(200);
  const logoutBounds=await page.getByTestId('profile-logout').boundingBox();assert.ok(logoutBounds.y+logoutBounds.height<744,'logout must scroll above the floating tab bar');
  await page.screenshot({path:'/home/hoang/do-an/docs/superpowers/execution/w02/profile-logout-mobile.png',fullPage:true});
  console.log('PASS browser 390px: logout/revoke request, token/name clear, own draft retained, B login/profile/draft isolation');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
