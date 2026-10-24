import { Link, Navigate } from 'react-router';
import { paths } from '@/routes/paths';
import { AsyncState } from '@/shared/ui/AsyncState';
import { Button } from '@/shared/ui/Button';
import { useAssessmentHistoryQuery } from '../../queries/assessment.queries';

export function LatestAssessmentResultPage() {
  const history = useAssessmentHistoryQuery();
  if (history.isPending) return <AsyncState state="loading" title="Đang tìm kết quả gần nhất…" />;
  if (history.isError) return <AsyncState
    state="error"
    title="Không tải được lịch sử kết quả"
    description="Chưa xác định được kết quả gần nhất. Vui lòng tải lại trước khi mở kết quả."
    action={<Button onClick={() => { void history.refetch(); }}>Thử lại lịch sử kết quả</Button>}
  />;
  const latest = history.data[0];
  if (latest) return <Navigate to={paths.assessmentResult(latest.attemptId)} replace />;
  return <AsyncState
    state="empty"
    title="Chưa có kết quả Holland"
    description="Hoàn thành bài trắc nghiệm để xem kết quả của bạn."
    action={<Link className="btn btn-primary" to={paths.assessment}>Làm bài trắc nghiệm</Link>}
  />;
}
