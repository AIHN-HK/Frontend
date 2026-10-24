import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import { LatestRiasecSummary } from '@/modules/assessment';
import { usePlatformQuery } from '../api/platform.api';
import { analyticsSchema, careerSchema, profileSchema } from '../model/contracts';
import { ReadState } from './PlatformUI';
import styles from './CareerJourneySummary.module.css';

export function CareerJourneySummary() {
  const analytics = usePlatformQuery('analytics', '/api/v1/career/analytics', analyticsSchema, true);
  const profile = usePlatformQuery('profile', '/api/v1/career/profile', profileSchema, true);
  const targetId = profile.data?.targetCareerId;
  const target = usePlatformQuery('career', `/api/v1/careers/${encodeURIComponent(targetId ?? '')}`, careerSchema, false, Boolean(targetId));
  const total = analytics.data?.goals.reduce((sum, goal) => sum + goal.total, 0) ?? 0;
  const completed = analytics.data?.goals.reduce((sum, goal) => sum + goal.completed, 0) ?? 0;
  return <section className={styles.summary} aria-label="Tổng quan hành trình cá nhân">
    <ReadState pending={analytics.isPending} error={analytics.isError} retry={() => { void analytics.refetch(); }} />
    {analytics.data && <div className={styles.metrics}>
      {[{ label: 'Bài test hoàn thành', value: analytics.data.counts.assessments, hint: 'Holland đã nộp' }, { label: 'Bản gợi ý đã tạo', value: analytics.data.counts.runs, hint: 'Các bản gợi ý đã lưu' }, { label: 'Phiên tư vấn', value: analytics.data.counts.chats, hint: 'Hội thoại của bạn' }, { label: 'Nhiệm vụ hoàn thành', value: `${completed}/${total}`, hint: total ? `${Math.round(completed / total * 100)}% nhiệm vụ đã lưu` : 'Chưa có nhiệm vụ đã lưu' }].map(metric => <div className={styles.metric} key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.hint}</small></div>)}
    </div>}
    <div className={styles.grid}>
      <section className={styles.panel} aria-label="Điểm số Holland RIASEC"><h2>Điểm số Holland RIASEC</h2><LatestRiasecSummary /></section>
      <aside className={styles.panel} aria-label="Mục tiêu đã lưu"><h2>Nghề mục tiêu</h2>
        {profile.isPending ? <p>Đang tải mục tiêu…</p> : profile.isError ? <><p>Chưa tải được mục tiêu.</p><button type="button" onClick={() => { void profile.refetch(); }}>Thử lại mục tiêu</button></> : !targetId ? <p>Chưa chọn nghề mục tiêu.</p> : <><p>{(target.data?.id === targetId ? target.data.title : targetId)}</p><Link to={`/careers/${encodeURIComponent(targetId)}`}>Xem nghề mục tiêu</Link></>}
        {targetId && target.isError && <p>Chưa tải được tên nghề; mã mục tiêu đã lưu: {targetId}.</p>}
        <Link to={paths.roadmap}>Mở lộ trình cá nhân</Link>
        <h3>Tiến độ đã lưu</h3>
        {analytics.data ? analytics.data.goals.length ? analytics.data.goals.map(goal => <div className={styles.goal} key={goal.id}><p>{goal.title}</p><p>{goal.completed}/{goal.total} nhiệm vụ</p><progress aria-label={`Tiến độ ${goal.title}`} max={goal.total || 1} value={goal.completed} /></div>) : <p>Chưa có mục tiêu đã lưu.</p> : <p>Tiến độ chưa sẵn sàng.</p>}
      </aside>
    </div>
  </section>;
}
