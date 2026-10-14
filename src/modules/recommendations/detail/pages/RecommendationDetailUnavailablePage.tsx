import { Link } from 'react-router';
import { AsyncState } from '@/shared/ui/AsyncState';
import { paths } from '@/routes/paths';
export function RecommendationDetailUnavailablePage() {
  return (
    <AsyncState
      state="unavailable"
      title="Phân tích gợi ý chưa sẵn sàng"
      description="Chưa có phân tích cá nhân được xác nhận cho gợi ý này."
      action={
        <Link className="btn btn-secondary" to={paths.recommendations}>
          Về danh sách gợi ý
        </Link>
      }
    />
  );
}
