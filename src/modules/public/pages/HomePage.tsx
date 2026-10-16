import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import heroStudent from '@/assets/home/hero-student.png';
import thumbLaptop from '@/assets/home/thumb-laptop.png';
import './home.css';

export function HomePage() {
  return <div className="home-page">

    <section className="hero-section-wrapper">

      <div>
        <div className="hero-badge-pill">
          <span className="sparkle">✨</span>
          <span>Định hướng nghề nghiệp &amp; Chọn ngành đại học cho Học sinh THPT</span>
        </div>

        <h1 className="hero-main-title">
          Khám phá phiên bản<br />
          <span className="highlight-teal">phù hợp nhất của bạn</span>
        </h1>

        <p className="hero-description-lead">
          AIHN đồng hành cùng học sinh THPT (Lớp 10–12) thấu hiểu sở thích, năng khiếu qua trắc nghiệm Holland, tự tin chọn đúng ngành, đúng trường đại học và xây dựng lộ trình tương lai rõ ràng.
        </p>

        <div className="hero-btn-row">
          <Link to={paths.assessment} className="btn-hero-primary">
            Làm trắc nghiệm Holland →
          </Link>
          <Link to={paths.careers} className="btn-hero-secondary">
            Khám phá nghề nghiệp →
          </Link>
        </div>

        <div className="hero-stats-row">
          <div className="stat-badge-unit">
            <div className="stat-badge-icon" style={{ background: 'var(--pastel-mint)', color: 'var(--pastel-mint-text)' }}>📋</div>
            <div>
              <div className="stat-badge-num">Holland RIASEC</div>
              <div className="stat-badge-desc">Khám phá sở thích của bạn</div>
            </div>
          </div>

          <div className="stat-badge-unit">
            <div className="stat-badge-icon" style={{ background: 'var(--pastel-amber)', color: 'var(--pastel-amber-text)' }}>💼</div>
            <div>
              <div className="stat-badge-num">Khám phá nghề nghiệp</div>
              <div className="stat-badge-desc">Tìm hiểu ngành học &amp; nghề</div>
            </div>
          </div>

          <div className="stat-badge-unit">
            <div className="stat-badge-icon" style={{ background: 'var(--pastel-purple)', color: 'var(--pastel-purple-text)' }}>🎯</div>
            <div>
              <div className="stat-badge-num">Hiểu kết quả</div>
              <div className="stat-badge-desc">Tìm hiểu nhóm sở thích RIASEC</div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-visual-stage">

        <div className="hero-student-frame">
          <img src={heroStudent} fetchPriority="high" alt="Nữ sinh viên ôm laptop học tập tự tin và rạng rỡ" width="520" height="420" />
        </div>

        <div className="floating-card card-float-1">
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#869BA8', textTransform: 'uppercase' }}>Ví dụ TopCode</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginTop: '2px' }}>
            <span style={{ fontSize: '17px', fontWeight: '800', color: '#028F94', letterSpacing: '0.8px' }}>I • S • C</span>
            <span style={{ color: '#028F94', fontSize: '13px' }}>→</span>
          </div>

          <div className="topcode-bars-row">
            <div className="topcode-bar" style={{ height: '22px', background: '#4F46E5' }}></div>
            <div className="topcode-bar" style={{ height: '17px', background: '#028F94' }}></div>
            <div className="topcode-bar" style={{ height: '15px', background: '#0284C7' }}></div>
          </div>
        </div>

        <div className="doodle-annotation" style={{ top: '105px', left: '15px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D5F73" strokeWidth="2" strokeLinecap="round"><path d="M4 18c4-6 10-8 15-8M15 6l4 4-4 4"/></svg>
          <span>Hiểu bản thân</span>
        </div>

        <div className="floating-card card-float-2">
          <img src={thumbLaptop} loading="lazy" alt="Laptop lập trình" className="career-thumb-img" width="60" height="38" />
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#162736' }}>Kỹ sư Phần mềm</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>Ví dụ: 92% phù hợp</span>
              <span style={{ fontSize: '12px', color: '#028F94' }}>→</span>
            </div>
          </div>
        </div>

        <div className="doodle-annotation" style={{ top: '148px', right: '0' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D5F73" strokeWidth="2" strokeLinecap="round"><path d="M20 18c-4-6-10-8-15-8M9 6l-4 4 4 4"/></svg>
          <span>Khám phá nghề nghiệp</span>
        </div>

        <div className="floating-card card-float-3">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#162736' }}>Lộ trình phát triển</div>
            <span style={{ color: '#028F94', fontSize: '13px' }}>→</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#869BA8', marginTop: '2px' }}>Ví dụ: 4 giai đoạn</div>
          <div className="roadmap-dots-strip">
            <div className="roadmap-dot" style={{ background: '#028F94' }}></div>
            <div className="roadmap-dot" style={{ background: '#0D9488' }}></div>
            <div className="roadmap-dot" style={{ background: '#73C6D9' }}></div>
            <div className="roadmap-dot" style={{ background: '#CCE5ED' }}></div>
          </div>
        </div>

        <div className="doodle-annotation" style={{ bottom: '95px', right: '-5px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D5F73" strokeWidth="2" strokeLinecap="round"><path d="M18 6c-3 6-9 10-14 11M8 19l-4-2 2-4"/></svg>
          <span>Xây dựng tương lai</span>
        </div>
      </div>
    </section>

    <div className="journey-section-wrap">
      <section className="journey-mega-card">
        <div className="journey-mega-grid">
          <div>
            <h2 className="journey-heading-title">
              Hành trình định hướng<br />dành riêng cho học sinh THPT
            </h2>
            <p className="journey-heading-desc">
              Từ thấu hiểu năng khiếu đến chọn đúng ngành học và trường đại học mơ ước.
            </p>
          </div>

          <div className="journey-chain-flow">

            <div className="journey-step-box">
              <div className="journey-circle-icon" style={{ background: 'var(--pastel-mint)', color: '#028F94' }}>
                👤
              </div>
              <div className="journey-step-header"><span className="step-idx" style={{ color: '#028F94' }}>01.</span> Hiểu bản thân</div>
              <p className="journey-step-copy">Trắc nghiệm Holland RIASEC giúp học sinh khám phá sở thích và năng khiếu.</p>
            </div>

            <div className="journey-arrow-divider">→</div>

            <div className="journey-step-box">
              <div className="journey-circle-icon" style={{ background: 'var(--pastel-purple)', color: '#4F46E5' }}>
                🧭
              </div>
              <div className="journey-step-header"><span className="step-idx" style={{ color: '#4F46E5' }}>02.</span> Chọn ngành &amp; Khám phá</div>
              <p className="journey-step-copy">Gợi ý ngành đào tạo đại học và cơ hội nghề nghiệp tương thích với bạn.</p>
            </div>

            <div className="journey-arrow-divider">→</div>

            <div className="journey-step-box">
              <div className="journey-circle-icon" style={{ background: 'var(--pastel-amber)', color: '#D97706' }}>
                🗺️
              </div>
              <div className="journey-step-header"><span className="step-idx" style={{ color: '#D97706' }}>03.</span> Lộ trình THPT → ĐH</div>
              <p className="journey-step-copy">Kế hoạch rèn luyện môn học trọng tâm, mục tiêu kỳ thi và kỹ năng thiết yếu.</p>
            </div>

            <div className="journey-arrow-divider">→</div>

            <div className="journey-step-box">
              <div className="journey-circle-icon" style={{ background: 'var(--pastel-rose)', color: '#E11D48' }}>
                💬
              </div>
              <div className="journey-step-header"><span className="step-idx" style={{ color: '#E11D48' }}>04.</span> Cố vấn AI đồng hành</div>
              <p className="journey-step-copy">Giải đáp băn khoăn chọn trường, chọn ngành, phương thức xét tuyển.</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div className="preview-section-wrap">
      <div className="preview-layout-grid">

        <div>
          <div className="preview-lead-badge">
            <span>💻</span>
            <span>GIAO DIỆN MỚI</span>
          </div>

          <h2 className="preview-lead-title">
            Đồng hành cùng học sinh THPT trên từng bước chọn ngành
          </h2>

          <p className="preview-lead-text">
            AIHN kết hợp khoa học tâm lý RIASEC, dữ liệu tuyển sinh và công nghệ AI để giải tỏa nỗi lo chọn sai ngành của học sinh lớp 10, 11, 12 và phụ huynh.
          </p>

          <Link to={paths.dashboard} className="btn-hero-primary" style={{ padding: '0 28px', height: '48px' }}>
            Trải nghiệm ngay →
          </Link>

          <div className="doodle-annotation" style={{ position: 'static', marginTop: '24px', color: '#2D5F73' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2D5F73" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            <span>Giao diện trực quan dễ sử dụng</span>
          </div>
        </div>

        <section className="product-mockup-window" aria-labelledby="example-title">
          <h3 id="example-title" className="example-label">Ví dụ bàn làm việc · Dữ liệu mẫu</h3>

          <div className="doodle-annotation" style={{ top: '-28px', right: '24px', color: '#2D5F73' }}>
            <span>Tất cả trong một nơi</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D5F73" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
          </div>

          <div className="mockup-top-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="brand-logo-icon" style={{ width: '26px', height: '26px', fontSize: '11px', borderRadius: '7px' }}>AI</div>
              <strong style={{ fontSize: '14px', color: '#162736' }}>AIHN</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: '#869BA8', background: '#EFF8FA', padding: '4px 12px', borderRadius: 'var(--radius-full)', border: '1px solid #DFEFF5' }}>🔍 Tìm kiếm...</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#D9EDF4', display: 'grid', placeItems: 'center', fontSize: '10px', fontWeight: '800', color: '#028F94' }}>MH</span>
                <span style={{ color: '#162736' }}>Minh Hải (Lớp 12)</span>
              </div>
            </div>
          </div>

          <div className="mockup-greeting-row">
            <div>
              <h3 className="mockup-greeting-title">Xin chào, Minh Hải 👋 (Lớp 12 THPT)</h3>
              <p className="mockup-greeting-sub">Hôm nay bạn muốn tìm hiểu ngành học đại học nào?</p>
            </div>
            <div className="mockup-motivator-pill">
              🎯 Mục tiêu: Xét tuyển ĐH Công nghệ / Bách Khoa
            </div>
          </div>

          <div className="mock-actions-grid">
            <div className="mock-action-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="mock-action-icon" style={{ background: 'var(--pastel-mint)', color: '#028F94' }}>📋</div>
                <div>
                  <div className="mock-action-label">Trắc nghiệm Holland</div>
                  <div className="mock-action-sub">Đã hoàn thành 60/60 câu</div>
                </div>
              </div>
              <Link to={paths.assessment} className="mock-pill-btn">Xem kết quả</Link>
            </div>

            <div className="mock-action-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="mock-action-icon" style={{ background: 'var(--pastel-purple)', color: '#4F46E5' }}>💼</div>
                <div>
                  <div className="mock-action-label">Nghề nghiệp gợi ý</div>
                  <div className="mock-action-sub">12 gợi ý phù hợp</div>
                </div>
              </div>
              <Link to={paths.recommendations} className="mock-pill-btn">Khám phá ngay</Link>
            </div>

            <div className="mock-action-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="mock-action-icon" style={{ background: 'var(--pastel-amber)', color: '#D97706' }}>🗺️</div>
                <div>
                  <div className="mock-action-label">Lộ trình phát triển</div>
                  <div className="mock-action-sub">4 giai đoạn rõ ràng</div>
                </div>
              </div>
              <Link to={paths.roadmap} className="mock-pill-btn">Xem lộ trình</Link>
            </div>

            <div className="mock-action-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="mock-action-icon" style={{ background: 'var(--pastel-rose)', color: '#E11D48' }}>💬</div>
                <div>
                  <div className="mock-action-label">Cố vấn AI</div>
                  <div className="mock-action-sub">Ví dụ phiên tư vấn</div>
                </div>
              </div>
              <Link to={paths.advisor} className="mock-pill-btn">Đặt câu hỏi</Link>
            </div>
          </div>

          <div className="mock-footer-row">
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '700', color: '#162736' }}>Nghề nghiệp phù hợp nhất:</span>
              <span className="badge-riasec badge-riasec-i" style={{ borderRadius: 'var(--radius-full)', padding: '3px 10px' }}>I - Nghiên cứu</span>
              <span className="badge-riasec badge-riasec-s" style={{ borderRadius: 'var(--radius-full)', padding: '3px 10px' }}>S - Xã hội</span>
              <span className="badge-riasec badge-riasec-c" style={{ borderRadius: 'var(--radius-full)', padding: '3px 10px' }}>C - Nghiệp vụ</span>
            </div>
            <Link to={paths.recommendations} style={{ color: '#028F94', fontWeight: '700', textDecoration: 'none' }}>Xem tất cả →</Link>
          </div>
        </section>
      </div>
    </div>

  </div>;
}
