const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const profiles = {
    A: { fullname: 'Nguyễn An', email: 'an@example.test', age: 17, phone: '0901234567', address: null, gender: null, class: 11 },
    B: { fullname: 'Trần Bình', email: 'binh@example.test', age: 18, phone: '0912345678', address: 'Hà Nội', gender: 'MALE', class: 12 },
  };
  let patches = 0;
  let mode = 'ok';
  let delayGet = false;
  let failGet = true;
  await context.addInitScript(() => localStorage.setItem('access_token', JSON.stringify('A')));
  await page.route('**/api/v1/users/me', async route => {
    const req = route.request();
    const owner = (req.headers().authorization || '').replace('Bearer ', '');
    if (!profiles[owner]) return route.fulfill({ status: 401, json: { message: 'Unauthorized' } });
    if (req.method() === 'GET' && failGet) { failGet = false; return route.fulfill({status:503,json:{message:'Unavailable'}}); }
    if (req.method() === 'PATCH') {
      patches++;
      const data = req.postDataJSON();
      assert.deepEqual(Object.keys(data).sort(), ['address','class','fullname','gender','phone']);
      if (mode === 'error') return route.fulfill({status:400,json:{message:'Validation failed',errors:{phone:['Invalid phone']}}});
      profiles[owner] = { ...profiles[owner], ...data };
      if (mode === 'timeout') return route.abort('timedout');
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    const profile = { ...profiles[owner] };
    if (delayGet && owner === 'A') await new Promise(resolve => setTimeout(resolve, 700));
    return route.fulfill({ json: { status:200,data:profile,message:null,errors:null } });
  });
  const input = key => page.getByTestId(`profile-${key}`);
  await page.goto('http://localhost:8083/profile');
  await page.getByText('Không tải được hồ sơ. Vui lòng thử lại.',{exact:true}).waitFor({timeout:30000});
  await page.getByTestId('profile-reload').click();
  await input('fullname').waitFor({ timeout: 5000 });
  assert.equal(await input('fullname').inputValue(), 'Nguyễn An');
  await input('fullname').fill('');
  await page.getByTestId('profile-save').click();
  await page.getByText('Họ tên không được để trống', {exact:true}).waitFor();
  assert.equal(patches, 0);
  await input('fullname').fill('Draft');
  await page.getByTestId('profile-cancel').click();
  assert.equal(await input('fullname').inputValue(), 'Nguyễn An');
  mode = 'error';
  await input('fullname').fill('Giữ draft khi lỗi');
  await page.getByTestId('profile-save').click();
  await page.getByText('Không lưu được hồ sơ. Dữ liệu nhập vẫn được giữ.', {exact:true}).waitFor();
  assert.equal(await input('fullname').inputValue(), 'Giữ draft khi lỗi');
  mode = 'ok';
  const before = patches;
  await page.getByTestId('profile-save').dblclick({delay:30});
  await page.getByText('Đã lưu hồ sơ.', {exact:true}).waitFor();
  assert.equal(patches, before + 1);
  await page.reload();
  await input('fullname').waitFor();
  assert.equal(await input('fullname').inputValue(), 'Giữ draft khi lỗi');
  mode = 'timeout';
  await input('fullname').fill('Server đã lưu');
  await page.getByTestId('profile-save').click();
  await page.getByTestId('profile-review').waitFor();
  assert.equal(await input('fullname').inputValue(), 'Server đã lưu');
  assert.equal(await page.getByTestId('profile-save').isDisabled(), true);
  await input('fullname').fill('Draft mới sau timeout');
  await page.getByTestId('profile-review').click();
  await page.getByText('Hồ sơ trên máy chủ đã được tải lại. Kiểm tra trước khi lưu tiếp.', {exact:true}).waitFor();
  assert.equal(await input('fullname').inputValue(), 'Draft mới sau timeout');
  assert.equal(await page.getByTestId('profile-server-fullname').innerText(), 'Server đã lưu');
  await page.getByTestId('profile-cancel').click();
  assert.equal(await input('fullname').inputValue(), 'Server đã lưu');
  // Account switch while the screen remains mounted must clear drafts and ignore late GETs.
  delayGet = true;
  await page.getByTestId('profile-reload').click();
  await page.evaluate(() => { localStorage.setItem('access_token', JSON.stringify('B')); window.dispatchEvent(new StorageEvent('storage', {key:'access_token'})); });
  await page.waitForFunction(() => document.querySelector('[data-testid="profile-fullname"]')?.value === 'Trần Bình');
  await page.waitForTimeout(850);
  assert.equal(await input('fullname').inputValue(), 'Trần Bình');
  assert.equal(await page.getByTestId('profile-email').inputValue(), 'binh@example.test');
  const out = path.resolve(__dirname, '../../docs/superpowers/execution/w01/demo');
  fs.mkdirSync(out, {recursive:true});
  await page.getByTestId('profile-hint').scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 2000);
  await page.waitForTimeout(200);
  const hint = await page.getByTestId('profile-hint').boundingBox();
  assert.ok(hint.y + hint.height < 744, 'footer must scroll above floating tab bar');
  await page.screenshot({path:path.join(out,'profile-narrow-bottom.png'),fullPage:true});
  await page.getByText('Hồ sơ cá nhân',{exact:true}).scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,'profile-narrow.png'),fullPage:true});
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:path.join(out,'profile-wide.png'),fullPage:true});
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  console.log('PASS profile browser: validation, cancel, failure draft, double save, reload, committed timeout, review, account switch/stale GET, narrow/wide');
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
