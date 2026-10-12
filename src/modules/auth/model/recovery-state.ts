import { session } from '@/shared/session/session';
import type { SessionStore } from '@/shared/session/session.types';
import { registrationDraft } from './registration-draft';

export type RecoveryState = {
  purpose: 'password-recovery'; revision: number; email: string;
  resendAvailableAt: number; expiresAt: number; verifiedOtp: string | null;
};

// T05 begins this flow after send-otp. Credentials never leave this tab's memory.
export function createRecoveryState(store: SessionStore, onBegin: () => void = () => {}) {
  let current: RecoveryState | null = null;
  let revision = store.read().revision;
  const listeners = new Set<() => void>();
  const publish = () => { for (const listener of listeners) listener(); };
  store.subscribe(() => {
    if (revision === store.read().revision) return;
    revision = store.read().revision; current = null; publish();
  });
  const valid = (expectedRevision: number) => store.read().status === 'anonymous' && store.read().revision === expectedRevision;
  return {
    read: (): RecoveryState | null => current && current.expiresAt > Date.now() ? { ...current } : null,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    begin: (email: string, expectedRevision: number): boolean => {
      if (!valid(expectedRevision) || !email.trim()) return false;
      onBegin();
      current = { purpose: 'password-recovery', email: email.trim(), revision: expectedRevision, resendAvailableAt: Date.now() + 60_000, expiresAt: Date.now() + 600_000, verifiedOtp: null };
      publish(); return true;
    },
    deferResend: (until: number, expectedRevision: number): boolean => {
      if (!current || !valid(expectedRevision)) return false;
      current = { ...current, verifiedOtp: null, resendAvailableAt: Math.max(current.resendAvailableAt, until) };
      publish(); return true;
    },
    resent: (expectedRevision: number): boolean => {
      if (!current || !valid(expectedRevision)) return false;
      current = { ...current, verifiedOtp: null, expiresAt: Date.now() + 600_000, resendAvailableAt: Date.now() + 60_000 };
      publish(); return true;
    },
    verify: (otp: string, expectedRevision: number): boolean => {
      if (!current || !valid(expectedRevision) || current.expiresAt <= Date.now() || !/^\d{6}$/.test(otp)) return false;
      current = { ...current, verifiedOtp: otp }; publish(); return true;
    },
    clear: () => { current = null; publish(); },
  };
}

export const recoveryState = createRecoveryState(session, registrationDraft.clear);
