import { session } from '@/shared/session/session';
import type { SessionStore } from '@/shared/session/session.types';

export type RegistrationFields = { email: string; fullname: string; password: string; yob: string; phone: string };
export type RegistrationDraft = RegistrationFields & { purpose: 'registration'; version: 1; revision: number; otpRequested: boolean; resendAvailableAt: number };

export function createRegistrationDraftStore(store: SessionStore) {
  let current: RegistrationDraft | null = null;
  let revision = store.read().revision;
  const listeners = new Set<() => void>();
  const publish = () => { for (const listener of listeners) listener(); };
  // This memory store lives for the tab, just like its session store.
  store.subscribe(() => {
    if (revision === store.read().revision) return;
    revision = store.read().revision;
    current = null;
    publish();
  });
  return {
    read: (): RegistrationDraft | null => current ? { ...current } : null,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    save: (fields: RegistrationFields, expectedRevision: number, otpRequested = false): boolean => {
      if (store.read().status !== 'anonymous' || store.read().revision !== expectedRevision) return false;
      const resendAvailableAt = otpRequested ? Date.now() + 60_000 : current?.email === fields.email ? current.resendAvailableAt : 0;
      current = { email: fields.email, fullname: fields.fullname, password: fields.password, yob: fields.yob, phone: fields.phone, purpose: 'registration', version: 1, revision: expectedRevision, otpRequested, resendAvailableAt };
      publish();
      return true;
    },
    deferResend: (until: number, expectedRevision: number): boolean => {
      if (!current || store.read().status !== 'anonymous' || store.read().revision !== expectedRevision) return false;
      current = { ...current, resendAvailableAt: Math.max(current.resendAvailableAt, until) };
      publish();
      return true;
    },
    clear: () => { current = null; publish(); },
  };
}

export const registrationDraft = createRegistrationDraftStore(session);
