import { expect, it } from 'vitest';
import { postLoginPath, withAuthReturn } from '@/modules/auth/model/post-login-path';

const user = { id: 71, role: 'USER' as const, fullname: 'Fixture' };
it('preserves the guest import intent across signup OTP and login without opening external destinations', () => {
  const target = '/assessment/claim?target=roadmap';
  const signup = withAuthReturn('/signup', `?returnTo=${encodeURIComponent(target)}`);
  const otp = withAuthReturn('/otp-verify', new URL(signup, 'https://aihn.invalid').search);
  const login = withAuthReturn('/login', new URL(otp, 'https://aihn.invalid').search);
  expect(postLoginPath(user, new URL(login, 'https://aihn.invalid').searchParams.get('returnTo'))).toBe(target);
  for (const unsafe of ['//attacker.test', 'https://attacker.test', '/\\attacker.test', '/admin', '/assessment/not-a-route']) expect(postLoginPath(user, unsafe)).toBe('/dashboard');
});
it('keeps existing auth URLs unchanged without a return intent and drops excessively long intents', () => {
  expect(withAuthReturn('/login', '')).toBe('/login');
  expect(withAuthReturn('/login', `?returnTo=${'a'.repeat(2049)}`)).toBe('/login');
});
