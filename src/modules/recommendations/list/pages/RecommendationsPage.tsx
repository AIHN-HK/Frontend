import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import { AsyncState } from '@/shared/ui/AsyncState';

export function RecommendationsPage() {
  return <AsyncState state="unavailable" title="Gợi ý nghề nghiệp cá nhân chưa sẵn sàng"
    description="Hiện chưa có danh sách nghề phù hợp được xác nhận cho bạn. Bạn có thể cập nhật hồ sơ, làm trắc nghiệm Holland hoặc trao đổi với Cố vấn AI."
    action={<><Link className="btn btn-primary" to={paths.assessment}>Làm trắc nghiệm Holland</Link><Link className="btn btn-secondary" to={paths.careerProfile}>Cập nhật hồ sơ</Link><Link className="btn btn-secondary" to={paths.advisor}>Trao đổi với Cố vấn AI</Link><Link className="btn btn-secondary" to={paths.previewRecommendations}>Xem bản preview · Dữ liệu mẫu</Link></>} />;
}
