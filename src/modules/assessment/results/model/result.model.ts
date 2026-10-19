import { riasecCodes } from '../../model/assessment.types';
import type { AssessmentNormalization, AssessmentPercentages, AssessmentScores, RiasecCode } from '../../model/assessment.types';

export const riasecGroups: Record<RiasecCode, { name: string; english: string }> = {
  R: { name: 'Thực tế', english: 'Realistic' }, I: { name: 'Nghiên cứu', english: 'Investigative' },
  A: { name: 'Nghệ thuật', english: 'Artistic' }, S: { name: 'Xã hội', english: 'Social' },
  E: { name: 'Quản lý', english: 'Enterprising' }, C: { name: 'Nghiệp vụ', english: 'Conventional' },
};
export function parseAttemptId(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value); return Number.isSafeInteger(id) ? id : null;
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Snapshot không hợp lệ');
  return value as Record<string, unknown>;
}
export function normalizeAssessmentSnapshot(expected: AssessmentScores, value: unknown): AssessmentNormalization {
  const snapshot = record(value), saved = record(snapshot.result);
  if (!Array.isArray(snapshot.questions) || snapshot.questions.length === 0 || snapshot.questions.length > 1000) throw new Error('Thiếu bộ câu hỏi của lần làm');
  const counts: AssessmentScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }, selected = { ...counts }, ids = new Set<number>();
  for (const value of snapshot.questions) {
    const question = record(value);
    if (typeof question.id !== 'number' || !Number.isSafeInteger(question.id) || question.id <= 0 || ids.has(question.id) ||
      !riasecCodes.some(code => code === question.type) || (question.answerValue !== 0 && question.answerValue !== 1)) throw new Error('Snapshot không thuộc thang Có/Không');
    const code = question.type as RiasecCode;
    ids.add(question.id); counts[code]++; selected[code] += question.answerValue;
  }
  const percentages = {} as AssessmentPercentages;
  for (const code of riasecCodes) {
    if (selected[code] !== expected[code] || saved[`score${code}`] !== expected[code]) throw new Error('Snapshot không khớp điểm đã lưu');
    percentages[code] = counts[code] ? expected[code] / counts[code] * 100 : null;
  }
  return { counts, percentages, totalQuestions: snapshot.questions.length };
}
export function radarPoint(percentage: number | null, index: number, radius = 92) {
  if (percentage !== null && (!Number.isFinite(percentage) || percentage < 0 || percentage > 100)) throw new Error('Tỷ lệ không hợp lệ');
  const angle = -Math.PI / 2 + index * Math.PI / 3, distance = (percentage ?? 0) / 100 * radius;
  return { x: Number((180 + Math.cos(angle) * distance).toFixed(3)), y: Number((170 + Math.sin(angle) * distance).toFixed(3)) };
}
export function radarPoints(percentages: AssessmentPercentages, radius = 92): string {
  return riasecCodes.map((code, index) => { const { x, y } = radarPoint(percentages[code], index, radius); return `${x},${y}`; }).join(' ');
}
