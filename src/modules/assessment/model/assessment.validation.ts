import { riasecCodes } from './assessment.types';
import type { AssessmentQuestion } from './assessment.types';

export function isAssessmentQuestion(value: unknown): value is AssessmentQuestion {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  return typeof data.id === 'number' && Number.isSafeInteger(data.id) && data.id > 0 &&
    typeof data.content === 'string' && Boolean(data.content.trim()) && riasecCodes.some(code => code === data.type) &&
    (data.dimension === null || data.dimension === 'PERSONA' || data.dimension === 'ABILITY' || data.dimension === 'INTEREST');
}
