import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link, useSearchParams } from 'react-router';
import { paths } from '@/routes/paths';
import { templates, stages, templateId } from '../model/templates';
import './roadmap.css';

export function RoadmapPage() {
  const [params, setParams] = useSearchParams(),
    id = templateId(params.get('target')),
    template = id ? templates[id] : null;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ noPreference: "(prefers-reduced-motion: no-preference)" }, () => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.5 } });
        tl.from(".page-header-friendly", { y: 12, autoAlpha: 0 })
          .from(".stage-progression-bar", { y: 14, autoAlpha: 0, scale: 0.99 }, "-=0.25")
          .from(".phase-card-item", { y: 18, autoAlpha: 0, stagger: 0.12 }, "-=0.2");
      });
    }, containerRef);
    return () => ctx.revert();
  }, [id]);

  return (
    <div className="roadmap-preview" ref={containerRef}>
      <section className="page-header-friendly" style={{ marginBottom: "20px" }}>
        <div>
          <span className="header-pill-tag" style={{ background: "#F0FDFA", color: "#0D9488", border: "1px solid #99F6E4", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "999px", fontSize: "11.5px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>LỘ TRÌNH 4 GIAI ĐOẠN (2024–2030)</span>
          </span>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--color-text-main, #0F172A)", letterSpacing: "-0.02em", margin: "8px 0 6px" }}>
            {template ? `Lộ trình phát triển: Học sinh THPT → ${template.name}` : 'Lộ trình phát triển sự nghiệp cá nhân hóa'}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--color-text-sub, #475569)", maxWidth: "760px", margin: 0, lineHeight: 1.5 }}>
            Kế hoạch hành động chuẩn hóa 4 giai đoạn: từ lựa chọn tổ hợp môn thi cấp 3, thi tuyển sinh đại học cho đến đồ án công nghệ và việc làm chính thức.
          </p>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label className="roadmap-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', fontWeight: 600 }}>
            <span>Chọn mục tiêu nghề:</span>
            <select
              value={id ?? ''}
              onChange={(e) => setParams(e.target.value ? { target: e.target.value } : {})}
              style={{ minHeight: '38px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
            >
              <option value="">Chưa chọn (Khám phá chung)</option>
              {Object.entries(templates).map(([key, item]) => (
                <option value={key} key={key}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          {template && (
            <Link className="btn btn-secondary btn-sm" to={paths.previewCareer(template.careerId)} style={{ fontWeight: 600 }}>
              Xem hồ sơ nghề mẫu →
            </Link>
          )}
        </div>
      </section>

      {/* 4-Stage Progression Bar */}
      <div className="stage-progression-bar">
        <div className="stage-step-item completed">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <div>
            <div style={{ fontWeight: 700 }}>GĐ 1: Lớp 10–11</div>
            <div style={{ fontSize: '11px', color: '#15803D' }}>Đã xong · Nền tảng</div>
          </div>
        </div>

        <div className="stage-step-item active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
          <div>
            <div style={{ fontWeight: 700, color: '#0F766E' }}>GĐ 2: Lớp 12 THPT</div>
            <div style={{ fontSize: '11px', color: '#0D9488' }}>Hiện tại · Thi &amp; Xét ĐH</div>
          </div>
        </div>

        <div className="stage-step-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
          <div>
            <div style={{ fontWeight: 600, color: '#475569' }}>GĐ 3: Năm 1–2 ĐH</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Kế tiếp · Chuyên môn</div>
          </div>
        </div>

        <div className="stage-step-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          <div>
            <div style={{ fontWeight: 600, color: '#475569' }}>GĐ 4: Năm 3–4 ĐH</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Mục tiêu · Việc làm</div>
          </div>
        </div>
      </div>

      {/* Structured Roadmap Timeline */}
      <div className="roadmap-timeline-box">
        {stages.map((stageTitle, i) => {
          const isDone = i === 0;
          const isCurrent = i === 1;
          const taskContent = template ? template.tasks[i] : (
            i === 0 ? 'Xác định nhóm sở thích RIASEC, hoàn thành bài đánh giá sở thích và tập trung điểm số học bạ lớp 10–11.' :
            i === 1 ? 'Luyện thi tốt nghiệp THPT, thi ĐGNL (ĐHQG/Bách Khoa), chuẩn bị hồ sơ xét tuyển theo tổ hợp A00, A01, D01.' :
            i === 2 ? 'Tiếp cận các học phần cơ sở ngành, xây dựng đồ án kỹ thuật đầu tiên và rèn luyện kỹ năng Tiếng Anh chuyên ngành.' :
            'Tham gia chương trình thực tập doanh nghiệp (Internship), hoàn thành khóa luận tốt nghiệp và ứng tuyển chính thức.'
          );

          return (
            <div className="phase-card-item" key={i}>
              <div
                className={`phase-badge-marker ${isDone ? 'completed' : isCurrent ? 'current' : 'upcoming'}`}
                title={`Giai đoạn ${i + 1}`}
              >
                {isDone ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                ) : isCurrent ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                ) : (
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>{i + 1}</span>
                )}
              </div>

              <div className={`phase-content-card ${isCurrent ? 'active-phase' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--rm-text-main, #0F172A)', margin: 0 }}>
                      Giai đoạn {i + 1}: {stageTitle}
                    </h2>
                    <span style={{
                      fontSize: '12px',
                      color: isDone ? '#16A34A' : isCurrent ? '#0D9488' : '#64748B',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '3px'
                    }}>
                      {isDone ? '✓ Đã hoàn thành mục tiêu nền tảng' : isCurrent ? '● Đang tập trung cao độ (Năm học 2025–2026)' : '○ Kế hoạch dự kiến các năm tiếp theo'}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: isDone ? '#F0FDF4' : isCurrent ? '#F0FDFA' : '#F8FAFC',
                    color: isDone ? '#15803D' : isCurrent ? '#0F766E' : '#64748B',
                    border: `1px solid ${isDone ? '#BBF7D0' : isCurrent ? '#99F6E4' : '#E2E8F0'}`
                  }}>
                    {isDone ? 'Đạt 100%' : isCurrent ? 'Đang thực hiện' : 'Chuẩn bị'}
                  </span>
                </div>

                <p style={{ fontSize: '13.5px', color: 'var(--rm-text-sub, #475569)', lineHeight: 1.55, margin: 0 }}>
                  {taskContent}
                </p>

                <div>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--rm-text-main, #0F172A)', display: 'block', marginBottom: '6px' }}>
                    Nhiệm vụ trọng tâm giai đoạn:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div className="action-checklist-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDone ? '#16A34A' : '#0D9488'} strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg>
                      <span>{taskContent}</span>
                    </div>
                    <div className="action-checklist-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><circle cx="12" cy="12" r="10"/></svg>
                      <span>Đối chiếu định kỳ với Cố vấn AI để kịp thời tinh chỉnh nguyện vọng xét tuyển đại học.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '24px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Cần thêm tư vấn chuyên sâu về các môn thi và ngành học?</div>
          <div style={{ fontSize: '12.5px', color: '#64748B' }}>Cố vấn AIHN sẵn sàng hỗ trợ giải đáp chiến lược tuyển sinh đại học 2026.</div>
        </div>
        <Link className="btn btn-primary btn-sm" to={paths.advisor} style={{ fontWeight: 600 }}>
          Trao đổi với Cố vấn AI →
        </Link>
      </div>
    </div>
  );
}
