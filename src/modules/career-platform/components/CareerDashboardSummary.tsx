import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import { Button } from '@/shared/ui/Button';
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
    { title: 'Trắc nghiệm Holland', value: data?.counts.assessments, detail: 'Bài trắc nghiệm hoàn thành', path: resultPath, action: hasResult ? 'Mở kết quả Holland' : 'Mở trắc nghiệm' },
    { title: 'Nghề nghiệp gợi ý', value: data?.counts.runs, detail: 'Bản gợi ý đã tạo', path: paths.recommendations, action: 'Xem trạng thái gợi ý' },
    { title: 'Lộ trình phát triển', value: data ? `${completed}/${total}` : undefined, detail: 'Nhiệm vụ đã tự xác nhận', path: paths.roadmap, action: 'Xem trạng thái lộ trình' },
    { title: 'Cố vấn AI', value: data?.counts.chats, detail: 'Phiên tư vấn của bạn', path: paths.advisor, action: 'Đi tới Cố vấn' },
  ];
  return <section className={styles.summary} aria-label="Tổng quan hành trình Dashboard">
    <section className={styles.banner} aria-label="Mục tiêu học tập" data-journey-banner="">
      <div className={styles.goal}>
        <h2>{goal ? `Lộ trình: ${goal.title}` : query.isPending ? 'Đang tải hành trình…' : query.isError ? 'Chưa tải được tổng quan hành trình' : 'Chọn mục tiêu nghề nghiệp của bạn'}</h2>
        {goal ? <><p>{goal.completed}/{goal.total} nhiệm vụ hoàn thành · Tiến độ do bạn tự xác nhận.</p>{goal.total > 0 && <><progress aria-label={`Tiến độ ${goal.title}`} max={goal.total} value={goal.completed} /><p>{Math.round(goal.completed / goal.total * 100)}% nhiệm vụ hoàn thành</p></>}</> : <p>{query.isError ? 'Các phần kết quả và hồ sơ bên dưới vẫn có thể sử dụng.' : 'Bổ sung kỹ năng, chọn nghề mục tiêu và tạo lộ trình từ hồ sơ đã lưu.'}</p>}
        {query.isError && <Button variant="secondary" onClick={() => { void query.refetch(); }}>Thử lại tổng quan hành trình</Button>}
        <div className={styles.actions}>{goal && <Link to={paths.roadmap}>Tiếp tục lộ trình đã lưu →</Link>}<Link className={styles.profile} to={paths.careerProfile}>Cập nhật hồ sơ</Link></div>
      </div>
      <div className={styles.result}>
        {latest ? <><p>TopCode · Lần làm #{latest.attemptId}</p><div className={styles.codes}>{[...latest.topCode].map((code, index) => <span key={`${code}:${index}`} style={{ color: `var(--ce-${code.toLowerCase()})` }}>{code}</span>)}</div><Link to={paths.assessmentResult(latest.attemptId)}>Xem TopCode đã lưu</Link></> : <p>{query.isPending ? 'Đang đọc dữ liệu…' : query.isError ? 'Chưa tải được TopCode.' : 'Chưa có TopCode đã lưu.'}</p>}
      </div>
    </section>
    <div className={styles.metrics}>{metrics.map(metric => <section key={metric.title} className={styles.metric} aria-label={metric.title} data-journey-metric=""><h2>{metric.title}</h2><strong>{metric.value ?? '—'}</strong><p>{metric.detail}{!data && (query.isPending ? ' · Đang tải…' : ' · Chưa tải được')}</p><Link to={metric.path}>{metric.action}</Link></section>)}</div>
  </section>;
}
