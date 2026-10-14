import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import { AsyncState } from '@/shared/ui/AsyncState';
export function RoadmapUnavailablePage() { return <AsyncState state="unavailable" title="Lộ trình cá nhân chưa sẵn sàng" description="Chưa có mục tiêu và tiến độ được lưu cho tài khoản của bạn." action={<><Link className="btn btn-secondary" to={paths.recommendations}>Xem gợi ý nghề</Link><Link className="btn btn-primary" to={paths.previewRoadmap}>Xem mẫu lộ trình chỉ đọc</Link></>} />; }
