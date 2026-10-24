import { z } from 'zod';
import { isAssessmentQuestion } from '../../model/assessment.validation';
import type { AssessmentQuestion } from '../../model/assessment.types';
import { normalizeAssessmentSnapshot } from '../../results/model/result.model';

const code = z.enum(['R', 'I', 'A', 'S', 'E', 'C']);
const vector = z.record(code, z.number().int().nonnegative());
const question = z.custom<AssessmentQuestion>(isAssessmentQuestion);
const analysis = z.object({ code: z.string(), title: z.string(), description: z.string().nullable().optional(), personality: z.array(z.string()), strengths: z.array(z.string()), weaknesses: z.array(z.string()), careers: z.array(z.string()) });
export const guestCatalogSchema = z.object({ id: z.string().uuid(), expiresAt: z.number().positive(), catalogToken: z.string().min(1).max(75000), questions: z.array(question).min(1).max(1000) }).refine(data => new Set(data.questions.map(q => q.id)).size === data.questions.length);
export const guestResultSchema = z.object({ id: z.string().uuid(), expiresAt: z.number().positive(), receipt: z.string().min(1).max(75000), scores: vector, topCode: z.string().regex(/^[RIASEC]{3}$/).refine(value => new Set(value).size === 3), snapshot: z.unknown(), analysis: z.array(analysis) }).refine(data => {
  try { normalizeAssessmentSnapshot(data.scores, data.snapshot); return true; } catch { return false; }
});
export const guestDraftSchema = z.object({ version: z.literal(1), catalog: guestCatalogSchema, answers: z.record(z.string(), z.boolean()), index: z.number().int().nonnegative(), result: guestResultSchema.nullable(), claim: z.object({ ownerId: z.number().int().positive(), needsReview: z.boolean() }).nullable() }).refine(data => {
  const ids = new Set(data.catalog.questions.map(q => String(q.id)));
  return data.index < ids.size && Object.keys(data.answers).every(id => ids.has(id)) && (!data.result || data.result.id === data.catalog.id);
});
export type GuestCatalog = z.infer<typeof guestCatalogSchema>;
export type GuestResult = z.infer<typeof guestResultSchema>;
export type GuestDraft = z.infer<typeof guestDraftSchema>;

// A denied/quota-limited session store keeps the current tab usable in memory.
export function createGuestAssessmentStore(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>) {
  const key = 'aihn.assessment.guest.v1';
  let value: GuestDraft | null = null;
  let storageOk = true;
  let invalid = false;
  try {
    const raw = storage.getItem(key);
    if (raw) { const parsed = guestDraftSchema.safeParse(JSON.parse(raw)); if (parsed.success) value = parsed.data; else invalid = true; }
  } catch { storageOk = false; }
  const listeners = new Set<() => void>();
  const publish = () => { for (const listener of listeners) listener(); };
  return {
    read: () => value,
    available: () => storageOk,
    invalid: () => invalid,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    write(next: GuestDraft) {
      const checked = guestDraftSchema.parse(next);
      value = checked;
      try { storage.setItem(key, JSON.stringify(checked)); storageOk = true; } catch { storageOk = false; }
      invalid = false; publish();
    },
    clear(id: string) {
      if (value && value.catalog.id !== id) return false;
      try { storage.removeItem(key); storageOk = true; } catch { storageOk = false; return false; }
      value = null; invalid = false; publish(); return true;
    },
  };
}
export const guestAssessmentStore = createGuestAssessmentStore({ getItem: key => window.sessionStorage.getItem(key), setItem: (key, value) => window.sessionStorage.setItem(key, value), removeItem: key => window.sessionStorage.removeItem(key) });
