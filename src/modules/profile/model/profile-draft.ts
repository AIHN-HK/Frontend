import { session } from '@/shared/session/session';
import type { SessionStore } from '@/shared/session/session.types';
import type { ProfileForm } from './profile.schema';
import type { ProfileScope } from './profile.types';

type Draft = { version: 1; scope: ProfileScope; fields: ProfileForm; needsReview: boolean };

export function createProfileDraftStore(store: SessionStore) {
  let draft: Draft | null = null;
  const matches = (scope: ProfileScope) => {
    const current = store.read();
    return current.status === 'authenticated' && current.user?.id === scope.ownerId && current.revision === scope.revision;
  };
  const unsubscribe = store.subscribe(() => { if (draft && !matches(draft.scope)) draft = null; });
  return {
    read(scope: ProfileScope) {
      return matches(scope) && draft?.scope.ownerId === scope.ownerId && draft.scope.revision === scope.revision ? { ...draft, scope: { ...draft.scope }, fields: { ...draft.fields } } : null;
    },
    save(fields: ProfileForm, scope: ProfileScope, needsReview = draft?.needsReview ?? false) {
      if (!matches(scope)) return false;
      draft = { version: 1, scope: { ...scope }, fields: { ...fields }, needsReview };
      return true;
    },
    clear(scope: ProfileScope) { if (matches(scope)) draft = null; },
    dispose: unsubscribe,
  };
}

export const profileDraft = createProfileDraftStore(session);
if (import.meta.hot) import.meta.hot.dispose(profileDraft.dispose);
