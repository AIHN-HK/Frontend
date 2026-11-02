import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import { AsyncState } from '@/shared/ui/AsyncState';
export function RoadmapUnavailablePage() {
  return (
    <AsyncState
      state="unavailable"
      title="Chưa có lộ trình của bạn"
      description="Chọn một mục tiêu để bắt đầu, khi tính năng sẵn sàng."
      action={
        <>
          <Link className="btn btn-secondary" to={paths.recommendations}>
            Xem gợi ý nghề
          </Link>
          <Link className="btn btn-primary" to={paths.previewRoadmap}>
            Xem lộ trình mẫu
          </Link>
        </>
      }
    />
  );
}
