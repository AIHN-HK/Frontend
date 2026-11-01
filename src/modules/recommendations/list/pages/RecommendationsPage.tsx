import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import { AsyncState } from '@/shared/ui/AsyncState';

export function RecommendationsPage() {
  return <AsyncState state="unavailable" title="Chưa có gợi ý nghề cho bạn"
    description="Cập nhật hồ sơ, làm Holland hoặc hỏi AIHN để có thêm cơ sở chọn nghề."
    action={<><Link className="btn btn-primary" to={paths.assessment}>Làm trắc nghiệm</Link><Link className="btn btn-secondary" to={paths.careerProfile}>Cập nhật hồ sơ</Link><Link className="btn btn-secondary" to={paths.advisor}>Hỏi AIHN</Link><Link className="btn btn-secondary" to={paths.previewRecommendations}>Xem bản mẫu</Link></>} />;
}
