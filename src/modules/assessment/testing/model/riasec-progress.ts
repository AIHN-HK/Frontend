import { riasecCodes } from '../../model/assessment.types';
import type { AssessmentPercentages, AssessmentQuestion } from '../../model/assessment.types';

export function summarizeRiasecProgress(questions: readonly Pick<AssessmentQuestion, 'id' | 'type'>[], answers: Readonly<Record<string, boolean>>) {
  const groups = riasecCodes.map(code => {
    const entries = questions.filter(question => question.type === code);
    const answered = entries.filter(question => typeof answers[String(question.id)] === 'boolean');
    const yes = answered.filter(question => answers[String(question.id)] === true).length;
    return { code, total: entries.length, answered: answered.length, yes,
      percentage: answered.length ? yes / answered.length * 100 : null };
  });
  const values = Object.fromEntries(groups.map(group => [group.code, group.percentage])) as AssessmentPercentages;
  return { groups, values };
}
