import { useEffect, useRef } from 'react';
import gsap from 'gsap';
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
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ noPreference: "(prefers-reduced-motion: no-preference)" }, () => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.5 } });
        tl.from(".career-profile-header", { y: 12, autoAlpha: 0 })
          .from(".career-profile-card", { y: 18, autoAlpha: 0, stagger: 0.1 }, "-=0.2")
          .from(".career-profile-advice", { y: 14, autoAlpha: 0 }, "-=0.15");
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return <div className="career-profile-page" ref={containerRef}>
    <section className="career-profile-header"><div><span className="career-profile-header-pill" style={{ background: "#F0FDFA", color: "#0D9488", border: "1px solid #99F6E4", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>HỒ SƠ CÁ NHÂN</span></span><h1 style={{ marginTop: "8px" }}>Hồ sơ Năng lực &amp; Mục tiêu Cá nhân</h1><p>Thông tin bạn cung cấp giúp bổ sung ngữ cảnh cho quá trình tư vấn hướng nghiệp.</p></div><div className="career-profile-milestone"><img src={milestone} alt="" width="48" height="48" /><div><small>Hồ sơ cá nhân</small><strong>Lưu chủ động</strong></div></div></section>
    <Link className="career-profile-back" to={paths.dashboard}>← Về Trang của tôi</Link>
    {current.user && <AvatarEditor key={`avatar:${current.user.id}:${current.revision}`} scope={{ ownerId: current.user.id, revision: current.revision }} />}
    {query.data && current.user ? <ProfileEditor key={`${current.user.id}:${current.revision}`} profile={query.data} query={query} scope={{ ownerId: current.user.id, revision: current.revision }} /> : query.isError ? <AsyncState state="error" title="Không tải được hồ sơ." description="Vui lòng thử lại trước khi chỉnh sửa." action={<Button variant="secondary" onClick={() => { void query.refetch(); }}>Thử lại hồ sơ</Button>} /> : <AsyncState state="loading" title="Đang tải hồ sơ…" />}
    <section className="career-profile-card"><header className="career-profile-card-header"><h2>2. Kỹ năng cá nhân</h2><span>Chưa sẵn sàng</span></header><div className="career-profile-card-body"><p>Kỹ năng đã có và mục tiêu rèn luyện chưa sẵn sàng để cập nhật.</p></div></section>
    <section className="career-profile-card"><header className="career-profile-card-header"><h2>3. Sở thích công việc &amp; Mục tiêu tương lai</h2><span>Chưa sẵn sàng</span></header><div className="career-profile-card-body"><p>Sở thích công việc và mục tiêu nghề nghiệp chưa sẵn sàng để cập nhật.</p></div></section>
    <aside className="career-profile-advice"><img src={advisor} alt="" width="58" height="58" /><div><h2>Dữ liệu này giúp ích gì cho bạn?</h2><p>Thông tin cá nhân giúp bạn giữ hồ sơ rõ ràng, nhất quán khi sử dụng AIHN. Các phần định hướng mở rộng sẽ được bổ sung khi sẵn sàng.</p></div></aside>
  </div>;
}
