import { session } from '@/shared/session/session';
import type { SessionStore } from '@/shared/session/session.types';

export type RegistrationFields = { email: string; fullname: string; password: string; yob: string; phone: string };
export type RegistrationDraft = RegistrationFields & { version: 1; revision: number; otpRequested: boolean };

export function createRegistrationDraftStore(store: SessionStore) {
  let current: RegistrationDraft | null = null;
  let revision = store.read().revision;
  // This memory store lives for the tab, just like its session store.
  store.subscribe(() => {
    if (revision === store.read().revision) return;
    revision = store.read().revision;
    current = null;
  });
  return {
    read: (): RegistrationDraft | null => current ? { ...current } : null,
    save: (fields: RegistrationFields, expectedRevision: number, otpRequested = false): boolean => {
      if (store.read().status !== 'anonymous' || store.read().revision !== expectedRevision) return false;
      current = { email: fields.email, fullname: fields.fullname, password: fields.password, yob: fields.yob, phone: fields.phone, version: 1, revision: expectedRevision, otpRequested };
      return true;
    },
    clear: () => { current = null; },
  };
}

export const registrationDraft = createRegistrationDraftStore(session);
