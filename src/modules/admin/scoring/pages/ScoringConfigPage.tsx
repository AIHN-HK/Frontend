import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import { useAdminQuery } from '../../api/admin.api';
import { AdminDataState } from '../../components/AdminDataState';
import { prioritiesSchema } from '../model/scoring.schema';
import { PriorityEditor } from '../components/PriorityEditor';
import '../../components/admin-pages.css';
export function ScoringConfigPage() {
  const query = useAdminQuery(['priorities'], '/api/v1/priority', prioritiesSchema);
  return (
    <div className="admin-page">
      <header>
        <h1>Thứ tự ưu tiên Holland</h1>
        <p>Cấu hình xử lý đồng điểm của bộ đề hiện tại.</p>
      </header>
      <AdminDataState query={query}>
        {(data) => <PriorityEditor initial={data} reload={async () => !(await query.refetch()).isError} />}
      </AdminDataState>
      <section className="admin-panel">
        <h2>Quy tắc hiện tại</h2>
        <p>
          Giữ thang trả lời Có/Không. Giao diện chưa hỗ trợ chỉnh độ dài TopCode, ngưỡng, trọng số hay mô
          phỏng thuật toán.
        </p>
        <Link className="btn btn-secondary" to={paths.adminHollandContent}>
          Chỉnh sửa nội dung Holland
        </Link>
      </section>
    </div>
  );
}
