import { CareerAnalyticsPanel } from '@/modules/career-platform';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { paths } from '@/routes/paths';
import { Icon } from '@/shared/ui/Icon';
import { Button } from '@/shared/ui/Button';
import advisorMascot from '@/assets/dashboard/aihn-advisor-mascot.svg';
import { useDashboardQueries } from '../queries/dashboard.queries';
import './dashboard.css';

const tabs = ['Gợi ý nghề nghiệp', 'Lộ trình mục tiêu', 'Khoảng cách kỹ năng'];

export function DashboardPage() {
  const { profile, history, latest } = useDashboardQueries();
  const [tab, setTab] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const resultPath = latest ? paths.assessmentResult(latest.attemptId) : paths.assessment;
  const historyError = (
    <div role="alert" className="dashboard-state">
      <p>Không tải được kết quả. Vui lòng thử lại.</p>
      <Button
        variant="secondary"
        disabled={history.isFetching}
        onClick={() => {
          void history.refetch();
        }}
      >
        Thử lại kết quả
      </Button>
    </div>
  );
  const resultState = history.isPending ? (
    <p role="status">Đang tải kết quả…</p>
  ) : history.isError ? (
    historyError
  ) : latest ? (
    <>
      <p className="dashboard-source">Hoàn thành: {latest.finishAt} · Nguồn: lịch sử trắc nghiệm</p>
      {latest.primaryAnalyze ? (
        <>
          <h3>{latest.primaryAnalyze.title}</h3>
          {latest.primaryAnalyze.description && <p>{latest.primaryAnalyze.description}</p>}
        </>
      ) : (
        <p>Phân tích kết quả chưa sẵn sàng.</p>
      )}
      <Link className="btn btn-secondary" to={resultPath}>
        Xem chi tiết Holland
      </Link>
    </>
  ) : (
    <p>Chưa có kết quả hoàn thành</p>
  );

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ noPreference: "(prefers-reduced-motion: no-preference)" }, () => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.5 } });
        tl.from(".dashboard-greeting", { y: 12, autoAlpha: 0 })
          .from(".exam-tracker-card", { y: 16, autoAlpha: 0 }, "-=0.25")
          .from(".dashboard-quick", { y: 12, autoAlpha: 0, stagger: 0.08 }, "-=0.2")
          .from(".dashboard-next", { y: 14, autoAlpha: 0 }, "-=0.2")
          .from(".dashboard-card", { y: 16, autoAlpha: 0, stagger: 0.1 }, "-=0.2");

        const scoreFill = document.querySelector(".score-bar-fill");
        if (scoreFill) {
          gsap.from(scoreFill, {
            width: "0%",
            duration: 1.2,
            ease: "power3.out",
            delay: 0.4
          });
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="dashboard-page" ref={containerRef}>
      <section className="dashboard-greeting" aria-label="Lời chào">
        <div>
          <div className="dashboard-greeting-title">
            <h1>
              Xin chào
              {profile.isSuccess && profile.data.fullname.trim() ? `, ${profile.data.fullname}` : ', bạn'} 👋
            </h1>
            {profile.isSuccess && profile.data.class !== null && (
              <span className="dashboard-journey">Học sinh lớp {profile.data.class}</span>
            )}
          </div>
          <p>Khám phá ngành học và nghề nghiệp tương lai phù hợp với bạn.</p>
        </div>
      </section>
      <section className="exam-tracker-card" aria-label="Mục tiêu học tập">
        <p>Bạn chưa thiết lập mục tiêu học tập. Cập nhật hồ sơ và khám phá nghề trước khi chọn lộ trình.</p>
        <Link className="btn btn-secondary" to={paths.careerProfile}>Cập nhật hồ sơ</Link>
      </section>

      <CareerAnalyticsPanel />
      <div className="dashboard-quick-strip">
        <section className="dashboard-quick">
          <div className="dashboard-quick-heading">
            <span className="dashboard-quick-icon mint">
              <Icon name="compass" />
            </span>
            <div>
              <h2>Trắc nghiệm Holland</h2>
              <p>
                {history.isPending
                  ? 'Đang tải kết quả…'
                  : history.isError
                    ? 'Chưa tải được kết quả'
                    : latest
                      ? `Hoàn thành: ${latest.finishAt}`
                      : 'Chưa có kết quả hoàn thành'}
              </p>
            </div>
          </div>
          <Link className="dashboard-pill" to={resultPath}>
            {latest ? 'Mở kết quả Holland' : 'Mở trắc nghiệm'}
          </Link>
        </section>
        <section className="dashboard-quick">
          <div className="dashboard-quick-heading">
            <span className="dashboard-quick-icon purple">
              <Icon name="check" />
            </span>
            <div>
              <h2>Nghề nghiệp gợi ý</h2>
              <p>Mở các bản gợi ý đã lưu</p>
            </div>
          </div>
          <Link className="dashboard-pill" to={paths.recommendations}>
            Xem trạng thái gợi ý
          </Link>
        </section>
        <section className="dashboard-quick">
          <div className="dashboard-quick-heading">
            <span className="dashboard-quick-icon amber">
              <Icon name="roadmap" />
            </span>
            <div>
              <h2>Lộ trình phát triển</h2>
              <p>Theo dõi các mục tiêu đã lưu</p>
            </div>
          </div>
          <Link className="dashboard-pill" to={paths.roadmap}>
            Xem trạng thái lộ trình
          </Link>
        </section>
        <section className="dashboard-quick">
          <div className="dashboard-quick-heading">
            <span className="dashboard-quick-icon rose">
              <Icon name="chat" />
            </span>
            <div>
              <h2>Cố vấn AI</h2>
              <p>Mở hội thoại tại trang Cố vấn</p>
            </div>
          </div>
          <Link className="dashboard-pill" to={paths.advisor}>
            Đi tới Cố vấn
          </Link>
        </section>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-main-col">
          <section className="dashboard-next" aria-label="Hành động tiếp theo">
            <div>
              <span className="dashboard-next-badge">Hành động trọng tâm tiếp theo</span>
              <h2>
                {history.isPending
                  ? 'Đang kiểm tra kết quả của bạn'
                  : history.isError
                    ? 'Kiểm tra lại kết quả trắc nghiệm'
                    : latest
                      ? 'Tìm hiểu kết quả Holland của bạn'
                      : 'Khám phá bản thân với Holland'}
              </h2>
              <p>
                {latest
                  ? 'Xem phân tích từ lần trắc nghiệm gần nhất trước khi lựa chọn bước tiếp theo.'
                  : 'Trắc nghiệm giúp bạn có thêm thông tin về sở thích nghề nghiệp của mình.'}
              </p>
            </div>
            {history.isSuccess && (
              <Link className="btn btn-primary" to={resultPath}>
                {latest ? 'Xem kết quả gần nhất' : 'Bắt đầu / tiếp tục trắc nghiệm'}
              </Link>
            )}
            {history.isError && <p>Thử tải lại kết quả trong phần thông tin bên dưới.</p>}
          </section>
          <section className="dashboard-snapshot" aria-labelledby="snapshot-title">
            <div className="dashboard-snapshot-heading">
              <h2 id="snapshot-title">AIHN đang hiểu bạn như thế nào?</h2>
              {latest?.primaryAnalyze && (
                <span className="dashboard-code">Mã phân tích: {latest.primaryAnalyze.code}</span>
              )}
            </div>
            <div className="dashboard-snapshot-grid">
              <div className="dashboard-result">{resultState}</div>
              <div className="dashboard-profile">
                <h3>Hồ sơ của bạn</h3>
                {profile.isPending ? (
                  <p role="status">Đang tải hồ sơ…</p>
                ) : profile.isError ? (
                  <div role="alert" className="dashboard-state">
                    <p>Không tải được hồ sơ. Vui lòng thử lại.</p>
                    <Button
                      variant="secondary"
                      disabled={profile.isFetching}
                      onClick={() => {
                        void profile.refetch();
                      }}
                    >
                      Thử lại hồ sơ
                    </Button>
                  </div>
                ) : (
                  <>
                    <p>{profile.data.fullname.trim() || 'Chưa có tên trong hồ sơ'}</p>
                    <p>
                      {profile.data.class === null ? 'Chưa có thông tin lớp' : `Lớp ${profile.data.class}`}
                    </p>
                    <p className="dashboard-source">Nguồn: hồ sơ tài khoản</p>
                  </>
                )}
                <Link className="btn btn-ghost" to={paths.careerProfile}>
                  Xem hồ sơ
                </Link>
              </div>
            </div>
            <p className="dashboard-source">Chưa thể xác định bài đang làm từ dữ liệu hiện có.</p>
          </section>
          <section className="dashboard-opportunities" aria-labelledby="opportunities-title">
            <h2 id="opportunities-title">Không gian Định hướng &amp; Cơ hội Nghề nghiệp</h2>
            <p>Các thông tin cá nhân hóa sẽ xuất hiện khi có dữ liệu.</p>
            <div className="dashboard-tabs" role="tablist" aria-label="Tab phân tích Dashboard">
              {tabs.map((label, index) => (
                <button
                  key={label}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  id={`dashboard-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={tab === index}
                  aria-controls={`dashboard-panel-${index}`}
                  tabIndex={tab === index ? 0 : -1}
                  onClick={() => setTab(index)}
                  onKeyDown={(event) => {
                    const next =
                      event.key === 'ArrowRight'
                        ? (index + 1) % tabs.length
                        : event.key === 'ArrowLeft'
                          ? (index + tabs.length - 1) % tabs.length
                          : event.key === 'Home'
                            ? 0
                            : event.key === 'End'
                              ? tabs.length - 1
                              : undefined;
                    if (next !== undefined) {
                      event.preventDefault();
                      setTab(next);
                      tabRefs.current[next]?.focus();
                    }
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div
              className="dashboard-panel"
              id={`dashboard-panel-${tab}`}
              role="tabpanel"
              aria-labelledby={`dashboard-tab-${tab}`}
              tabIndex={0}
            >
              <Icon name={tab === 0 ? 'check' : tab === 1 ? 'roadmap' : 'user'} />
              <h3>{tabs[tab]}</h3>
              <p>
                {tab === 0
                  ? 'Xem bản gợi ý có giải thích từ kết quả Holland và hồ sơ.'
                  : tab === 1
                    ? 'Mở lộ trình để chọn mục tiêu và theo dõi nhiệm vụ.'
                    : 'Mở lộ trình để xem khoảng cách kỹ năng của nghề mục tiêu.'}
              </p>
            </div>
          </section>
        </div>
        <div className="dashboard-side-col">
          <section className="dashboard-advisor">
            <div className="dashboard-advisor-heading">
              <img src={advisorMascot} width="68" height="68" alt="" />
              <div>
                <h2>Cố vấn AIHN</h2>
                <p>Cùng bạn tìm hướng đi</p>
              </div>
            </div>
            <span className="dashboard-context">Tư vấn tại trang Cố vấn</span>
            <p className="dashboard-advisor-note">
              Đọc lại các phiên đã lưu hoặc bắt đầu hội thoại mới tại trang Cố vấn AIHN.
            </p>
            <Link className="btn btn-secondary" to={paths.advisor}>
              Mở trang Cố vấn
            </Link>
          </section>
          <section className="dashboard-activity">
            <h2>Hoạt động gần đây</h2>
            <p className="dashboard-source">Nguồn: lịch sử trắc nghiệm</p>
            {history.isPending ? (
              <p>Đang tải hoạt động…</p>
            ) : history.isError ? (
              <p>Chưa tải được hoạt động trắc nghiệm.</p>
            ) : latest ? (
              <div className="dashboard-activity-item">
                <Icon name="check" />
                <div>
                  <p>Hoàn thành trắc nghiệm Holland</p>
                  <p className="dashboard-source">{latest.finishAt}</p>
                  <Link className="btn btn-ghost" to={resultPath}>
                    Mở kết quả hoạt động
                  </Link>
                </div>
              </div>
            ) : (
              <p>Chưa có hoạt động trắc nghiệm hoàn thành.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
