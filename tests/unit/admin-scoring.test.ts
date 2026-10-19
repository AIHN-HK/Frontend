import { expect, it } from 'vitest';
import { prioritiesSchema, contentSchema } from '@/modules/admin/scoring/model/scoring.schema';
const rows = ['R', 'I', 'A', 'S', 'E', 'C'].map((type, i) => ({ type, priority: i + 1 }));
it('accepts only six unique types and ranks in range', () => {
  expect(prioritiesSchema.safeParse(rows).success).toBe(true);
  for (const bad of [
    rows.slice(1),
    rows.map(() => rows[0]),
    rows.map((r) => ({ ...r, priority: 1 })),
    rows.map((r) => ({ ...r, priority: r.priority + 1 })),
  ])
    expect(prioritiesSchema.safeParse(bad).success).toBe(false);
});
it('requires every Holland content section to contain nonblank text', () => {
  expect(
    contentSchema.safeParse({
      code: 'R',
      title: 'R',
      personality: [''],
      strengths: ['s'],
      weaknesses: ['w'],
      careers: ['c'],
    }).success,
  ).toBe(false);
});
