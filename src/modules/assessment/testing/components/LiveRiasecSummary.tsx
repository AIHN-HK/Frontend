import { RadarChart } from '@/shared/ui/ce/RadarChart';
import type { AssessmentQuestion } from '../../model/assessment.types';
import { riasecGroups } from '../../results/model/result.model';
import { summarizeRiasecProgress } from '../model/riasec-progress';
import styles from './LiveRiasecSummary.module.css';

export function LiveRiasecSummary({ questions, answers }: {
  questions: readonly Pick<AssessmentQuestion, 'id' | 'type'>[];
  answers: Readonly<Record<string, boolean>>;
}) {
  const { groups, values } = summarizeRiasecProgress(questions, answers);
  return <div className={styles.summary} data-live-riasec="">
    <RadarChart values={values} showPartial label="Biểu đồ câu trả lời RIASEC tạm thời, chưa phải kết quả Holland" />
    <p className={styles.note}>Tạm thời · Tỷ lệ Có / đã trả lời.</p>
    <ul className={styles.groups}>{groups.map(group => <li key={group.code} data-riasec-group={group.code}>
      <div><span className={styles.name}><b style={{ color: `var(--ce-${group.code.toLowerCase()})` }}>{group.code}</b> · {riasecGroups[group.code].name}</span>
        <small>{group.yes} Có / {group.answered} đã trả lời · {group.total} câu</small>
      </div>
    </li>)}</ul>
  </div>;
}
