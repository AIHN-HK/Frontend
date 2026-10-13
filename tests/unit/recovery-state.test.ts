import { afterEach, expect, it, vi } from 'vitest';
import { createSessionStore } from '@/shared/session/session';
import { createRecoveryState } from '@/modules/auth/model/recovery-state';
import { createRegistrationDraftStore } from '@/modules/auth/model/registration-draft';

afterEach(() => { vi.useRealTimers(); });
it('recovery replaces the previous registration flow and keeps a defensive email-only state until server verification', () => {
  const session = createSessionStore(), registration = createRegistrationDraftStore(session);
  registration.save({ email: 'old@example.test', fullname: 'Student', password: 'old secret', yob: '2008-02-29', phone: '0901234567' }, 0, true);
  const recovery = createRecoveryState(session, registration.clear);
  expect(recovery.begin(' student@example.test ', 0)).toBe(true);
  expect(registration.read()).toBeNull();
  expect(recovery.read()).toMatchObject({ purpose: 'password-recovery', email: 'student@example.test', verifiedOtp: null });
  recovery.read()!.email = 'other@example.test';
  expect(recovery.read()?.email).toBe('student@example.test');
  expect(recovery.verify('12345', 0)).toBe(false);
  expect(recovery.verify('123456', 0)).toBe(true);
  expect(recovery.read()?.verifiedOtp).toBe('123456');
});
it('a resend attempt drops the previous recovery credential even when the send outcome is unknown', () => {
  const recovery = createRecoveryState(createSessionStore());
  recovery.begin('student@example.test', 0); recovery.verify('123456', 0);
  recovery.deferResend(Date.now() + 60_000, 0);
  expect(recovery.read()?.verifiedOtp).toBeNull();
});
it('resend updates the memory deadline and an expired recovery credential cannot be passed to reset', () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-12T00:00:00Z'));
  const recovery = createRecoveryState(createSessionStore());
  recovery.begin('student@example.test', 0);
  vi.advanceTimersByTime(61_000); recovery.resent(0);
  expect(recovery.read()?.resendAvailableAt).toBe(Date.parse('2026-10-12T00:02:01Z'));
  vi.advanceTimersByTime(600_000);
  expect(recovery.read()).toBeNull(); expect(recovery.verify('123456', 0)).toBe(false);
});
it('session changes clear OTP secrets and reject stale writes; new runtimes start empty', () => {
  const session = createSessionStore(), recovery = createRecoveryState(session);
  recovery.begin('student@example.test', 0); recovery.verify('123456', 0);
  session.establish({ id: 2, fullname: 'Other', role: 'USER' }, { accessToken: 'a', refreshToken: 'r' });
  expect(recovery.read()).toBeNull(); expect(recovery.begin('student@example.test', 0)).toBe(false);
  session.clear(); expect(recovery.verify('123456', 0)).toBe(false);
  expect(createRecoveryState(createSessionStore()).read()).toBeNull();
});

it('reset drafts remain defensive and only exist for the current recovery revision and TTL', () => {
  vi.useFakeTimers();
  const session = createSessionStore(), recovery = createRecoveryState(session);
  recovery.begin('student@example.test', 0, false);
  expect(recovery.read()?.otpRequested).toBe(false);
  recovery.resent(0); expect(recovery.read()?.otpRequested).toBe(true);
  const draft = { newPassword: ' exact password ', confirmPassword: ' exact password ' };
  expect(recovery.saveResetDraft(draft, 0)).toBe(true);
  draft.newPassword = 'changed';
  const snapshot = recovery.read()!; snapshot.resetDraft!.newPassword = 'other';
  expect(recovery.read()?.resetDraft?.newPassword).toBe(' exact password ');
  vi.advanceTimersByTime(600_000);
  expect(recovery.read()).toBeNull();
  expect(recovery.saveResetDraft(draft, 0)).toBe(false);
  recovery.begin('student@example.test', 0); recovery.saveResetDraft(draft, 0);
  session.clear(); expect(recovery.read()).toBeNull();
});
