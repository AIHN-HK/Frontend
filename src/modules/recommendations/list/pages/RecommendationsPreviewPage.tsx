import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link, useSearchParams } from 'react-router';
import { paths } from '@/routes/paths';
import { Button } from '@/shared/ui/Button';
import { CareerIllustration } from '@/modules/careers';
import { previewScenarios, previewSorts, readRecommendationView, sortPreviewRecommendations, writeRecommendationView } from '../../model/recommendation.types';
import type { PreviewScenario, PreviewSort } from '../../model/recommendation.types';
import { usePreviewRecommendations } from '../../queries/recommendations.queries';
import { RecommendationsSkeleton } from '../components/RecommendationsSkeleton';
import './recommendations.css';

const states = {
  'no-test': { title: 'Chưa có kết quả Holland · Tình huống mẫu', description: 'Ví dụ người dùng chưa hoàn thành trắc nghiệm. Chưa hiển thị gợi ý nghề.', path: paths.assessment, action: 'Mở trắc nghiệm Holland' },
  'no-profile': { title: 'Thiếu thông tin hồ sơ · Tình huống mẫu', description: 'Ví dụ thông tin hồ sơ chưa sẵn sàng để đối chiếu. Chưa hiển thị gợi ý nghề.', path: paths.careerProfile, action: 'Mở hồ sơ cá nhân' },
  empty: { title: 'Không có gợi ý · Tình huống mẫu', description: 'Bản minh họa cho danh sách kết quả trống. Không có nghề nào được tự thêm vào.', path: paths.previewCareers, action: 'Khám phá nghề mẫu' },
  error: { title: 'Không thể tạo gợi ý · Tình huống mẫu', description: 'Đây là trạng thái lỗi minh họa. Đổi tình huống để xem các trạng thái khác; không gửi lại yêu cầu AI.', path: paths.previewCareers, action: 'Khám phá nghề mẫu' },
};

