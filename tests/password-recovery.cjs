require('./register-typescript.cjs');const assert=require('node:assert/strict');
const {passwordRecovery}=require('../src/helpers/passwordRecovery.ts');
assert.equal(passwordRecovery.get(),null);
passwordRecovery.set({email:'a@example.test',otp:'123456'});assert.equal(passwordRecovery.get().otp,'123456');
passwordRecovery.clear();assert.equal(passwordRecovery.get(),null);
console.log('PASS: password recovery stays in memory and can be cleared');
