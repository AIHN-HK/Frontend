import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import { Button } from '@/shared/ui/Button';
import { RadarChart } from '@/shared/ui/ce/RadarChart';
import { RiasecBar } from '@/shared/ui/ce/RiasecBar';
import { useAssessmentHistoryQuery, useAssessmentNormalizationQuery, useAssessmentResultQuery } from '../../queries/assessment.queries';
import styles from './OwnedRiasecSummary.module.css';

const groups = { R: 'Thực tế', I: 'Nghiên cứu', A: 'Nghệ thuật', S: 'Xã hội', E: 'Quản lý', C: 'Nghiệp vụ' } as const;
export function LatestRiasecSummary({ compact = false }: { compact?: boolean }) {
  const history = useAssessmentHistoryQuery();
  if (history.isPending) return <p role="status">Đang tải kết quả Holland gần nhất…</p>;
  if (history.isError) return <div><p>Chưa tải được lịch sử Holland.</p><Button variant="secondary" onClick={() => { void history.refetch(); }}>Thử lại lịch sử Holland</Button></div>;
  const latest = history.data[0];
  if (!latest) return <div className={styles.summary}><p>Chưa có kết quả Holland hoàn thành.</p><Link to={paths.assessment}>Bắt đầu trắc nghiệm Holland</Link></div>;
  return <OwnedRiasecSummary attemptId={latest.attemptId} compact={compact} />;
}
export function OwnedRiasecSummary({ attemptId, compact = false }: { attemptId: number; compact?: boolean }) {
  const result = useAssessmentResultQuery(attemptId);
  const normalization = useAssessmentNormalizationQuery(result.data);
  return <div className={styles.summary} aria-label={`Tóm tắt RIASEC lần làm #${attemptId}`}>
    {result.isPending ? <p role="status">Đang tải kết quả Holland…</p> : result.isError ? <><p>Chưa tải được kết quả Holland #{attemptId}.</p><Button variant="secondary" onClick={() => { void result.refetch(); }}>Thử lại kết quả Holland</Button></> : <>
      <p className={styles.code}>TopCode: <strong>{result.data.topCode}</strong> · Lần làm #{attemptId}</p>
      {normalization.isPending ? <p role="status">Đang tải số câu của lần làm…</p> : normalization.isError ? <><p>Chưa chuẩn hóa được kết quả từ bộ câu hỏi của lần làm.</p><Button variant="secondary" onClick={() => { void normalization.refetch(); }}>Thử lại chuẩn hóa Holland</Button></> : <>
        <div className={compact ? styles.compact : styles.grid}>
          {!compact && <div className={styles.bars}>{(Object.keys(groups) as (keyof typeof groups)[]).map(code => {
            const value = normalization.data.percentages[code];
            return <RiasecBar key={code} code={code} label={groups[code]} percentage={value} valueLabel={value === null ? 'Chưa có dữ liệu' : `${value.toFixed(1)}%`} />;
          })}</div>}
          <RadarChart values={normalization.data.percentages} label={`Tỷ lệ Có theo nhóm RIASEC của lần làm #${attemptId}`} />
        </div>
        {!compact && <p>Tỷ lệ Có dựa trên {normalization.data.totalQuestions} câu trong snapshot của chính lần làm; không phải xác suất thành công nghề nghiệp.</p>}
      </>}
      <Link to={paths.assessmentResult(attemptId)}>Mở kết quả Holland #{attemptId}</Link>
    </>}
  </div>;
}
