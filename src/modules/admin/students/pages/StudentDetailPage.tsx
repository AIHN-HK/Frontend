import { z } from 'zod';
import { Link, useParams, useSearchParams } from 'react-router';
import { paths } from '@/routes/paths';
import { ApiError } from '@/shared/api/api-error';
import { AsyncState } from '@/shared/ui/AsyncState';
import { useAdminQuery } from '../../api/admin.api';
import { resultSchema, idSchema } from '../../model/contracts';
import { AdminDataState } from '../../components/AdminDataState';
import { studentSchema, readStudentId, readListParams, writeListParams } from '../model/student.types';
import { Pagination } from '../components/Pagination';
import '../../components/admin-pages.css';
const attemptsSchema = z.object({
  items: z.array(
    z.object({
      id: idSchema,
      finishAt: z.string(),
      totalQuestions: z.number().int().nonnegative(),
      result: resultSchema,
    }),
  ),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export function StudentDetailPage() {
  const { studentId } = useParams(),
    id = readStudentId(studentId),
    [params, setParams] = useSearchParams(),
    pageNumber = readListParams(params).page,
    list = writeListParams(readListParams(new URLSearchParams(params.get('list') ?? ''))),
    schema = z
      .object({ student: studentSchema, attempts: attemptsSchema })
      .refine((data) => data.student.id === id, 'Unexpected student ID'),
    query = useAdminQuery(
      ['student', id, pageNumber],
      `/api/v1/admin/students/${id ?? 0}?page=${pageNumber}&limit=20`,
      schema,
      id !== null,
    );
  const back = (
    <Link className="btn btn-secondary" to={`${paths.adminStudents}?${list}`}>
      Danh sách học sinh
    </Link>
  );
  if (id === null)
    return (
      <div className="admin-page">
        {back}
        <AsyncState state="unavailable" title="Mã học sinh không hợp lệ" />
      </div>
    );
  if (query.error instanceof ApiError && query.error.status === 404)
    return (
      <div className="admin-page">
        {back}
        <AsyncState state="empty" title="Không tìm thấy học sinh" />
      </div>
    );
  return (
    <div className="admin-page">
      {back}
      <AdminDataState query={query}>
        {(data) => (
          <>
            <header className="admin-panel">
              <h1>{data.student.fullname}</h1>
              <p>
                Học sinh #{data.student.id} · Đăng ký{' '}
                {new Date(data.student.createdAt).toLocaleDateString('vi-VN', {
                  timeZone: 'Asia/Ho_Chi_Minh',
                })}
              </p>
            </header>
            <section className="admin-panel">
              <h2>Thông tin tài khoản</h2>
              <dl className="admin-form-grid">
                {[
                  ['Email', data.student.email],
                  ['Điện thoại', data.student.phone],
                  ['Địa chỉ', data.student.address],
                  ['Lớp', data.student.class],
                  ['Giới tính', data.student.gender],
                  [
                    'Ngày sinh',
                    new Date(data.student.yob).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd style={{ margin: '8px 0' }}>{value ?? 'Chưa cung cấp'}</dd>
                  </div>
                ))}
              </dl>
              <p>Quản trị chưa xem được GPA, kỹ năng, sở thích và mức hoàn thiện hồ sơ.</p>
            </section>
            <section className="admin-panel">
              <h2>Kết quả Holland</h2>
              <p>
                {data.attempts.total} lần làm · Trang {data.attempts.page}/
                {Math.max(1, Math.ceil(data.attempts.total / data.attempts.limit))}
              </p>
              {data.attempts.items.length ? (
                <div className="admin-table-scroll" role="region" aria-label="Kết quả Holland" tabIndex={0}>
                  <table>
                    <thead>
                      <tr>
                        <th>Lần làm</th>
                        <th>Hoàn thành</th>
                        <th>TopCode</th>
                        <th>Số câu</th>
                        <th>Điểm từng nhóm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.attempts.items.map((attempt) => (
                        <tr key={attempt.id}>
                          <td>#{attempt.id}</td>
                          <td>
                            {new Date(attempt.finishAt).toLocaleString('vi-VN', {
                              timeZone: 'Asia/Ho_Chi_Minh',
                            })}
                          </td>
                          <td>{attempt.result.topCode}</td>
                          <td>{attempt.totalQuestions}</td>
                          <td>
                            <details>
                              <summary style={{ minHeight: 44, cursor: 'pointer' }}>Xem điểm gốc</summary>
                              <dl>
                                {(['R', 'I', 'A', 'S', 'E', 'C'] as const).map((code) => (
                                  <div key={code}>
                                    <dt>{code}</dt>
                                    <dd>{attempt.result[`score${code}`]}</dd>
                                  </div>
                                ))}
                              </dl>
                            </details>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>Chưa có bài trắc nghiệm hoàn thành.</p>
              )}
              <Pagination
                page={data.attempts.page}
                limit={data.attempts.limit}
                total={data.attempts.total}
                busy={query.isFetching}
                onPage={(page) => {
                  const next = new URLSearchParams(params);
                  next.set('page', String(page));
                  setParams(next);
                }}
              />
            </section>
            <section className="admin-panel">
              <h2>Gợi ý nghề và hội thoại</h2>
              <p>Quản trị chưa xem được gợi ý nghề, hội thoại và lộ trình.</p>
            </section>
            <section className="admin-panel">
              <h2>Hỗ trợ và báo cáo</h2>
              <p>Chưa hỗ trợ gửi yêu cầu, xuất PDF hoặc cấp quyền làm lại bài.</p>
            </section>
          </>
        )}
      </AdminDataState>
    </div>
  );
}
