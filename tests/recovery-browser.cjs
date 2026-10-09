const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();try {
  const page=await browser.newPage({viewport:{width:390,height:844}});let mode='error',verified=0;
  await page.route('**/api/v1/auth/**',async route=>{
   const path=new URL(route.request().url()).pathname;
   if(path.endsWith('send-otp'))return route.fulfill({status:mode==='error'?503:201,json:{status:mode==='error'?503:201,message:mode==='error'?'Mail unavailable':'Sent',data:{sent:true}}});
   if(path.endsWith('verify-forget-password-otp')){verified++;return route.fulfill({status:mode==='invalid'?401:201,json:{status:mode==='invalid'?401:201,message:'Invalid OTP',data:true}});}
   return route.fulfill({status:201,json:{status:201,data:{reset:true}}});
  });
  await page.goto('http://localhost:8083/resetpassword');await page.getByPlaceholder('Email của bạn').waitFor({timeout:60000});await page.getByPlaceholder('Email của bạn').fill('a@example.test');
  await page.getByText('Tiếp tục',{exact:true}).last().click();await page.waitForTimeout(500);
  assert.ok(new URL(page.url()).pathname.endsWith('/resetpassword'),'mail failure must not advance to OTP screen');
  mode='ok';await page.getByText('Tiếp tục',{exact:true}).last().click();await page.waitForURL('**/otp-verify?**');
  mode='invalid';await page.locator('input[autocomplete="one-time-code"]:visible').fill('123456');
  await page.getByText('Xác nhận',{exact:true}).last().click();await page.waitForTimeout(300);assert.ok(new URL(page.url()).pathname.endsWith('/otp-verify'));
  mode='ok';await page.getByText('Xác nhận',{exact:true}).last().click();await page.waitForURL('**/newpassword');assert.equal(verified,2);assert.ok(!page.url().includes('123456'));
  await page.reload();await page.waitForURL('**/resetpassword');
  console.log('PASS recovery browser: mail failure stays, invalid OTP stays, server verification, no OTP in URL, reload requires new recovery');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
