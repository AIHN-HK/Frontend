import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSessionStore } from '@/shared/session/session';
import { createRegistrationDraftStore } from '@/modules/auth/model/registration-draft';

const fields = { email: 'student@example.test', fullname: 'Nguyễn Nam', password: ' exact password ', yob: '2008-02-29', phone: '0901234567' };
afterEach(() => { vi.useRealTimers(); });

describe('registration draft session isolation', () => {
  it('keeps the resend deadline across page reads and same-email retries without extending it on remount', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-12T00:00:00Z'));
    const draft = createRegistrationDraftStore(createSessionStore());
    draft.save(fields, 0, true);
    vi.advanceTimersByTime(30_000); draft.save(fields, 0);
    expect(draft.read()?.resendAvailableAt).toBe(Date.parse('2026-10-12T00:01:00Z'));
    draft.deferResend(Date.now() + 60_000, 0);
    expect(draft.read()?.resendAvailableAt).toBe(Date.parse('2026-10-12T00:01:30Z'));
    draft.save({ ...fields, email: 'different@example.test' }, 0);
    expect(draft.read()?.resendAvailableAt).toBe(0);
  });
  it('retains all registration fields and OTP outcome across page consumers, with defensive snapshots', () => {
    const session = createSessionStore(), draft = createRegistrationDraftStore(session);
    expect(draft.save(fields, 0)).toBe(true);
    expect(draft.read()).toEqual({ ...fields, purpose: 'registration', version: 1, revision: 0, otpRequested: false, resendAvailableAt: 0 });
    draft.read()!.password = 'changed externally';
    expect(draft.read()!.password).toBe(' exact password ');
    expect(draft.save(fields, 0, true)).toBe(true);
    expect(draft.read()!.otpRequested).toBe(true);
    draft.clear();
    expect(draft.read()).toBeNull();
  });
  it('clears secrets on session changes and rejects delayed writes from a previous guest', () => {
    const session = createSessionStore(), draft = createRegistrationDraftStore(session);
    draft.save(fields, 0, true);
    session.establish({ id: 2, fullname: 'Other', role: 'USER' }, { accessToken: 'a', refreshToken: 'r' });
    expect(draft.read()).toBeNull();
    expect(draft.save(fields, 0, true)).toBe(false);
    expect(draft.save(fields, session.read().revision)).toBe(false);
    session.clear();
    expect(draft.read()).toBeNull();
    expect(draft.save(fields, 0, true)).toBe(false);
    expect(draft.save(fields, session.read().revision)).toBe(true);
  });
  it('keeps separate runtimes and newly opened tabs free of each other’s drafts', () => {
    const a = createRegistrationDraftStore(createSessionStore()), b = createRegistrationDraftStore(createSessionStore());
    a.save(fields, 0, true);
    expect(b.read()).toBeNull();
    expect(a.read()!.email).toBe('student@example.test');
  });
});
