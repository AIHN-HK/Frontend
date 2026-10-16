import { Link, useSearchParams } from 'react-router';
import { paths } from '@/routes/paths';
import { useAdminQuery } from '../../api/admin.api';
import { AdminDataState } from '../../components/AdminDataState';
import { studentsPageSchema, readListParams, writeListParams } from '../model/student.types';
import { Pagination } from '../components/Pagination';
import '../../components/admin-pages.css';
export function StudentsPage() {
  const [params, setParams] = useSearchParams(),
    criteria = readListParams(params),
    search = writeListParams(criteria),
    query = useAdminQuery(['students', criteria], `/api/v1/admin/students?${search}`, studentsPageSchema);
  return (
    <div className="admin-page">
      <header>
        <h1>Quản lý học sinh</h1>
        <p>Tìm theo tên hoặc email trong dữ liệu hệ thống.</p>
      </header>
      <form
        key={criteria.q}
        className="admin-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          const q = String(new FormData(e.currentTarget).get('q') ?? '').trim();
          setParams(writeListParams({ ...criteria, q, page: 1 }));
        }}
      >
        <label>
          Tìm học sinh
          <input name="q" maxLength={100} defaultValue={criteria.q} />
        </label>
        <button className="btn btn-primary">Tìm kiếm</button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setParams(writeListParams({ q: '', page: 1, limit: 20 }))}
        >
          Đặt lại
        </button>
      </form>
      <AdminDataState query={query}>
        {(data) => (
          <>
            <p>
              {data.total} học sinh · Trang {data.page}/{Math.max(1, Math.ceil(data.total / data.limit))}
            </p>
            {data.items.length ? (
              <div className="admin-table-scroll" role="region" tabIndex={0} aria-label="Học sinh">
                <table>
                  <thead>
                    <tr>
                      <th>Học sinh</th>
                      <th>Email</th>
                      <th>Lớp</th>
                      <th>Điện thoại</th>
                      <th>Ngày đăng ký</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <Link
                            to={`${paths.adminStudent(row.id)}?${new URLSearchParams({ list: search.toString() })}`}
                          >
                            {row.fullname}
                          </Link>
                        </td>
                        <td>{row.email}</td>
                        <td>{row.class ?? 'Chưa có'}</td>
                        <td>{row.phone ?? 'Chưa có'}</td>
                        <td>
                          {new Date(row.createdAt).toLocaleDateString('vi-VN', {
                            timeZone: 'Asia/Ho_Chi_Minh',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Không có học sinh phù hợp.</p>
            )}
            <Pagination
              page={data.page}
              total={data.total}
              limit={data.limit}
              busy={query.isFetching}
              onPage={(page) => setParams(writeListParams({ ...criteria, page }))}
            />
          </>
        )}
      </AdminDataState>
      <section className="admin-panel">
        <h2>Phạm vi dữ liệu</h2>
        <p>Chưa hỗ trợ lọc theo cấp học, TopCode, trạng thái làm bài hoặc xuất danh sách.</p>
      </section>
    </div>
  );
}
