import { describe, expect, it } from 'vitest';
import { createAssessmentDraftStore, draftKey, isCatalogCompatible } from '@/modules/assessment/testing/model/assessment.draft';
import type { AssessmentDraft } from '@/modules/assessment/model/assessment.types';

const questions = [{ id: 11, content: 'Tìm hiểu một vấn đề mới', type: 'I' as const, dimension: 'INTEREST' as const }];
const draft: AssessmentDraft = { version: 1, ownerId: 71, scale: 'boolean', attemptId: 501, totalQuestions: 1, questions, answers: { '11': false }, index: 0, needsReview: false };
function storage() { const values = new Map<string, string>(); return { values, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } }; }
describe('owned Holland draft', () => {
  it('restores false answers and position across a new store, isolates owners and copies values', () => {
    const port = storage(), store = createAssessmentDraftStore(port);
    expect(store.write(71, draft)).toBe(true);
    const read = createAssessmentDraftStore(port).read(71); expect(read).toEqual({ kind: 'ready', draft });
    expect(store.read(72)).toEqual({ kind: 'missing' }); expect(store.write(72, draft)).toBe(false);
    if (read.kind === 'ready') read.draft.answers['11'] = true;
    expect(store.read(71)).toEqual({ kind: 'ready', draft });
  });
  it('reports incompatible versions, wrong owners and malformed answers without deleting data', () => {
    const port = storage(), store = createAssessmentDraftStore(port);
    for (const value of [{ ...draft, version: 2 }, { ...draft, scale: 'likert' }, { ...draft, ownerId: 72 }, { ...draft, answers: { '11': 5 } }, { ...draft, index: 2 }, { ...draft, questions: [questions[0], questions[0]] }, { ...draft, answers: { '12': true } }]) {
      port.setItem(draftKey(71), JSON.stringify(value)); expect(store.read(71).kind).toBe('incompatible'); expect(port.getItem(draftKey(71))).not.toBeNull();
    }
  });
  it('preserves uncertainty and only clears the matching attempt', () => {
    const port = storage(), store = createAssessmentDraftStore(port); store.write(71, { ...draft, needsReview: true });
    expect(store.clear(71, 999)).toBe(false); expect(store.read(71).kind).toBe('ready');
    expect(store.clear(71, 501)).toBe(true); expect(store.read(71).kind).toBe('missing');
  });
  it('detects changed catalog content or IDs while ignoring server ordering', () => {
    expect(isCatalogCompatible(draft, questions)).toBe(true);
    expect(isCatalogCompatible(draft, [{ ...questions[0]!, content: 'Nội dung mới' }])).toBe(false);
    expect(isCatalogCompatible(draft, [{ ...questions[0]!, id: 12 }])).toBe(false);
    expect(isCatalogCompatible(draft, [])).toBe(false);
  });
  it('reports inaccessible storage honestly', () => {
    const fail = () => { throw new Error('denied'); }, store = createAssessmentDraftStore({ getItem: fail, setItem: fail, removeItem: fail });
    expect(store.read(71).kind).toBe('unavailable'); expect(store.write(71, draft)).toBe(false); expect(store.clear(71, 501)).toBe(false);
  });
});

import { vi } from 'vitest';
import type { AxiosInstance } from 'axios';
import { readAssessmentQuestions, startAssessment, submitAssessment, readAssessmentConfirmation } from '@/modules/assessment/api/assessment.api';
const active = () => new AbortController().signal;
function httpFixture(data: unknown, status: number) {
  const get = vi.fn().mockResolvedValue({ status, data: { status, data } }), post = vi.fn().mockResolvedValue({ status, data: { status, data } });
  return { http: { get, post } as unknown as AxiosInstance, get, post };
}
const score = { R: 0, I: 1, A: 0, S: 0, E: 0, C: 0 };
describe('Holland API contracts', () => {
  it('flattens actual type/dimension groups and rejects duplicate IDs and unknown scales', async () => {
    const fixture = httpFixture({ questions: { I: { 'Sở thích': questions } } }, 200);
    await expect(readAssessmentQuestions(fixture.http, active())).resolves.toEqual(questions);
    for (const invalid of [{ I: { 'Sở thích': [...questions, ...questions] } }, { I: { 'Sở thích': [{ ...questions[0], type: 'INVALID' }] } }, { I: { 'Sở thích': null } }]) {
      await expect(readAssessmentQuestions(httpFixture({ questions: invalid }, 200).http, active())).rejects.toThrow();
    }
    await expect(readAssessmentQuestions(httpFixture({ questions: {} }, 200).http, active())).resolves.toEqual([]);
  });
  it('validates attempt owner and count; malformed creation is an unknown outcome', async () => {
    const fixture = httpFixture({ id: 501, userId: 71, totalQuestions: 1, finishAt: null }, 201);
    await expect(startAssessment(fixture.http, 71, active())).resolves.toEqual({ id: 501, userId: 71, totalQuestions: 1 });
    await expect(startAssessment(fixture.http, 72, active())).rejects.toMatchObject({ outcomeUnknown: true });
    await expect(startAssessment(httpFixture({ id: 501, userId: 71, totalQuestions: 0, finishAt: null }, 201).http, 71, active())).rejects.toMatchObject({ outcomeUnknown: true });
  });
  it('sends only boolean contract fields and confirms the exact attempt', async () => {
    const fixture = httpFixture({ attemptId: 501, score, topCode: 'ISC' }, 201), input = { ...draft, answers: { '11': true }, admin: true };
    await expect(submitAssessment(fixture.http, input, active())).resolves.toEqual({ attemptId: 501, scores: score, topCode: 'ISC' });
    expect(fixture.post.mock.calls[0]?.[1]).toEqual({ attemptId: 501, answers: [{ questionId: 11, check: true }] });
    for (const data of [{ attemptId: 999, score, topCode: 'ISC' }, { attemptId: 501, score: {}, topCode: 'ISC' }, { attemptId: 501, score, topCode: 'III' }]) {
      await expect(submitAssessment(httpFixture(data, 201).http, input, active())).rejects.toMatchObject({ outcomeUnknown: true });
    }
  });
  it('rejects missing answers and all false before dispatch; checks server result ownership', async () => {
    const fixture = httpFixture({ attemptId: 501, scores: score, top_code: 'ISC' }, 200);
    await expect(submitAssessment(fixture.http, draft, active())).rejects.toThrow();
    await expect(submitAssessment(fixture.http, { ...draft, answers: {} }, active())).rejects.toThrow(); expect(fixture.post).not.toHaveBeenCalled();
    await expect(readAssessmentConfirmation(fixture.http, 501, active())).resolves.toMatchObject({ attemptId: 501 });
    await expect(readAssessmentConfirmation(fixture.http, 999, active())).rejects.toThrow();
  });
  it('stores pending start separately to avoid creating another attempt on reload', () => {
    const port = storage(), store = createAssessmentDraftStore(port);
    store.markStart(71, null); expect(createAssessmentDraftStore(port).readStart(71)).toEqual({ kind: 'ready', attempt: null });
    const attempt = { id: 501, userId: 71, totalQuestions: 1 }; store.markStart(71, attempt);
    expect(store.readStart(71)).toEqual({ kind: 'ready', attempt }); expect(store.readStart(72)).toEqual({ kind: 'missing' });
    store.clearStart(71); expect(store.readStart(71)).toEqual({ kind: 'missing' });
  });
});
