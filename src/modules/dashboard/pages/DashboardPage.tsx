import { CareerAnalyticsPanel } from '@/modules/career-platform';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { paths } from '@/routes/paths';
import { Icon } from '@/shared/ui/Icon';
import { Button } from '@/shared/ui/ce/Button';
import advisorMascot from '@/assets/dashboard/aihn-advisor-mascot.svg';
import { useDashboardQueries } from '../queries/dashboard.queries';
import styles from './DashboardPage.module.css';

const tabs = ['Gợi ý nghề nghiệp', 'Lộ trình mục tiêu', 'Khoảng cách kỹ năng'];

export function DashboardPage() {
  const { profile, history, latest } = useDashboardQueries();
  const [tab, setTab] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const resultPath = latest ? paths.assessmentResult(latest.attemptId) : paths.assessment;
  const historyError = (
    <div role="alert" className={[styles['dashboard-state']].join(' ')}>
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
      <p className={[styles['dashboard-source']].join(' ')}>Hoàn thành: {latest.finishAt} · Nguồn: lịch sử trắc nghiệm</p>
      {latest.primaryAnalyze ? (
        <>
          <h3>{latest.primaryAnalyze.title}</h3>
          {latest.primaryAnalyze.description && <p>{latest.primaryAnalyze.description}</p>}
        </>
      ) : (
        <p>Phân tích kết quả chưa sẵn sàng.</p>
      )}
      <Link className={['btn', 'btn-secondary'].join(' ')} to={resultPath}>
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
        tl.from(`.${styles['db-greeting']}`, { y: 12, autoAlpha: 0 })
          .from(`.${styles['db-progress-banner']}`, { y: 16, autoAlpha: 0 }, "-=0.25")
          .from(`.${styles['db-card']}`, { y: 12, autoAlpha: 0, stagger: 0.08 }, "-=0.2")
          .from(`.${styles['dashboard-next']}`, { y: 14, autoAlpha: 0 }, "-=0.2");

        const scoreFill = containerRef.current?.querySelector("[data-ce-score-fill]");
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
    <div className={[styles['db-wrapper'], 'dashboard-page'].join(' ')} ref={containerRef}>
      <section className={[styles['db-greeting']].join(' ')} aria-label="Lời chào">
        <div>
          <div className={[styles['db-greeting-title']].join(' ')}>
            <h1>
              Xin chào
              {profile.isSuccess && profile.data.fullname.trim() ? `, ${profile.data.fullname}` : ', bạn'} 👋
            </h1>
            {profile.isSuccess && profile.data.class !== null && (
              <span className={[styles['dashboard-journey']].join(' ')}>Học sinh lớp {profile.data.class}</span>
            )}
          </div>
          <p>Khám phá ngành học và nghề nghiệp tương lai phù hợp với bạn.</p>
        </div>
      </section>
      <section className={[styles['db-progress-banner']].join(' ')} aria-label="Mục tiêu học tập">
        <p>Từng bước hiểu bản thân, khám phá nghề và xây dựng mục tiêu từ dữ liệu của bạn.</p>
        <Link className={['btn', 'btn-secondary'].join(' ')} to={paths.careerProfile}>Cập nhật hồ sơ</Link>
      </section>

      <div className={[styles['db-row']].join(' ')}>
        <section className={[styles['db-card']].join(' ')}>
          <div className={[styles['dashboard-quick-heading']].join(' ')}>
            <span className={[styles['dashboard-quick-icon'], styles['mint']].join(' ')}>
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
          <Link className={[styles['dashboard-pill']].join(' ')} to={resultPath}>
            {latest ? 'Mở kết quả Holland' : 'Mở trắc nghiệm'}
          </Link>
        </section>
        <section className={[styles['db-card']].join(' ')}>
          <div className={[styles['dashboard-quick-heading']].join(' ')}>
            <span className={[styles['dashboard-quick-icon'], styles['purple']].join(' ')}>
              <Icon name="check" />
            </span>
            <div>
              <h2>Nghề nghiệp gợi ý</h2>
              <p>Mở các bản gợi ý đã lưu</p>
            </div>
          </div>
          <Link className={[styles['dashboard-pill']].join(' ')} to={paths.recommendations}>
            Xem trạng thái gợi ý
          </Link>
        </section>
        <section className={[styles['db-card']].join(' ')}>
          <div className={[styles['dashboard-quick-heading']].join(' ')}>
            <span className={[styles['dashboard-quick-icon'], styles['amber']].join(' ')}>
              <Icon name="roadmap" />
            </span>
            <div>
              <h2>Lộ trình phát triển</h2>
              <p>Theo dõi các mục tiêu đã lưu</p>
            </div>
          </div>
          <Link className={[styles['dashboard-pill']].join(' ')} to={paths.roadmap}>
            Xem trạng thái lộ trình
          </Link>
        </section>
        <section className={[styles['db-card']].join(' ')}>
          <div className={[styles['dashboard-quick-heading']].join(' ')}>
            <span className={[styles['dashboard-quick-icon'], styles['rose']].join(' ')}>
              <Icon name="chat" />
            </span>
            <div>
              <h2>Cố vấn AI</h2>
              <p>Mở hội thoại tại trang Cố vấn</p>
            </div>
          </div>
          <Link className={[styles['dashboard-pill']].join(' ')} to={paths.advisor}>
            Đi tới Cố vấn
          </Link>
        </section>
      </div>
      <div className={[styles['db-main-grid']].join(' ')}>
        <div className={[styles['dashboard-main-col']].join(' ')}>
          <section className={[styles['dashboard-next']].join(' ')} aria-label="Hành động tiếp theo">
            <div>
              <span className={[styles['dashboard-next-badge']].join(' ')}>Hành động trọng tâm tiếp theo</span>
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
              <Link className={['btn', 'btn-primary'].join(' ')} to={resultPath}>
                {latest ? 'Xem kết quả gần nhất' : 'Bắt đầu / tiếp tục trắc nghiệm'}
              </Link>
            )}
            {history.isError && <p>Thử tải lại kết quả trong phần thông tin bên dưới.</p>}
          </section>
          <section className={[styles['dashboard-snapshot']].join(' ')} aria-labelledby="snapshot-title">
            <div className={[styles['dashboard-snapshot-heading']].join(' ')}>
              <h2 id="snapshot-title">AIHN đang hiểu bạn như thế nào?</h2>
              {latest?.primaryAnalyze && (
                <span className={[styles['dashboard-code']].join(' ')}>Mã phân tích: {latest.primaryAnalyze.code}</span>
              )}
            </div>
            <div className={[styles['dashboard-snapshot-grid']].join(' ')}>
              <div className={[styles['dashboard-result'], 'dashboard-result'].join(' ')}>{resultState}</div>
              <div className={[styles['dashboard-profile']].join(' ')}>
                <h3>Hồ sơ của bạn</h3>
                {profile.isPending ? (
                  <p role="status">Đang tải hồ sơ…</p>
                ) : profile.isError ? (
                  <div role="alert" className={[styles['dashboard-state']].join(' ')}>
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
                    <p className={[styles['dashboard-source']].join(' ')}>Nguồn: hồ sơ tài khoản</p>
                  </>
                )}
                <Link className={['btn', 'btn-ghost'].join(' ')} to={paths.careerProfile}>
                  Xem hồ sơ
                </Link>
              </div>
            </div>
            <p className={[styles['dashboard-source']].join(' ')}>Chưa thể xác định bài đang làm từ dữ liệu hiện có.</p>
          </section>
          <section className={[styles['dashboard-opportunities']].join(' ')} aria-labelledby="opportunities-title">
            <h2 id="opportunities-title">Không gian Định hướng &amp; Cơ hội Nghề nghiệp</h2>
            <p>Các thông tin cá nhân hóa sẽ xuất hiện khi có dữ liệu.</p>
            <div className={[styles['dashboard-tabs']].join(' ')} role="tablist" aria-label="Tab phân tích Dashboard">
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
              className={[styles['dashboard-panel']].join(' ')}
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
        <div className={[styles['dashboard-side-col']].join(' ')}>
          <section className={[styles['dashboard-advisor']].join(' ')}>
            <div className={[styles['dashboard-advisor-heading']].join(' ')}>
              <img src={advisorMascot} width="68" height="68" alt="" />
              <div>
                <h2>Cố vấn AIHN</h2>
                <p>Cùng bạn tìm hướng đi</p>
              </div>
            </div>
            <span className={[styles['dashboard-context']].join(' ')}>Tư vấn tại trang Cố vấn</span>
            <p className={[styles['dashboard-advisor-note']].join(' ')}>
              Đọc lại các phiên đã lưu hoặc bắt đầu hội thoại mới tại trang Cố vấn AIHN.
            </p>
            <Link className={['btn', 'btn-secondary'].join(' ')} to={paths.advisor}>
              Mở trang Cố vấn
            </Link>
          </section>
          <section className={[styles['dashboard-activity']].join(' ')}>
            <h2>Hoạt động gần đây</h2>
            <p className={[styles['dashboard-source']].join(' ')}>Nguồn: lịch sử trắc nghiệm</p>
            {history.isPending ? (
              <p>Đang tải hoạt động…</p>
            ) : history.isError ? (
              <p>Chưa tải được hoạt động trắc nghiệm.</p>
            ) : latest ? (
              <div className={[styles['dashboard-activity-item']].join(' ')}>
                <Icon name="check" />
                <div>
                  <p>Hoàn thành trắc nghiệm Holland</p>
                  <p className={[styles['dashboard-source']].join(' ')}>{latest.finishAt}</p>
                  <Link className={['btn', 'btn-ghost'].join(' ')} to={resultPath}>
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
      <CareerAnalyticsPanel />
    </div>
  );
}
