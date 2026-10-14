import {Link} from 'react-router';
import {paths} from '@/routes/paths';
import {AsyncState} from '@/shared/ui/AsyncState';
export function CareersPage(){return <AsyncState state="unavailable" title="Danh mục nghề chưa sẵn sàng" description="Chưa có dữ liệu nghề đã xuất bản và công cụ quản lý danh mục cho hệ thống." action={<Link className="btn btn-secondary" to={paths.previewAdminCareers}>Xem giao diện dữ liệu mẫu · Chỉ đọc</Link>}/>;}
