import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import { AsyncState } from '@/shared/ui/AsyncState';
export function CareersPage() {
  return (
    <AsyncState
      state="unavailable"
      title="Danh mục nghề đang được chuẩn bị"
      description="Chưa có nghề đã xuất bản hoặc công cụ quản lý danh mục ở đây."
      action={
        <Link className="btn btn-secondary" to={paths.previewAdminCareers}>
          Xem danh mục mẫu
        </Link>
      }
    />
  );
}
