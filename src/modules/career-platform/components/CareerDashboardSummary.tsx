import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import { Button } from '@/shared/ui/Button';
import { CountUp } from '@/shared/ui/CountUp';
import { SpotlightCard } from '@/shared/ui/SpotlightCard';
import { usePlatformQuery } from '../api/platform.api';
import { analyticsSchema } from '../model/contracts';
import styles from './CareerDashboardSummary.module.css';

export function CareerDashboardSummary({ resultPath, hasResult }: { resultPath: string; hasResult: boolean }) {
  const query = usePlatformQuery('analytics', '/api/v1/career/analytics', analyticsSchema, true);
  const data = query.data;
  const goal = data?.goals[0];
  const latest = data?.timeline[0];
  const total = data?.goals.reduce((sum, value) => sum + value.total, 0) ?? 0;
  const completed = data?.goals.reduce((sum, value) => sum + value.completed, 0) ?? 0;
  const metrics = [
    { title: 'Trắc nghiệm Holland', value: data?.counts.assessments, detail: 'Bài đã hoàn thành', path: resultPath, action: hasResult ? 'Xem kết quả' : 'Làm trắc nghiệm' },
    { title: 'Nghề nên tìm hiểu', value: data?.counts.runs, detail: 'Bản gợi ý đã tạo', path: paths.recommendations, action: 'Xem nghề phù hợp' },
    { title: 'Lộ trình', value: data ? <CountUp value={completed} suffix={`/${total}`} /> : undefined, detail: 'Nhiệm vụ đã tự xác nhận', path: paths.roadmap, action: 'Xem lộ trình' },
    { title: 'Hỏi AIHN', value: data?.counts.chats, detail: 'Hội thoại đã lưu', path: paths.advisor, action: 'Hỏi AIHN' },
  ];
  return <section className={styles.summary} aria-label="Tổng quan của bạn">
    <section className={styles.banner} aria-label="Mục tiêu học tập" data-journey-banner="">
      <div className={styles.goal}>
        <h2>{goal ? `Lộ trình: ${goal.title}` : query.isPending ? 'Đang tải tổng quan…' : query.isError ? 'Chưa tải được tổng quan' : 'Chọn một nghề để thử sức'}</h2>
        {goal ? <><p>{goal.completed}/{goal.total} nhiệm vụ hoàn thành · Tiến độ do bạn tự xác nhận.</p>{goal.total > 0 && <><progress aria-label={`Tiến độ ${goal.title}`} max={goal.total} value={goal.completed} /><p>{Math.round(goal.completed / goal.total * 100)}% nhiệm vụ hoàn thành</p></>}</> : <p>{query.isError ? 'Bạn vẫn có thể xem kết quả và hồ sơ bên dưới.' : 'Cập nhật kỹ năng, chọn nghề rồi chia việc học thành từng bước.'}</p>}
        {query.isError && <Button variant="secondary" onClick={() => { void query.refetch(); }}>Tải lại tổng quan</Button>}
        <div className={styles.actions}>{goal && <Link to={paths.roadmap}>Tiếp tục</Link>}<Link className={styles.profile} to={paths.careerProfile}>Cập nhật hồ sơ</Link></div>
      </div>
      <div className={styles.result}>
        {latest ? <><p>TopCode · Lần làm #{latest.attemptId}</p><div className={styles.codes}>{[...latest.topCode].map((code, index) => <span key={`${code}:${index}`} style={{ color: `var(--ce-${code.toLowerCase()})` }}>{code}</span>)}</div><Link to={paths.assessmentResult(latest.attemptId)}>Xem kết quả</Link></> : <p>{query.isPending ? 'Đang tải…' : query.isError ? 'Chưa tải được TopCode.' : 'Làm trắc nghiệm để xem nhóm sở thích nổi bật.'}</p>}
      </div>
    </section>
    <div className={styles.metrics}>{metrics.map(metric => <SpotlightCard as="section" key={metric.title} className={styles.metric} aria-label={metric.title} data-journey-metric=""><h2>{metric.title}</h2><strong>{typeof metric.value === 'number' ? <CountUp value={metric.value} /> : metric.value ?? '—'}</strong><p>{metric.detail}{!data && (query.isPending ? ' · Đang tải…' : ' · Chưa tải được')}</p><Link to={metric.path}>{metric.action}</Link></SpotlightCard>)}</div>
  </section>;
}
