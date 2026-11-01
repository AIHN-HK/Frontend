import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import { AsyncState } from '@/shared/ui/AsyncState';

export function CareerDetailUnavailablePage() {
  return <AsyncState state="unavailable" description="Chưa có nguồn xác minh thông tin nghề này."
    action={<><Link className="btn btn-primary" to={paths.careers}>Về danh mục nghề</Link><Link className="btn btn-secondary" to={paths.previewCareers}>Xem bản mẫu</Link></>} />;
}
