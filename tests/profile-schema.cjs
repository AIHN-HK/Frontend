const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(require('fs').readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, filename);
};
const assert = require('node:assert/strict');
const { profileSchema } = require('../src/modules/profile/schemas/profileSchema.ts');
assert.ok(profileSchema, 'personal profile schema must exist');
const valid = { fullname: '  Student  ', phone: '0901234567', address: '', gender: '', class: '' };
assert.deepEqual(profileSchema.parse(valid), { fullname: 'Student', phone: '0901234567', address: null, gender: null, class: null });
for (const invalid of [{fullname:' '},{phone:'abc'},{class:'1.5'},{class:'13'},{class:'abc'},{gender:'BAD'},{address:'a'.repeat(501)},{fullname:'a'.repeat(121)}]) {
  assert.equal(profileSchema.safeParse({...valid,...invalid}).success, false);
}
assert.equal(profileSchema.parse({...valid, class:'10'}).class, 10);
assert.ok(!('email' in profileSchema.parse({...valid,email:'bad',role:'ADMIN'})));
console.log('Profile schema validation and payload allowlist passed');
