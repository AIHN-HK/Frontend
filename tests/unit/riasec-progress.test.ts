import { expect, test } from 'vitest';
import { summarizeRiasecProgress } from '@/modules/assessment/testing/model/riasec-progress';

const questions = [{ id: 1, type: 'I' }, { id: 2, type: 'I' }, { id: 3, type: 'S' }] as const;
test('unanswered RIASEC groups stay unknown, including groups with no questions', () => {
  const result = summarizeRiasecProgress(questions, {});
  expect(result.values).toEqual({ R: null, I: null, A: null, S: null, E: null, C: null });
  expect(result.groups.find(group => group.code === 'I')).toEqual({ code: 'I', total: 2, answered: 0, yes: 0, percentage: null });
});
test('No is answered with a real zero, never missing or an automatic Yes', () => {
  const result = summarizeRiasecProgress(questions, { '1': false });
  expect(result.values.I).toBe(0);
  expect(result.values.S).toBeNull();
  expect(result.groups.find(group => group.code === 'I')).toMatchObject({ answered: 1, yes: 0 });
});
test('live ratios use answered questions and recalculate when an answer changes', () => {
  expect(summarizeRiasecProgress(questions, { '1': true }).values.I).toBe(100);
  expect(summarizeRiasecProgress(questions, { '1': true, '2': false }).values.I).toBe(50);
  expect(summarizeRiasecProgress(questions, { '1': false, '2': false }).values.I).toBe(0);
});
test('orphan answers are ignored without modifying the catalog or draft', () => {
  const answers = Object.freeze({ '1': false, '99': true });
  const result = summarizeRiasecProgress(questions, answers);
  expect(result.groups.reduce((sum, group) => sum + group.answered, 0)).toBe(1);
  expect(answers).toEqual({ '1': false, '99': true });
  expect(summarizeRiasecProgress([], answers).values.I).toBeNull();
});
