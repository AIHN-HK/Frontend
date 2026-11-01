import { CareerAnalyticsPanel, CareerDashboardSummary } from '@/modules/career-platform';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { paths } from '@/routes/paths';
import { Icon } from '@/shared/ui/Icon';
import { Button } from '@/shared/ui/ce/Button';
import { ShinyText } from '@/shared/ui/ShinyText';
import advisorMascot from '@/assets/dashboard/aihn-advisor-mascot.svg';
import { useDashboardQueries } from '../queries/dashboard.queries';
import styles from './DashboardPage.module.css';

const tabs = ['Nghề phù hợp', 'Lộ trình', 'Khoảng cách kỹ năng'];

export function DashboardPage() {
  const { profile, history, latest } = useDashboardQueries();
  const [tab, setTab] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const resultPath = latest ? paths.assessmentResult(latest.attemptId) : paths.assessment;
  const historyError = (
    <div role="alert" className={[styles['dashboard-state']].join(' ')}>
      <p>Chưa tải được kết quả. Bạn thử lại nhé.</p>
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
        <p>Chưa có phần diễn giải kết quả.</p>
      )}
      <Link className={['btn', 'btn-secondary'].join(' ')} to={resultPath}>
        Xem kết quả
      </Link>
    </>
  ) : (
    <p>Làm trắc nghiệm để bắt đầu</p>
  );

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ noPreference: "(prefers-reduced-motion: no-preference)" }, () => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.5 } });
        tl.from(`.${styles['db-greeting']}`, { y: 12, autoAlpha: 0 })
          .from('[data-journey-banner]', { y: 16, autoAlpha: 0 }, "-=0.25")
          .from('[data-journey-metric]', { y: 12, autoAlpha: 0, stagger: 0.08 }, "-=0.2")
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
          <p>Bạn có thể bắt đầu từ điều mình đang tò mò.</p>
        </div>
      </section>
      <CareerDashboardSummary resultPath={resultPath} hasResult={Boolean(latest)} />
      <div className={[styles['db-main-grid']].join(' ')}>
        <div className={[styles['dashboard-main-col']].join(' ')}>
          <section className={[styles['dashboard-next']].join(' ')} aria-label="Bước tiếp theo">
            <div>
              <span className={[styles['dashboard-next-badge']].join(' ')}><ShinyText>Bạn có thể bắt đầu từ đây</ShinyText></span>
              <h2>
                {history.isPending
                  ? 'Đang kiểm tra kết quả của bạn'
                  : history.isError
                    ? 'Kiểm tra lại kết quả trắc nghiệm'
                    : latest
                      ? 'Đọc lại kết quả Holland'
                      : 'Bắt đầu từ sở thích của bạn'}
              </h2>
              <p>
                {latest
                  ? 'Đọc lại kết quả gần nhất để cân nhắc bước tiếp theo.'
                  : 'Một bài trắc nghiệm để nhìn lại những hoạt động bạn thích.'}
              </p>
            </div>
            {history.isSuccess && (
              <Link className={['btn', 'btn-primary'].join(' ')} to={resultPath}>
                {latest ? 'Xem kết quả gần nhất' : 'Làm trắc nghiệm'}
              </Link>
            )}
            {history.isError && <p>Tải lại kết quả ở phần bên dưới.</p>}
          </section>
          <section className={[styles['dashboard-snapshot']].join(' ')} aria-labelledby="snapshot-title">
            <div className={[styles['dashboard-snapshot-heading']].join(' ')}>
              <h2 id="snapshot-title">Những điều bạn đã biết về mình</h2>
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
                    <p>Chưa tải được hồ sơ. Bạn thử lại nhé.</p>
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
                    <p>{profile.data.fullname.trim() || 'Bạn chưa thêm tên'}</p>
                    <p>
                      {profile.data.class === null ? 'Bạn chưa thêm lớp' : `Lớp ${profile.data.class}`}
                    </p>
                    <p className={[styles['dashboard-source']].join(' ')}>Nguồn: hồ sơ tài khoản</p>
                  </>
                )}
                <Link className={['btn', 'btn-ghost'].join(' ')} to={paths.careerProfile}>
                  Xem hồ sơ
                </Link>
              </div>
            </div>
            <p className={[styles['dashboard-source']].join(' ')}>Chưa tìm được bài đang làm.</p>
          </section>
          <section className={[styles['dashboard-opportunities']].join(' ')} aria-labelledby="opportunities-title">
            <h2 id="opportunities-title">Nghề và những bước chuẩn bị</h2>
            <p>Thông tin sẽ rõ hơn khi bạn bổ sung hồ sơ và kết quả.</p>
            <div className={[styles['dashboard-tabs']].join(' ')} role="tablist" aria-label="Các phần thông tin của bạn">
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
                  ? 'Xem nghề được gợi ý và lý do từ Holland, hồ sơ của bạn.'
                  : tab === 1
                    ? 'Chọn mục tiêu và theo dõi từng việc cần làm.'
                    : 'Xem kỹ năng cần rèn thêm cho nghề bạn chọn.'}
              </p>
            </div>
          </section>
        </div>
        <div className={[styles['dashboard-side-col']].join(' ')}>
          <section className={[styles['dashboard-advisor']].join(' ')}>
            <div className={[styles['dashboard-advisor-heading']].join(' ')}>
              <img src={advisorMascot} width="68" height="68" alt="" />
              <div>
                <h2>Hỏi AIHN</h2>
                <p>Cùng gỡ điều còn phân vân</p>
              </div>
            </div>
            <span className={[styles['dashboard-context']].join(' ')}>Trao đổi với AIHN</span>
            <p className={[styles['dashboard-advisor-note']].join(' ')}>
              Đọc lại hội thoại cũ hoặc hỏi AIHN về điều còn phân vân.
            </p>
            <Link className={['btn', 'btn-secondary'].join(' ')} to={paths.advisor}>
              Hỏi AIHN
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
                    Xem kết quả
                  </Link>
                </div>
              </div>
            ) : (
              <p>Chưa có bài trắc nghiệm nào hoàn thành.</p>
            )}
          </section>
        </div>
      </div>
      <CareerAnalyticsPanel />
    </div>
  );
}
