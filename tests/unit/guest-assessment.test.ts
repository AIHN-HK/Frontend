import { describe, expect, it } from 'vitest';
import { createGuestAssessmentStore } from '@/modules/assessment/guest/model/guest-assessment';
import type { GuestDraft } from '@/modules/assessment/guest/model/guest-assessment';

const draft: GuestDraft = { version: 1, catalog: { id: '2e0a792e-5522-4d3a-839e-2405c34e98e9', expiresAt: 1900000000000, catalogToken: 'signed-fixture', questions: [{ id: 11, type: 'I', content: 'Explore', dimension: 'INTEREST' }] }, answers: { '11': false }, index: 0, result: null, claim: null };
function storage() { const map = new Map<string, string>(); return { getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => { map.set(key, value); }, removeItem: (key: string) => { map.delete(key); }, map }; }
describe('guest tab draft', () => {
  it('restores No answers, position and claim uncertainty across reload without entering localStorage', () => {
    const port = storage(); const store = createGuestAssessmentStore(port);
    store.write({ ...draft, claim: { ownerId: 71, needsReview: true } });
    expect(createGuestAssessmentStore(port).read()).toEqual({ ...draft, claim: { ownerId: 71, needsReview: true } });
    expect(createGuestAssessmentStore(storage()).read()).toBeNull();
  });
  it('keeps unknown versions or invalid IDs intact until explicit replacement', () => {
    const port = storage(); const raw = JSON.stringify({ ...draft, version: 2 }); port.setItem('aihn.assessment.guest.v1', raw);
    const store = createGuestAssessmentStore(port); expect(store.invalid()).toBe(true); expect(store.read()).toBeNull(); expect(port.getItem('aihn.assessment.guest.v1')).toBe(raw);
    expect(() => store.write({ ...draft, answers: { '99': false } })).toThrow();
  });
  it('retains in-memory choices when storage is denied and reports failed clearing', () => {
    const store = createGuestAssessmentStore({ getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); }, removeItem: () => { throw new Error('denied'); } });
    store.write(draft); expect(store.read()?.answers['11']).toBe(false); expect(store.available()).toBe(false);
    expect(store.clear(draft.catalog.id)).toBe(false); expect(store.read()).not.toBeNull();
  });
  it('clears only the matching confirmed guest test', () => {
    const store = createGuestAssessmentStore(storage()); store.write(draft);
    expect(store.clear('other-id')).toBe(false); expect(store.read()).not.toBeNull();
    expect(store.clear(draft.catalog.id)).toBe(true); expect(store.read()).toBeNull();
  });
});
