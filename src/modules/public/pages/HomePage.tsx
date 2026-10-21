import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import heroStudent from '@/assets/home/hero-student.png';
import gsap from 'gsap';
import './home.css';

export function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = gsap.matchMedia();
    const ctx = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        // Explicit destinations remain correct if media setup runs again.
        const timeline = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.5 } });
        timeline.fromTo('.hero-badge', { y: 14, opacity: 0 }, { y: 0, opacity: 1, clearProps: 'transform,opacity' })
          .fromTo('.hero-main-title', { y: 18, opacity: 0 }, { y: 0, opacity: 1, clearProps: 'transform,opacity' }, '-=0.25')
          .fromTo('.hero-description-lead', { y: 14, opacity: 0 }, { y: 0, opacity: 1, clearProps: 'transform,opacity' }, '-=0.3')
          .fromTo('.hero-student-frame', { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, clearProps: 'transform,opacity' }, '-=0.3');
      });
    }, containerRef);
    return () => { media.revert(); ctx.revert(); };
  }, []);

  return (
    <div className="home-page" ref={containerRef}>
      
    {/*  2. HERO SECTION  */}
    <section className="hero-section-wrapper">
      {/*  Left Column: Headline, CTAs, Capabilities  */}
      <div>
        <div className="hero-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span>Khám phá nghề nghiệp cho Học sinh THPT</span>
        </div>

        <h1 className="hero-main-title">
          Khám phá phiên bản<br />
          <span className="highlight-teal">phù hợp nhất của bạn</span>
        </h1>

        <p className="hero-description-lead">
          AIHN đồng hành cùng học sinh THPT (Lớp 10–12) tìm hiểu sở thích qua trắc nghiệm Holland RIASEC, cân nhắc ngành học, nghề nghiệp và các bước phát triển tiếp theo.
        </p>

        <div className="hero-btn-row">
          <Link to={paths.assessment} className="btn-hero-primary">
            <span>Làm trắc nghiệm Holland</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <Link to={paths.careers} className="btn-hero-secondary">
            <span>Khám phá nghề nghiệp</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </Link>
        </div>

        {/*  Capability Metrics (No fake metrics)  */}
        <div className="hero-stats-row">
          <div className="stat-badge-unit">
            <div className="stat-badge-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
            </div>
            <div>
              <div className="stat-badge-num">6 nhóm RIASEC</div>
              <div className="stat-badge-desc">Khám phá sở thích nghề</div>
            </div>
          </div>

          <div className="stat-badge-unit">
            <div className="stat-badge-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <div>
              <div className="stat-badge-num">Danh mục nghề</div>
              <div className="stat-badge-desc">Xem trạng thái dữ liệu</div>
            </div>
          </div>

          <div className="stat-badge-unit">
            <div className="stat-badge-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <div className="stat-badge-num">Có giải thích</div>
              <div className="stat-badge-desc">Giải trình chi tiết theo RIASEC</div>
            </div>
          </div>
        </div>
      </div>

      {/*  Right Column: Prominent Student Visual & 2 Sleek Anchored Metric Cards  */}
      <div className="hero-student-stage">
        {/*  Floating Pill 1: TopCode Badge  */}
        <div className="hero-floating-pill pill-top-left">
          <div className="pill-header-sub">Ví dụ minh họa RIASEC</div>
          <div className="pill-topcode-val">I • S • C</div>
          <div className="mini-topcode-bars">
            <div className="mini-bar" style={{ height: "18px", background: "#0D9488" }}></div>
            <div className="mini-bar" style={{ height: "14px", background: "#0284C7" }}></div>
            <div className="mini-bar" style={{ height: "12px", background: "#D97706" }}></div>
          </div>
        </div>

        {/*  Center Student Photo / Large Radiant Canvas  */}
        <div className="hero-student-frame">
          <img src={heroStudent} alt="Học sinh THPT ôm laptop học tập tự tin và rạng rỡ" width="520" height="420" />
        </div>

        {/*  Floating Pill 2: Career Recommendation Match  */}
        <div className="hero-floating-pill pill-bottom-right">
          <div className="pill-career-row">
            <div className="pill-career-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <div>
              <div className="pill-career-title">Kỹ sư Phần mềm &amp; AI</div>
              <div className="pill-career-match">Minh họa một hướng khám phá</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/*  3. CAREER JOURNEY SECTION  */}
    <div className="journey-section-wrap">
      <section className="journey-mega-card">
        <div className="journey-header-row">
          <div className="journey-tag">Quy trình định hướng 4 bước</div>
          <h2 className="journey-heading-title">
            Hành trình chọn ngành khoa học cho học sinh THPT
          </h2>
          <p className="journey-heading-desc">
            Từ tìm hiểu sở thích bản thân đến khám phá nghề và chuẩn bị các bước hành động.
          </p>
        </div>

        <div className="journey-chain-flow">
          {/*  Step 1  */}
          <div className="journey-step-box">
            <div className="journey-step-icon" style={{ background: "#F0FDFA", color: "#0D9488" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div className="journey-step-idx">BƯỚC 01</div>
            <div className="journey-step-header">Hiểu bản thân</div>
            <p className="journey-step-copy">Trắc nghiệm Holland RIASEC giúp bạn khám phá sở thích nghề nghiệp qua những lựa chọn Có/Không.</p>
          </div>

          {/*  Step 2  */}
          <div className="journey-step-box">
            <div className="journey-step-icon" style={{ background: "#F0F9FF", color: "#0284C7" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            </div>
            <div className="journey-step-idx">BƯỚC 02</div>
            <div className="journey-step-header">Chọn ngành học</div>
            <p className="journey-step-copy">Khám phá mô tả công việc và những kỹ năng cần tìm hiểu thêm.</p>
          </div>

          {/*  Step 3  */}
          <div className="journey-step-box">
            <div className="journey-step-icon" style={{ background: "#FFFBEB", color: "#D97706" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
            </div>
            <div className="journey-step-idx">BƯỚC 03</div>
            <div className="journey-step-header">Các bước phát triển</div>
            <p className="journey-step-copy">Tìm hiểu yêu cầu của nghề, tự đánh giá kỹ năng và chuẩn bị trải nghiệm thực tế.</p>
          </div>

          {/*  Step 4  */}
          <div className="journey-step-box">
            <div className="journey-step-icon" style={{ background: "#FEF2F2", color: "#DC2626" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div className="journey-step-idx">BƯỚC 04</div>
            <div className="journey-step-header">Cố vấn AI đồng hành</div>
            <p className="journey-step-copy">Trao đổi dựa trên hồ sơ và kết quả Holland. Thông tin tuyển sinh cần đối chiếu nguồn chính thức.</p>
          </div>
        </div>
      </section>
    </div>

    {/*  4. REAL PRODUCT PREVIEW SECTION  */}
    <div className="preview-section-wrap">
      <div className="preview-layout-grid">
        {/*  Left: Copy & CTA  */}
        <div>
          <div className="preview-lead-badge">Không gian làm việc · Minh họa</div>
          <h2 className="preview-lead-title">
            Đồng hành cùng học sinh THPT trên từng bước chọn ngành
          </h2>
          <p className="preview-lead-text">
            AIHN hỗ trợ xem kết quả RIASEC, tìm hiểu nghề và trao đổi với AI. Danh mục nghề hiển thị trạng thái dữ liệu; thông tin tuyển sinh cần tra cứu từ nguồn chính thức.
          </p>
          <Link to={paths.dashboard} className="btn-hero-primary">
            <span>Trải nghiệm Bàn làm việc</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>

        {/*  Right: Modern macOS Style App Window  */}
        <div className="product-mockup-window" role="region" aria-label="Ví dụ bàn làm việc · Dữ liệu mẫu">
          <p role="note">Dữ liệu mẫu minh họa giao diện, không phải kết quả của bạn.</p>
          {/*  Window Chrome Dots  */}
          <div className="mockup-window-controls">
            <span className="window-dot" style={{ background: "#EF4444" }}></span>
            <span className="window-dot" style={{ background: "#F59E0B" }}></span>
            <span className="window-dot" style={{ background: "#10B981" }}></span>
            <span style={{ fontSize: "var(--font-size-caption)", fontWeight: "600", color: "var(--color-text-muted)", marginLeft: "8px" }}>aihn-career-workspace</span>
          </div>

          {/*  Mock Header Bar  */}
          <div className="mockup-top-bar">
            <div>
              <h3 className="mockup-greeting-title">Bàn làm việc của Minh Hải (Lớp 12)</h3>
              <p className="mockup-greeting-sub">Hôm nay bạn muốn tìm hiểu nghề nghiệp nào?</p>
            </div>
            <div className="mockup-motivator-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
              <span>Minh họa giao diện · không phải dữ liệu cá nhân</span>
            </div>
          </div>

          {/*  4 Quick Action Cards in Strip  */}
          <div className="mock-actions-grid">
            <div className="mock-action-card">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div className="mock-action-icon" style={{ background: "#F0FDFA", color: "#0D9488" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                </div>
                <div>
                  <div className="mock-action-label">Trắc nghiệm Holland</div>
                  <div className="mock-action-sub">Ví dụ bài trắc nghiệm</div>
                </div>
              </div>
              <Link to={paths.assessmentResults} className="mock-pill-btn">Xem kết quả</Link>
            </div>

            <div className="mock-action-card">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div className="mock-action-icon" style={{ background: "#F0F9FF", color: "#0284C7" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                <div>
                  <div className="mock-action-label">Nghề nghiệp gợi ý</div>
                  <div className="mock-action-sub">Ví dụ danh sách nghề</div>
                </div>
              </div>
              <Link to={paths.recommendations} className="mock-pill-btn">Khám phá ngay</Link>
            </div>

            <div className="mock-action-card">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div className="mock-action-icon" style={{ background: "#FFFBEB", color: "#D97706" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                </div>
                <div>
                  <div className="mock-action-label">Các bước phát triển</div>
                  <div className="mock-action-sub">Ví dụ các bước hành động</div>
                </div>
              </div>
              <Link to={paths.roadmap} className="mock-pill-btn">Xem lộ trình</Link>
            </div>

            <div className="mock-action-card">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div className="mock-action-icon" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div>
                  <div className="mock-action-label">Cố vấn AI</div>
                  <div className="mock-action-sub">Ví dụ hội thoại tư vấn</div>
                </div>
              </div>
              <Link to={paths.advisor} className="mock-pill-btn">Đặt câu hỏi</Link>
            </div>
          </div>

          {/*  Bottom Filter Row  */}
          <div className="mock-footer-row">
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontWeight: "700", color: "var(--color-text-main)", fontSize: "var(--font-size-body)" }}>Nhóm ngành phù hợp nhất:</span>
              <span style={{ background: "#F1F5F9", color: "#0F172A", fontWeight: "600", padding: "3px 8px", borderRadius: "4px", fontSize: "var(--font-size-caption)" }}>I - Nghiên cứu</span>
              <span style={{ background: "#F1F5F9", color: "#0F172A", fontWeight: "600", padding: "3px 8px", borderRadius: "4px", fontSize: "var(--font-size-caption)" }}>S - Xã hội</span>
              <span style={{ background: "#F1F5F9", color: "#0F172A", fontWeight: "600", padding: "3px 8px", borderRadius: "4px", fontSize: "var(--font-size-caption)" }}>C - Nghiệp vụ</span>
            </div>
            <Link to={paths.recommendations} style={{ color: "var(--color-brand-primary)", fontWeight: "600", textDecoration: "none", fontSize: "var(--font-size-body)" }}>Xem tất cả →</Link>
          </div>
        </div>
      </div>
    </div>

    {/*  5. PRODUCT CAPABILITIES  */}
    <div className="home-stats-wrap">
      <div className="home-stats-card">
        <div className="home-stat-item">
          <div className="home-stat-num">6</div>
          <div className="home-stat-label">Nhóm RIASEC</div>
          <div className="home-stat-desc">Tham khảo mô hình sở thích nghề nghiệp.</div>
        </div>
        <div className="home-stat-item">
          <div className="home-stat-num">Có/Không</div>
          <div className="home-stat-label">Cách trả lời</div>
          <div className="home-stat-desc">Kết quả dựa trên các lựa chọn đã lưu.</div>
        </div>
        <div className="home-stat-item">
          <div className="home-stat-num">Hồ sơ</div>
          <div className="home-stat-label">Bạn chủ động cập nhật</div>
          <div className="home-stat-desc">Thông tin cá nhân bổ sung ngữ cảnh tư vấn.</div>
        </div>
        <div className="home-stat-item">
          <div className="home-stat-num">AI</div>
          <div className="home-stat-label">Hội thoại có ngữ cảnh</div>
          <div className="home-stat-desc">Dựa trên hồ sơ và kết quả; khả dụng tùy cấu hình.</div>
        </div>
      </div>
    </div>

    {/*  6. SCIENTIFIC PILLARS SECTION  */}
    <div className="home-pillars-wrap">
      <div className="home-section-header">
        <div className="home-section-tag">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>
          <span>Nền tảng khoa học</span>
        </div>
        <h2 className="home-section-title">
          Điểm độc đáo tạo nên sự khác biệt của AIHN
        </h2>
        <p className="home-section-desc">
          Tham khảo mô hình Holland RIASEC và xem giải thích từ dữ liệu có nguồn khi khả dụng để chủ động tìm hiểu hướng nghề nghiệp.
        </p>
      </div>

      <div className="home-pillars-grid">
        {/*  Pillar 1  */}
        <div className="home-pillar-card">
          <div className="home-pillar-icon" style={{ background: "#F0FDFA", color: "#0D9488" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <h3 className="home-pillar-title">Tham khảo mô hình Holland RIASEC</h3>
          <p className="home-pillar-text">
            Sử dụng mô hình Holland RIASEC để tham khảo sở thích nghề nghiệp. Bộ câu hỏi của đồ án chưa được thẩm định tâm lý trên một mẫu đại diện học sinh Việt Nam.
          </p>
          <div className="home-pillar-footer">
            <span>6 nhóm sở thích nghề nghiệp</span>
            <Link to={paths.assessment} style={{ color: "var(--color-brand-primary)", textDecoration: "none" }}>Chi tiết →</Link>
          </div>
        </div>

        {/*  Pillar 2  */}
        <div className="home-pillar-card">
          <div className="home-pillar-icon" style={{ background: "#F0F9FF", color: "#0284C7" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 12 2.1 12.5"/><path d="m4.5 4.5 7.5 7.5"/></svg>
          </div>
          <h3 className="home-pillar-title">Trí tuệ nhân tạo cá nhân hóa</h3>
          <p className="home-pillar-text">
            AI hỗ trợ trao đổi về hồ sơ và kết quả Holland. Xem dữ liệu có nguồn và giải thích trước khi cân nhắc một hướng nghề nghiệp.
          </p>
          <div className="home-pillar-footer">
            <span>Phân tích dữ liệu đa chiều</span>
            <Link to={paths.careers} style={{ color: "#0284C7", textDecoration: "none" }}>Khám phá →</Link>
          </div>
        </div>

        {/*  Pillar 3  */}
        <div className="home-pillar-card">
          <div className="home-pillar-icon" style={{ background: "#FFFBEB", color: "#D97706" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          </div>
          <h3 className="home-pillar-title">Hành trình đồng hành thực chiến</h3>
          <p className="home-pillar-text">
            Chuẩn bị các bước tìm hiểu nghề, rèn luyện kỹ năng, làm dự án và trao đổi với cố vấn. Thông tin tuyển sinh cần nguồn chính thức.
          </p>
          <div className="home-pillar-footer">
            <span>Các bước hành động có thể theo dõi</span>
            <Link to={paths.roadmap} style={{ color: "#D97706", textDecoration: "none" }}>Xem lộ trình →</Link>
          </div>
        </div>
      </div>
    </div>

    {/*  7. GUIDANCE DISCUSSION PROMPTS  */}
    <div className="home-advisors-wrap">
      <div className="home-section-header">
        <div className="home-section-tag">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>Trao đổi hướng nghiệp</span>
        </div>
        <h2 className="home-section-title">
          Chuẩn bị cho cuộc trao đổi hướng nghiệp
        </h2>
        <p className="home-section-desc">
          Các câu hỏi gợi mở để trao đổi cùng người học, gia đình và cố vấn.
        </p>
      </div>

      <div className="home-advisors-grid">
        <div className="home-advisor-card">
          <div className="advisor-profile-row">
            <div className="advisor-avatar">NH</div>
            <div>
              <div className="advisor-info-name">Người học</div>
              <div className="advisor-info-role">Câu hỏi gợi ý</div>
            </div>
          </div>
          <div className="advisor-quote">Bạn muốn thử công việc nào và đã có trải nghiệm gì liên quan?</div>
        </div>
        <div className="home-advisor-card">
          <div className="advisor-profile-row">
            <div className="advisor-avatar">GD</div>
            <div>
              <div className="advisor-info-name">Gia đình</div>
              <div className="advisor-info-role">Câu hỏi gợi ý</div>
            </div>
          </div>
          <div className="advisor-quote">Điều kiện học tập và mong muốn của gia đình ảnh hưởng thế nào đến lựa chọn?</div>
        </div>
        <div className="home-advisor-card">
          <div className="advisor-profile-row">
            <div className="advisor-avatar">CV</div>
            <div>
              <div className="advisor-info-name">Cố vấn</div>
              <div className="advisor-info-role">Câu hỏi gợi ý</div>
            </div>
          </div>
          <div className="advisor-quote">Cần tìm thêm nguồn hoặc minh chứng nào trước khi quyết định?</div>
        </div>
      </div>
    </div>

    {/*  8. FINAL CTA BANNER  */}
    <div className="home-final-cta-wrap">
      <div className="home-cta-banner">
        <div className="home-cta-content">
          <div className="home-cta-tag">Bắt đầu hoàn toàn miễn phí</div>
          <h2 className="home-cta-title">
            Sẵn sàng khám phá phiên bản phù hợp nhất của bạn?
          </h2>
          <p className="home-cta-desc">
            Trả lời bộ câu hỏi Holland theo tốc độ của bạn, rồi xem kết quả và cân nhắc những bước tìm hiểu nghề tiếp theo.
          </p>
        </div>

        <div className="home-cta-buttons">
          <Link to={paths.assessment} className="btn-cta-white">
            <span>Làm bài trắc nghiệm ngay</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <Link to={paths.advisor} className="btn-cta-outline-white">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>Trò chuyện với Cố vấn AI</span>
          </Link>
        </div>
      </div>
    </div>
  
    </div>
  );
}
