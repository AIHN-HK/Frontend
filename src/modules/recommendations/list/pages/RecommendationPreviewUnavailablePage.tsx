import { Link, useSearchParams } from 'react-router';
import { paths } from '@/routes/paths';
import { AsyncState } from '@/shared/ui/AsyncState';
import { readRecommendationView, writeRecommendationView } from '../../model/recommendation.types';

export function RecommendationPreviewUnavailablePage() {
  const [params] = useSearchParams();
  const query = writeRecommendationView(readRecommendationView(params)).toString();
  return <AsyncState state="unavailable" title="Phân tích gợi ý mẫu chưa sẵn sàng" description="Đây là điểm dừng của bản preview danh sách. Phân tích gợi ý chi tiết chưa có dữ liệu."
    action={<Link className="btn btn-secondary" to={paths.previewRecommendations + (query ? `?${query}` : '')}>Quay lại gợi ý mẫu</Link>} />;
}
