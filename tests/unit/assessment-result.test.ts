import { describe, expect, it, vi } from 'vitest';
import type { AxiosInstance } from 'axios';
import { parseAttemptId, normalizeAssessmentSnapshot, radarPoints } from '@/modules/assessment/results/model/result.model';
import { readAssessmentResult, readAssessmentAnalysis } from '@/modules/assessment/api/assessment.api';
import { resultData, snapshotData, analysisData } from '../e2e/result.fixture';
const active = () => new AbortController().signal;
const http = (data: unknown) => ({ get: vi.fn().mockResolvedValue({ status: 200, data: { status: 200, data } }) }) as unknown as AxiosInstance;
describe('assessment result contracts and visualization', () => {
  it('rejects unsafe/noninteger IDs rather than parseInt truncation', () => {
    for (const value of [undefined, '', '0', '-1', 'abc', '1.5', '1e3', '1abc', '9007199254740992']) expect(parseAttemptId(value)).toBeNull();
    expect(parseAttemptId('812')).toBe(812); expect(parseAttemptId('9007199254740991')).toBe(9007199254740991);
  });
  it('normalizes from historical counts, includes zero and handles absent groups honestly', () => {
    const normalized = normalizeAssessmentSnapshot(resultData().scores, snapshotData().snapshot);
    expect(normalized.counts.I).toBe(8); expect(normalized.percentages.I).toBe(50); expect(normalized.percentages.R).toBe(0); expect(normalized.totalQuestions).toBe(26);
    const missing = snapshotData(812, { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }, { I: 2 });
    expect(normalizeAssessmentSnapshot({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }, missing.snapshot).percentages.R).toBeNull();
  });
  it('rejects a changed snapshot, legacy Likert values, duplicate questions or missing scores', () => {
    for (const modify of [(data: ReturnType<typeof snapshotData>) => { data.snapshot.questions[0]!.answerValue = 5; }, (data: ReturnType<typeof snapshotData>) => { data.snapshot.questions.push(data.snapshot.questions[0]!); }, (data: ReturnType<typeof snapshotData>) => { data.snapshot.questions.find(q => q.type === 'I')!.answerValue = 0; }]) {
      const data = snapshotData(); modify(data); expect(() => normalizeAssessmentSnapshot(resultData().scores, data.snapshot)).toThrow();
    }
    expect(() => normalizeAssessmentSnapshot(resultData().scores, {})).toThrow();
  });
  it('keeps all-zero radar finite and does not alter data to draw a shape', () => {
    expect(radarPoints({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 })).toBe(Array(6).fill('180,170').join(' '));
    expect(radarPoints({ R: null, I: 50, A: 0, S: 0, E: 100, C: 25 })).not.toMatch(/NaN|Infinity/);
  });
  it('validates six raw scores, ranking and identity, preserving authoritative server tie TopCode', async () => {
    const data = resultData(); await expect(readAssessmentResult(http(data), 812, active())).resolves.toMatchObject({ attemptId: 812, topCode: 'ISC' });
    for (const bad of [{ ...data, scores: { I: 4 } }, { ...data, attemptId: 999 }, { ...data, ranked: data.ranked.slice(1) }, { ...data, top_code: 'III' }]) await expect(readAssessmentResult(http(bad), 812, active())).rejects.toThrow();
    const zero = resultData(812, { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }, 'ISC'); await expect(readAssessmentResult(http(zero), 812, active())).resolves.toMatchObject({ topCode: 'ISC' });
  });
  it('handles special/partial analysis and refuses unknown JSON content', async () => {
    const analysis = analysisData(); await expect(readAssessmentAnalysis(http(analysis), 812, active())).resolves.toMatchObject({ items: [{ code: 'I' }, { code: 'S' }, { code: 'C' }] });
    await expect(readAssessmentAnalysis(http({ ...analysis, analyzeResult: [{ ...analysis.analyzeResult[0], code: 'ALL_HIGH' }] }), 812, active())).resolves.toMatchObject({ items: [{ code: 'ALL_HIGH' }] });
    await expect(readAssessmentAnalysis(http({ ...analysis, analyzeResult: [{ ...analysis.analyzeResult[0], personality: [{ unsafe: true }] }] }), 812, active())).rejects.toThrow();
  });
});
