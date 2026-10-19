import type { AssessmentAttempt, AssessmentDraft, AssessmentQuestion } from '../../model/assessment.types';
import { isAssessmentQuestion } from '../../model/assessment.validation';

type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type DraftRead = { kind: 'ready'; draft: AssessmentDraft } | { kind: 'missing' | 'incompatible' | 'unavailable' };
export type StartRead = { kind: 'ready'; attempt: AssessmentAttempt | null } | { kind: 'missing' | 'incompatible' | 'unavailable' };
const startKey = (ownerId: number) => `aihn.assessment.start.v1.${ownerId}`;
export const draftKey = (ownerId: number) => `aihn.assessment.boolean.v1.${ownerId}`;
const positive = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);


function valid(value: unknown, ownerId: number): value is AssessmentDraft {
  if (!record(value) || value.version !== 1 || value.scale !== 'boolean' || value.ownerId !== ownerId ||
    !positive(ownerId) || !positive(value.attemptId) || !positive(value.totalQuestions) || value.totalQuestions > 1000 ||
    !Array.isArray(value.questions) || value.questions.length !== value.totalQuestions || !value.questions.every(isAssessmentQuestion) ||
    !Number.isSafeInteger(value.index) || (value.index as number) < 0 || (value.index as number) >= value.questions.length ||
    typeof value.needsReview !== 'boolean' || !record(value.answers)) return false;
  const ids = new Set(value.questions.map(question => String(question.id)));
  return ids.size === value.questions.length && Object.entries(value.answers).every(([id, answer]) => ids.has(id) && typeof answer === 'boolean');
}

export function isCatalogCompatible(draft: AssessmentDraft, questions: AssessmentQuestion[]): boolean {
  if (questions.length !== draft.totalQuestions) return false;
  const byId = new Map(questions.map(question => [question.id, question]));
  return draft.questions.every(question => { const current = byId.get(question.id); return current?.content === question.content && current.type === question.type && current.dimension === question.dimension; });
}

export function createAssessmentDraftStore(storage: StoragePort) {
  const read = (ownerId: number): DraftRead => {
    let raw: string | null;
    try { raw = storage.getItem(draftKey(ownerId)); } catch { return { kind: 'unavailable' }; }
    if (raw === null) return { kind: 'missing' };
    try { const value: unknown = JSON.parse(raw); return valid(value, ownerId) ? { kind: 'ready', draft: value } : { kind: 'incompatible' }; }
    catch { return { kind: 'incompatible' }; }
  };
  return {
    read,
    readStart(ownerId: number): StartRead {
      let raw: string | null;
      try { raw = storage.getItem(startKey(ownerId)); } catch { return { kind: 'unavailable' }; }
      if (raw === null) return { kind: 'missing' };
      try {
        const value: unknown = JSON.parse(raw);
        if (!record(value) || value.version !== 1 || value.ownerId !== ownerId) return { kind: 'incompatible' };
        const attempt = value.attempt;
        if (attempt === null) return { kind: 'ready', attempt: null };
        if (!record(attempt) || !positive(attempt.id) || attempt.userId !== ownerId || !positive(attempt.totalQuestions) || attempt.totalQuestions > 1000) return { kind: 'incompatible' };
        return { kind: 'ready', attempt: { id: attempt.id, userId: ownerId, totalQuestions: attempt.totalQuestions } };
      } catch { return { kind: 'incompatible' }; }
    },
    markStart(ownerId: number, attempt: AssessmentAttempt | null): boolean {
      try { storage.setItem(startKey(ownerId), JSON.stringify({ version: 1, ownerId, attempt })); return true; } catch { return false; }
    },
    clearStart(ownerId: number): boolean {
      try { storage.removeItem(startKey(ownerId)); return true; } catch { return false; }
    },
    write(ownerId: number, draft: AssessmentDraft): boolean {
      if (!valid(draft, ownerId)) return false;
      try { storage.setItem(draftKey(ownerId), JSON.stringify(draft)); return true; } catch { return false; }
    },
    clear(ownerId: number, attemptId: number): boolean {
      const existing = read(ownerId);
      if (existing.kind !== 'ready' || existing.draft.attemptId !== attemptId) return false;
      try { storage.removeItem(draftKey(ownerId)); return true; } catch { return false; }
    },
    discard(ownerId: number): boolean {
      try { storage.removeItem(draftKey(ownerId)); return true; } catch { return false; }
    },
  };
}

// Resolve Storage lazily so denied browser access becomes an honest UI state.
export const assessmentDraftStore = createAssessmentDraftStore({
  getItem: key => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
  removeItem: key => window.localStorage.removeItem(key),
});
