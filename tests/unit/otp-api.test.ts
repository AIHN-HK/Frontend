import { afterEach, expect, it } from 'vitest';
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { createSessionStore } from '@/shared/session/session';
import { createHttpClient } from '@/shared/api/http-client';
import { resendOtp, verifyOtp, sendRecoveryOtp, resetPassword } from '@/modules/auth/api/auth.api';

const servers: Server[] = [];
afterEach(async () => { await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => { server.closeAllConnections(); server.close(() => resolve()); }))); });
async function api(data: unknown, status = 201) {
  const calls: { path: string; body: unknown }[] = [];
  const server = createServer((request, response) => {
    let body = '';
    request.on('data', chunk => { body += String(chunk); });
    request.on('end', () => {
      calls.push({ path: request.url!, body: JSON.parse(body) as unknown });
      response.writeHead(status, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ status, data, message: 'OTP response', errors: null }));
    });
  });
  servers.push(server); await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address(); if (!address || typeof address === 'string') throw new Error('No address');
  return { calls, http: createHttpClient({ origin: `http://127.0.0.1:${address.port}`, session: createSessionStore(), onUnauthorized: () => {} }), signal: new AbortController().signal };
}
const registration = { purpose: 'registration' as const, email: 'student@example.test', fullname: 'Student', password: ' exact password ', yob: '2008-02-29', phone: '0901234567' };
const recovery = { purpose: 'password-recovery' as const, email: 'student@example.test' };

it('registration posts fields plus otpCode and accepts a user without tokens or role', async () => {
  const { calls, http, signal } = await api({ user: { id: 2, email: registration.email, fullname: 'Student' } });
  await verifyOtp(http, registration, '123456', signal);
  expect(calls).toEqual([{ path: '/api/v1/auth/register', body: { email: registration.email, fullname: 'Student', password: ' exact password ', yob: '2008-02-29', phone: '0901234567', otpCode: '123456' } }]);
});
it('recovery verification uses email and otp, never the registration endpoint', async () => {
  const { calls, http, signal } = await api(true);
  await verifyOtp(http, recovery, '123456', signal);
  expect(calls).toEqual([{ path: '/api/v1/auth/verify-forget-password-otp', body: { email: recovery.email, otp: '123456' } }]);
});
for (const flow of [registration, recovery]) it(`${flow.purpose} resend sends email only to its own endpoint`, async () => {
  const { calls, http, signal } = await api({ sent: true });
  await resendOtp(http, flow, signal);
  expect(calls).toEqual([{ path: flow.purpose === 'registration' ? '/api/v1/auth/register/resend-otp' : '/api/v1/auth/forgot-password/resend-otp', body: { email: flow.email } }]);
});
for (const [flow, data] of [[registration, null], [registration, { user: { id: 2, email: 'someone@example.test', fullname: 'Student' } }], [recovery, false]] as const) it(`malformed ${flow.purpose} success stays unknown and never retries`, async () => {
  const { calls, http, signal } = await api(data);
  await expect(verifyOtp(http, flow, '123456', signal)).rejects.toMatchObject({ outcomeUnknown: true });
  expect(calls).toHaveLength(1);
});
it('malformed resend success stays unknown', async () => {
  const { calls, http, signal } = await api({ sent: false });
  await expect(resendOtp(http, registration, signal)).rejects.toMatchObject({ outcomeUnknown: true });
  expect(calls).toHaveLength(1);
});
it('invalid OTP is rejected locally before any command', async () => {
  const { calls, http, signal } = await api(true);
  await expect(verifyOtp(http, recovery, '12345', signal)).rejects.toMatchObject({ kind: 'configuration' });
  expect(calls).toEqual([]);
});

it('recovery send trims email and accepts only the real sent contract', async () => {
  const { calls, http, signal } = await api({ sent: true });
  await sendRecoveryOtp(http, ' student@example.test ', signal);
  expect(calls).toEqual([{ path: '/api/v1/auth/forgot-password/send-otp', body: { email: recovery.email } }]);
});
it('reset sends email/otp/newPassword only, preserving password whitespace', async () => {
  const { calls, http, signal } = await api({ reset: true });
  await resetPassword(http, { email: recovery.email, otp: '123456', newPassword: ' exact password ' }, signal);
  expect(calls).toEqual([{ path: '/api/v1/auth/reset-password', body: { email: recovery.email, otp: '123456', newPassword: ' exact password ' } }]);
});
for (const data of [null, { reset: false }, true]) it(`malformed reset ${JSON.stringify(data)} never claims success or retries`, async () => {
  const { calls, http, signal } = await api(data);
  await expect(resetPassword(http, { email: recovery.email, otp: '123456', newPassword: 'exact password' }, signal)).rejects.toMatchObject({ outcomeUnknown: true });
  expect(calls).toHaveLength(1);
});
it('malformed recovery send never claims success', async () => {
  const { calls, http, signal } = await api({ sent: false });
  await expect(sendRecoveryOtp(http, recovery.email, signal)).rejects.toMatchObject({ outcomeUnknown: true });
  expect(calls).toHaveLength(1);
});
it('invalid recovery email, OTP and password never reach HTTP', async () => {
  const { calls, http, signal } = await api({ reset: true });
  await expect(sendRecoveryOtp(http, 'invalid', signal)).rejects.toMatchObject({ kind: 'configuration' });
  for (const patch of [{ otp: '12345' }, { newPassword: 'short' }, { newPassword: 'x'.repeat(73) }]) {
    await expect(resetPassword(http, { email: recovery.email, otp: '123456', newPassword: 'good password', ...patch }, signal)).rejects.toMatchObject({ kind: 'configuration' });
  }
  expect(calls).toEqual([]);
});
