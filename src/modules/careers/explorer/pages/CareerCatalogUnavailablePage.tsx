import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import { AsyncState } from '@/shared/ui/AsyncState';

export function CareerCatalogUnavailablePage() {
  return <AsyncState state="unavailable" description="Danh mục nghề chưa có nguồn dữ liệu được xác nhận."
    action={<><Link className="btn btn-primary" to={paths.previewCareers}>Xem bản preview · Dữ liệu mẫu</Link><Link className="btn btn-secondary" to={paths.home}>Về trang chủ</Link></>} />;
}
