import { expect, test } from 'vitest';
import { selectRecommendation } from '@/modules/career-platform/model/recommendation-selection';

test('selects only an explicitly requested item from the saved run', () => {
  const items = [{careerId:'15-1252.00'},{careerId:'15-2051.00'}];
  expect(selectRecommendation(items,'15-2051.00')).toBe(items[1]);
  expect(selectRecommendation(items,null)).toBeNull();
  expect(selectRecommendation(items,'unknown')).toBeNull();
  expect(selectRecommendation([], '15-1252.00')).toBeNull();
});
