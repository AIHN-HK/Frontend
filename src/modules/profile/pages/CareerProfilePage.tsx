import { Link } from 'react-router';
import milestone from '@/assets/profile/profile-milestone.svg';
import advisor from '@/assets/dashboard/aihn-advisor-mascot.svg';
import { paths } from '@/routes/paths';
import { useSession } from '@/shared/session/session';
import { AsyncState } from '@/shared/ui/AsyncState';
import { Button } from '@/shared/ui/Button';
import { useProfileQuery } from '../queries/profile.queries';
import { ProfileEditor } from '../components/ProfileEditor';
import { AvatarEditor } from '../components/AvatarEditor';
import './profile.css';

export function CareerProfilePage(): React.JSX.Element {
  const query = useProfileQuery(), current = useSession();
  return <div className="career-profile-page">
    <section className="career-profile-header"><div><span className="career-profile-header-pill">Thấu hiểu bản thân</span><h1>Hồ sơ của bạn</h1><p>Cập nhật thông tin cá nhân để AIHN hiểu bạn rõ hơn trên hành trình định hướng tương lai.</p></div><div className="career-profile-milestone"><img src={milestone} alt="" width="48" height="48" /><div><small>Hồ sơ cá nhân</small><strong>Lưu chủ động</strong></div></div></section>
    <Link className="career-profile-back" to={paths.dashboard}>← Về Trang của tôi</Link>
    {current.user && <AvatarEditor key={`avatar:${current.user.id}:${current.revision}`} scope={{ ownerId: current.user.id, revision: current.revision }} />}
    {query.data && current.user ? <ProfileEditor key={`${current.user.id}:${current.revision}`} profile={query.data} query={query} scope={{ ownerId: current.user.id, revision: current.revision }} /> : query.isError ? <AsyncState state="error" title="Không tải được hồ sơ." description="Vui lòng thử lại trước khi chỉnh sửa." action={<Button variant="secondary" onClick={() => { void query.refetch(); }}>Thử lại hồ sơ</Button>} /> : <AsyncState state="loading" title="Đang tải hồ sơ…" />}
    <section className="career-profile-card"><header className="career-profile-card-header"><h2>2. Kỹ năng cá nhân</h2><span>Chưa sẵn sàng</span></header><div className="career-profile-card-body"><p>Kỹ năng đã có và mục tiêu rèn luyện chưa sẵn sàng để cập nhật.</p></div></section>
    <section className="career-profile-card"><header className="career-profile-card-header"><h2>3. Sở thích công việc &amp; Mục tiêu tương lai</h2><span>Chưa sẵn sàng</span></header><div className="career-profile-card-body"><p>Sở thích công việc và mục tiêu nghề nghiệp chưa sẵn sàng để cập nhật.</p></div></section>
    <aside className="career-profile-advice"><img src={advisor} alt="" width="58" height="58" /><div><h2>Dữ liệu này giúp ích gì cho bạn?</h2><p>Thông tin cá nhân giúp bạn giữ hồ sơ rõ ràng, nhất quán khi sử dụng AIHN. Các phần định hướng mở rộng sẽ được bổ sung khi sẵn sàng.</p></div></aside>
  </div>;
}