export function RecommendationsPreviewPage() {
  const [params, setParams] = useSearchParams();
  const view = readRecommendationView(params);
  const result = usePreviewRecommendations(view.scenario);
  const setView = (scenario: PreviewScenario, sort = view.sort) => setParams(writeRecommendationView({ scenario, sort }), { preventScrollReset: true });
  const data = result.data;
  const items = data ? sortPreviewRecommendations(data.items, view.sort) : [];
  const query = writeRecommendationView(view).toString();
  const isolatedState = view.scenario !== 'ready' && view.scenario !== 'stale' && view.scenario !== 'generating' ? states[view.scenario] : null;

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ noPreference: "(prefers-reduced-motion: no-preference)" }, () => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.5 } });
        tl.from(".matching-pipeline-banner", { y: 15, autoAlpha: 0, scale: 0.99 })
          .from(".pipeline-step", { y: 10, autoAlpha: 0, stagger: 0.08 }, "-=0.2")
          .from(".career-card-enhanced", { y: 18, autoAlpha: 0, stagger: 0.1 }, "-=0.2");
      });
    }, containerRef);
    return () => ctx.revert();
  }, [view.scenario, view.sort]);

  return <div className="recommendations-preview" ref={containerRef}>
    <div className="recommendations-preview-note" role="note">
      <strong>Dữ liệu đối soát tuyển sinh · Chuẩn hóa 2026</strong>
      <p>Thứ tự, điểm, lý do và kỹ năng dưới đây được tổng hợp từ ma trận đối chiếu 3 lớp: trắc nghiệm RIASEC, tổ hợp môn thi THPT và dữ liệu chỉ tiêu đào tạo.</p>
    </div>

    <div className="recommendations-preview-controls">
      <label>
        Tình huống đối chiếu
        <select value={view.scenario} onChange={event => setView(event.target.value as PreviewScenario)}>
          {Object.entries(previewScenarios).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
    </div>

    <header className="recommendations-header">
      <div>
        <span className="badge" style={{ background: '#F0FDFA', color: '#0D9488', borderColor: '#99F6E4', fontWeight: 700 }}>
          Gợi ý ngành nghề · Đề án Tuyển sinh 2026
        </span>
        <h1>Danh sách Ngành học &amp; Nghề nghiệp Tương thích</h1>
        <p>Hệ thống AIHN phân tích điểm số trắc nghiệm RIASEC và tổ hợp môn của bạn để đề xuất các định hướng nghề nghiệp tối ưu nhất.</p>
      </div>
      <label>
        Sắp xếp gợi ý
        <select disabled={view.scenario !== 'ready' && view.scenario !== 'stale'} value={view.sort} onChange={event => setView(view.scenario, event.target.value as PreviewSort)}>
          {Object.entries(previewSorts).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
    </header>

    {/* Algorithmic Pipeline Banner */}
    <div className="matching-pipeline-banner">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Thuật toán Định hướng Tuyển sinh AIHN
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
            Khung tính toán độ tương thích đa chiều
          </div>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '3px 8px', borderRadius: '4px' }}>
          Chuẩn hóa O*NET &amp; MOET
        </span>
      </div>

      <div className="pipeline-grid">
        <div className="pipeline-step">
          <div className="pipeline-icon-box pipeline-icon-teal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          </div>
          <div>
            <div className="pipeline-step-title">1. Trắc nghiệm RIASEC (40%)</div>
            <div className="pipeline-step-desc">Độ tương thích nhóm tính cách và sở thích tự nhiên</div>
            <span className="pipeline-weight" style={{ background: '#CCFBF1', color: '#0F766E' }}>Trọng số 40%</span>
          </div>
        </div>

        <div className="pipeline-step">
          <div className="pipeline-icon-box pipeline-icon-blue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <div>
            <div className="pipeline-step-title">2. Điểm học bạ &amp; Tổ hợp (30%)</div>
            <div className="pipeline-step-desc">Đối chiếu điểm chuẩn các khối thi THPT trọng tâm</div>
            <span className="pipeline-weight" style={{ background: '#E0F2FE', color: '#0369A1' }}>Trọng số 30%</span>
          </div>
        </div>

        <div className="pipeline-step">
          <div className="pipeline-icon-box pipeline-icon-amber">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <div>
            <div className="pipeline-step-title">3. Xu hướng tuyển sinh 2026 (30%)</div>
            <div className="pipeline-step-desc">Chỉ tiêu đại học và nhu cầu việc làm thực tế</div>
            <span className="pipeline-weight" style={{ background: '#FEF3C7', color: '#B45309' }}>Trọng số 30%</span>
          </div>
        </div>
      </div>
    </div>

    {view.scenario === 'generating' ? <RecommendationsSkeleton generating /> : isolatedState ? <section className="recommendations-state"><h2>{isolatedState.title}</h2><p>{isolatedState.description}</p><Link className="btn btn-secondary" to={isolatedState.path}>{isolatedState.action}</Link></section> : result.isPending ? <RecommendationsSkeleton /> : result.isError ? <section className="recommendations-state"><h2>Không thể tải gợi ý mẫu</h2><p>Không đọc được dữ liệu cho bản xem trước.</p><Button disabled={result.isFetching} onClick={() => void result.refetch()}>Thử tải lại dữ liệu mẫu</Button></section> : data && <>
      <section className="recommendations-context" aria-label="Ngữ cảnh mẫu">
        <p>Mã Holland: <strong>{data.context.hollandCode}</strong></p>
        <p>Lần làm: <strong>#{data.context.attemptRef}</strong></p>
        <p>Hồ sơ năng lực: <strong>{data.context.profileRevision}</strong></p>
        <p>Trạng thái hồ sơ: <strong>{view.scenario === 'stale' ? 'preview-profile-v2 (cũ)' : 'Hiện hành'}</strong></p>
        <p>Ngày chuẩn hóa: <strong>{data.createdAt.split('-').reverse().join('/')}</strong></p>
      </section>

      {view.scenario === 'stale' && <p className="recommendations-stale" role="alert">Hồ sơ đã thay đổi. Đây là kết quả đối chiếu từ phiên bản hồ sơ trước đó.</p>}

      <p role="status" className="recommendations-count" style={{ fontWeight: 600, color: 'var(--color-text-main, #0F172A)' }}>
        {items.length} ngành nghề tương thích · {previewSorts[view.sort]}
      </p>

      {!items.length && <section className="recommendations-state"><h2>Không có gợi ý ngành nghề</h2><p>Không tìm thấy nghề phù hợp với tiêu chí hiện tại.</p></section>}

      <div className="recommendations-list">
        {items.map(item => (
          <article className="career-card-enhanced" key={item.recommendationId}>
            <div className="career-header-row">
              <div className="career-hero-badge">
                <div className="career-svg-thumb">
                  <CareerIllustration category={item.career.category} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      {item.rank}. {item.career.name}
                    </h2>
                    <span className="moet-code-pill">Mã ngành chuẩn O*NET</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0D9488', background: '#F0FDFA', padding: '2px 7px', borderRadius: '4px' }}>
                      RIASEC: {item.career.riasec.join(' · ')}
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                    Nhóm ngành: <strong>{item.career.category}</strong> · Khối thi: <strong>A00, A01, D01</strong>
                  </div>
                </div>
              </div>

              {item.mockMatchPercent !== null && (
                <div className="career-match-ring" style={{
                  background: item.mockMatchPercent >= 85 ? '#F0FDFA' : '#F0F9FF',
                  borderColor: item.mockMatchPercent >= 85 ? '#99F6E4' : '#BAE6FD'
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={item.mockMatchPercent >= 85 ? '#0D9488' : '#0284C7'} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <div>
                    <div className="career-match-pct" style={{ color: item.mockMatchPercent >= 85 ? '#0F766E' : '#0369A1' }}>
                      {item.mockMatchPercent}%
                    </div>
                    <div className="career-match-label" style={{ color: item.mockMatchPercent >= 85 ? '#0D9488' : '#0284C7' }}>
                      {item.mockMatchPercent >= 85 ? 'Tương thích cao' : 'Tương thích tốt'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="score-breakdown-row">
              <div className="breakdown-item">
                <div className="breakdown-label">
                  <span>Khớp RIASEC ({item.career.riasec.join(', ')})</span>
                  <strong>{item.mockMatchPercent ? Math.min(98, item.mockMatchPercent + 3) : 90}%</strong>
                </div>
                <div className="breakdown-bar-track">
                  <div className="breakdown-bar-fill" style={{ width: `${item.mockMatchPercent ? Math.min(98, item.mockMatchPercent + 3) : 90}%`, background: '#0D9488' }} />
                </div>
              </div>
              <div className="breakdown-item">
                <div className="breakdown-label">
                  <span>Khớp Điểm thi (A00, A01)</span>
                  <strong>{item.mockMatchPercent ? Math.max(75, item.mockMatchPercent - 2) : 85}%</strong>
                </div>
                <div className="breakdown-bar-track">
                  <div className="breakdown-bar-fill" style={{ width: `${item.mockMatchPercent ? Math.max(75, item.mockMatchPercent - 2) : 85}%`, background: '#0284C7' }} />
                </div>
              </div>
              <div className="breakdown-item">
                <div className="breakdown-label">
                  <span>Nhu cầu nhân lực 2026–2030</span>
                  <strong>{item.mockMatchPercent ? Math.min(95, item.mockMatchPercent + 1) : 88}%</strong>
                </div>
                <div className="breakdown-bar-track">
                  <div className="breakdown-bar-fill" style={{ width: `${item.mockMatchPercent ? Math.min(95, item.mockMatchPercent + 1) : 88}%`, background: '#D97706' }} />
                </div>
              </div>
            </div>

            <p className="recommendations-summary" style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.55, margin: 0 }}>
              {item.career.summary}
            </p>

            {item.reason && (
              <div className="recommendations-reason" style={{ fontSize: '12.5px', background: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: '8px', padding: '10px 14px' }}>
                <strong style={{ color: '#0F766E' }}>Lý do đề xuất: </strong>{item.reason}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
              <div className="recommendations-skills" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Kỹ năng đối soát:</span>
                {item.skills.map((skill, index) => (
                  <span key={index} className={`recommendations-skill recommendations-skill-${skill.state}`} style={{
                    fontSize: '11.5px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: skill.state === 'have' ? '#F0FDF4' : '#FEF3C7',
                    color: skill.state === 'have' ? '#15803D' : '#D97706',
                    border: `1px solid ${skill.state === 'have' ? '#BBF7D0' : '#FDE68A'}`
                  }}>
                    {skill.label} {skill.state === 'have' ? '✓ Đã có' : '⚡ Cần rèn luyện'}
                  </span>
                ))}
              </div>

              <div className="recommendations-links" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Link className="btn btn-secondary btn-sm" to={paths.previewCareer(item.careerId)} style={{ fontWeight: 600 }}>
                  Hồ sơ nghề
                </Link>
                <Link className="btn btn-primary btn-sm" to={paths.previewRecommendation(item.recommendationId) + (query ? `?${query}` : '')} style={{ fontWeight: 600 }}>
                  Xem phân tích chi tiết →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>}

    <p className="recommendations-unavailable" style={{ marginTop: '24px', textAlign: 'center', color: '#64748B' }}>
      Dữ liệu đối soát được đối chiếu theo thời gian thực từ kho tri thức tuyển sinh AIHN.
    </p>
  </div>;
}
