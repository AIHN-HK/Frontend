import { CareerProfilePanel } from '@/modules/career-platform';
import { Link } from 'react-router';
import { Button } from 'antd';
import { paths } from '@/routes/paths';
import { useSession } from '@/shared/session/session';
import { AsyncState } from '@/shared/ui/AsyncState';
import { usePageEntrance } from '@/shared/ui/ce/usePageEntrance';
import { useProfileQuery } from '../queries/profile.queries';
import { ProfileEditor } from '../components/ProfileEditor';
import { AvatarEditor } from '../components/AvatarEditor';
import './profile.css';
import styles from './CareerProfilePage.module.css';

export function CareerProfilePage(): React.JSX.Element {
  const query = useProfileQuery(), current = useSession();
  const root = usePageEntrance(query.data ? `${current.user?.id}:${current.revision}` : undefined);
  return <div className={`${styles.page} career-profile-page`} ref={root}>
    <header className={styles.header} data-ce-enter=""><p className={styles.tag}>Hồ sơ cá nhân</p><h1>Hồ sơ Năng lực &amp; Mục tiêu Cá nhân</h1><p>{query.data?.fullname || 'Thông tin của bạn'} · Lưu chủ động để bổ sung ngữ cảnh hướng nghiệp.</p></header>
    <Link className="career-profile-back" to={paths.dashboard}>← Về Trang của tôi</Link>
    {current.user && <AvatarEditor key={`avatar:${current.user.id}:${current.revision}`} scope={{ ownerId: current.user.id, revision: current.revision }} />}
    {query.data && current.user ? <div data-ce-enter=""><ProfileEditor key={`${current.user.id}:${current.revision}`} profile={query.data} query={query} scope={{ ownerId: current.user.id, revision: current.revision }} /></div> : query.isError ? <AsyncState state="error" title="Không tải được hồ sơ." description="Vui lòng thử lại trước khi chỉnh sửa." action={<Button onClick={() => { void query.refetch(); }}>Thử lại hồ sơ</Button>} /> : <AsyncState state="loading" title="Đang tải hồ sơ…" />}
    <CareerProfilePanel />
    <aside className={styles.advice}><h2>Dữ liệu này giúp ích gì cho bạn?</h2><p>Kỹ năng, sở thích và nghề mục tiêu bổ sung ngữ cảnh cho gợi ý và tư vấn. Tự đánh giá là thông tin do bạn cung cấp, chưa phải chứng nhận năng lực.</p></aside>
  </div>;
}
