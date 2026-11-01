import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import { AsyncState } from '@/shared/ui/AsyncState';

export function CareerCatalogUnavailablePage() {
  return <AsyncState state="unavailable" description="Danh mục đang chờ nguồn thông tin được xác minh."
    action={<><Link className="btn btn-primary" to={paths.previewCareers}>Xem bản mẫu</Link><Link className="btn btn-secondary" to={paths.home}>Về trang chủ</Link></>} />;
}
