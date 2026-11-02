import { Link } from 'react-router';
import { AsyncState } from '@/shared/ui/AsyncState';
import { paths } from '@/routes/paths';
export function RecommendationDetailUnavailablePage() {
  return (
    <AsyncState
      state="unavailable"
      title="Chưa xem được lý do gợi ý"
      description="Chưa có phần giải thích được xác minh cho gợi ý này."
      action={
        <Link className="btn btn-secondary" to={paths.recommendations}>
          Về danh sách gợi ý
        </Link>
      }
    />
  );
}
