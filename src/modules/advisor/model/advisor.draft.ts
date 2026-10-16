import { isPositiveId, isRecord } from './message.types';
export type AdvisorDraft = { content: string; needsReview: boolean; storageFailed: boolean; blocked: boolean };
type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
type AdvisorDraftStore = { read: () => AdvisorDraft; subscribe: (listener: () => void) => () => void; write: (content: string, needsReview: boolean) => boolean; discard: () => void };
const memory = new Map<string, AdvisorDraft>();
const stores = new Map<string, AdvisorDraftStore>();
export function advisorDraftKey(ownerId: number, sessionId: number | null) { return `aihn.advisor.draft.v1.${ownerId}.${sessionId ?? 'new'}`; }
export function createAdvisorDraftStore(ownerId: number, sessionId: number | null, storage?: DraftStorage): AdvisorDraftStore {
  if (!isPositiveId(ownerId) || (sessionId !== null && !isPositiveId(sessionId))) throw new Error('Invalid draft owner');
  const key = advisorDraftKey(ownerId, sessionId);
  const existing = stores.get(key); if (existing) return existing;
  const listeners = new Set<() => void>();
  let current = memory.get(key) ?? { content: '', needsReview: false, storageFailed: false, blocked: false };
  if (!memory.has(key) && storage) {
    try {
      const raw = storage.getItem(key);
      if (raw) {
        const data: unknown = JSON.parse(raw);
        if (!isRecord(data) || data.version !== 1 || data.ownerId !== ownerId || data.sessionId !== sessionId || typeof data.content !== 'string' || data.content.length > 100000 || typeof data.needsReview !== 'boolean') current = { ...current, blocked: true };
        else current = { ...current, content: data.content, needsReview: data.needsReview };
      }
    } catch { current = { ...current, storageFailed: true, blocked: true }; }
  }
  function publish(next: AdvisorDraft) { current = next; memory.set(key, next); for (const listener of listeners) listener(); }
  function write(content: string, needsReview: boolean) {
    if (current.blocked) return false;
    let storageFailed = !storage;
    try { if (storage) { if (!content && !needsReview) storage.removeItem(key); else storage.setItem(key, JSON.stringify({ version: 1, ownerId, sessionId, content, needsReview })); } } catch { storageFailed = true; }
    publish({ content, needsReview, storageFailed, blocked: false }); return true;
  }
  const store: AdvisorDraftStore = {
    read: () => current,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    write,
    discard: () => { try { storage?.removeItem(key); } catch { /* current-page memory remains usable */ } publish({ content: '', needsReview: false, storageFailed: !storage, blocked: false }); },
  };
  stores.set(key, store); return store;
}
export function browserDraftStorage(): DraftStorage | undefined { try { return window.sessionStorage; } catch { return undefined; } }
