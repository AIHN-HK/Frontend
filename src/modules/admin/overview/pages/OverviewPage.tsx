import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import { useAdminQuery } from '../../api/admin.api';
import { overviewSchema } from '../../model/contracts';
import { AdminDataState } from '../../components/AdminDataState';
import '../../components/admin-pages.css';
export function OverviewPage(){
 const query=useAdminQuery(['overview'],'/api/v1/admin/overview',overviewSchema),labels={students:'Học sinh',completedTests:'Trắc nghiệm hoàn thành',chatSessions:'Phiên tư vấn',questions:'Câu hỏi'};
 return <div className="admin-page"><header className="admin-page-heading"><div><h1>Tổng quan hệ thống</h1><p>Số liệu hiện có từ hệ thống hướng nghiệp.</p></div><button className="btn btn-secondary" disabled={query.isFetching} onClick={()=>void query.refetch()}>Làm mới dữ liệu</button></header><AdminDataState query={query}>{data=><><div className="admin-metrics">{Object.entries(labels).map(([key,label])=><section className="admin-panel" key={key}><h2>{label}</h2><strong data-testid={`count-${key}`}>{data.counts[key as keyof typeof labels]}</strong></section>)}</div><section className="admin-panel"><h2>Lần làm gần đây</h2>{data.recentAttempts.length?<div className="admin-table-scroll" role="region" aria-label="Lần làm gần đây" tabIndex={0}><table><thead><tr><th>Học sinh</th><th>Hoàn thành</th><th>Holland</th></tr></thead><tbody>{data.recentAttempts.map(item=><tr key={item.id}><td><Link to={paths.adminStudent(item.user.id)}>{item.user.fullname}</Link></td><td>{new Date(item.finishAt).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})}</td><td>{item.result.topCode}</td></tr>)}</tbody></table></div>:<p>Chưa có lần làm hoàn thành.</p>}</section><section className="admin-panel"><h2>Thống kê mở rộng</h2><p>Chưa có dữ liệu tăng trưởng, phân bố nhóm, xếp hạng hay nhật ký hoạt động.</p></section></>}</AdminDataState></div>;
}
