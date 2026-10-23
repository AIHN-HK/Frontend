import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import styles from '../pages/HomePage.module.css';

export function HomeHero() {
  return (
    <section className={styles["aihn-hero"] + " " + styles["section--dark"]} data-home-surface="dark" aria-label="Khám phá con đường phù hợp">
      <div className={styles["aihn-hero__container"]}>
        <div className={styles["aihn-hero__content"]}>
          <div className={styles["hero-pill-badge"]}>
            <span>
              {"Khám phá bản thân cùng Holland RIASEC"}
            </span>
          </div>
          <h1 className={styles["aihn-hero__title"]}>
            {"Khám phá con đường"}
            <br />
            <em>
              {"phù hợp với bạn."}
            </em>
          </h1>
          <p className={styles["aihn-hero__desc"]}>
            {"Hiểu bản thân qua Holland RIASEC, khám phá nghề nghiệp phù hợp và xây dựng lộ trình phát triển cùng AI."}
          </p>
          <div className={styles["aihn-hero__actions"]}>
            <Link className={styles["btn-editorial-primary"]} to={paths.assessment}>
              <span>
                {"Bắt đầu khám phá"}
              </span>
              <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a className={styles["btn-editorial-secondary"]} href="#how-it-works">
              <span>
                {"AIHN hoạt động thế nào?"}
              </span>
              <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>
        </div>
        <div className={styles["aihn-hero__stage"]}>
          <p className={styles["demo-note"]}>
            {"Minh họa giao diện · Không phải kết quả cá nhân"}
          </p>
          <div className={styles["aihn-journey-stack"]}>
            <div className={styles["journey-card"]}>
              <div className={styles["journey-card-header"]}>
                <span className={styles["journey-step-tag"]}>
                  {"Nghề nghiệp minh họa"}
                </span>
                <span className={styles["journey-match-badge"]}>
                  {"94 / 100"}
                </span>
              </div>
              <h3 className={styles["journey-card-title"]}>
                {"Software Engineer"}
              </h3>
              <p className={styles["journey-card-desc"]}>
                {"Thiết kế kiến trúc hệ thống, tư duy logic giải quyết bài toán quy mô lớn."}
              </p>
              <div className={styles["journey-riasec-pills"]}>
                <span className={styles["riasec-micro-pill"]} style={{"color": "#06b6d4"}}>
                  {"I • Nghiên cứu"}
                </span>
                <span className={styles["riasec-micro-pill"]} style={{"color": "#f59e0b"}}>
                  {"R • Thực tế"}
                </span>
                <span className={styles["riasec-micro-pill"]} style={{"color": "#8b5cf6"}}>
                  {"E • Quản lý"}
                </span>
              </div>
            </div>
            <div className={styles["journey-card"]} style={{"marginLeft": "20px"}}>
              <div className={styles["journey-card-header"]}>
                <span className={styles["journey-step-tag"]}>
                  {"Nghệ thuật & Hành vi"}
                </span>
                <span className={styles["journey-match-badge"]} style={{"color": "#38bdf8", "background": "rgba(56, 189, 248, 0.18)", "borderColor": "rgba(56, 189, 248, 0.35)"}}>
                  {"89 / 100"}
                </span>
              </div>
              <h3 className={styles["journey-card-title"]}>
                {"UX Designer"}
              </h3>
              <p className={styles["journey-card-desc"]}>
                {"Kết hợp thấu hiểu tâm lý người dùng với trải nghiệm thẩm mỹ trực quan."}
              </p>
              <div className={styles["journey-riasec-pills"]}>
                <span className={styles["riasec-micro-pill"]} style={{"color": "#ec4899"}}>
                  {"A • Nghệ thuật"}
                </span>
                <span className={styles["riasec-micro-pill"]} style={{"color": "#06b6d4"}}>
                  {"I • Nghiên cứu"}
                </span>
                <span className={styles["riasec-micro-pill"]} style={{"color": "#3b82f6"}}>
                  {"S • Xã hội"}
                </span>
              </div>
            </div>
            <div className={styles["journey-card"]} style={{"marginLeft": "40px"}}>
              <div className={styles["journey-card-header"]}>
                <span className={styles["journey-step-tag"]}>
                  {"Dữ liệu & Chiến lược"}
                </span>
                <span className={styles["journey-match-badge"]} style={{"color": "#a78bfa", "background": "rgba(167, 139, 250, 0.18)", "borderColor": "rgba(167, 139, 250, 0.35)"}}>
                  {"86 / 100"}
                </span>
              </div>
              <h3 className={styles["journey-card-title"]}>
                {"Data Analyst"}
              </h3>
              <p className={styles["journey-card-desc"]}>
                {"Chuyển hóa dữ liệu thô thành câu chuyện có khả năng thúc đẩy hành động."}
              </p>
              <div className={styles["journey-riasec-pills"]}>
                <span className={styles["riasec-micro-pill"]} style={{"color": "#06b6d4"}}>
                  {"I • Nghiên cứu"}
                </span>
                <span className={styles["riasec-micro-pill"]} style={{"color": "#94a3b8"}}>
                  {"C • Nghiệp vụ"}
                </span>
                <span className={styles["riasec-micro-pill"]} style={{"color": "#8b5cf6"}}>
                  {"E • Quản lý"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeIntroduction() {
  return (
    <section className={styles["aihn-intro"] + " " + styles["section--light"]} data-home-surface="light">
      <div className={styles["aihn-intro__container"]}>
        <div className={styles["aihn-intro__header"]}>
          <span className={styles["editorial-tag"]}>
            {"Triết lý định hướng"}
          </span>
          <h2 className={styles["editorial-statement"]}>
            {"Không chỉ chọn một nghề."}
            <br />
            {"Hãy hiểu vì sao nghề đó phù hợp với bạn."}
          </h2>
        </div>
        <div className={styles["aihn-intro__grid"]}>
          <div className={styles["intro-column"]}>
            <div className={styles["intro-column__num"]}>
              {"01"}
            </div>
            <h3 className={styles["intro-column__title"]}>
              {"KHÁM PHÁ"}
            </h3>
            <p className={styles["intro-column__p"]}>
              {"Holland RIASEC giúp bạn nhận diện sở thích, xu hướng và môi trường làm việc phù hợp từ bản năng tự nhiên."}
            </p>
          </div>
          <div className={styles["intro-column"]}>
            <div className={styles["intro-column__num"]}>
              {"02"}
            </div>
            <h3 className={styles["intro-column__title"]}>
              {"KẾT NỐI"}
            </h3>
            <p className={styles["intro-column__p"]}>
              {"AIHN phân tích hồ sơ của bạn để tìm những nghề nghiệp có mức độ tương thích cao và giải trình minh bạch."}
            </p>
          </div>
          <div className={styles["intro-column"]}>
            <div className={styles["intro-column__num"]}>
              {"03"}
            </div>
            <h3 className={styles["intro-column__title"]}>
              {"PHÁT TRIỂN"}
            </h3>
            <p className={styles["intro-column__p"]}>
              {"Tìm khoảng trống kỹ năng và xây dựng lộ trình để tiến gần hơn tới nghề nghiệp mục tiêu từng học kỳ."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeRiasec() {
  return (
    <section className={styles["aihn-riasec"] + " " + styles["section--light"]} data-home-surface="light" aria-label="Ví dụ kết quả RIASEC">
      <div className={styles["aihn-riasec__container"]}>
        <div className={styles["aihn-riasec__header"]}>
          <span className={styles["editorial-tag"]}>
            {"Báo cáo thấu hiểu bản thân"}
          </span>
          <h2 className={styles["editorial-statement"]}>
            {"Bạn không chỉ là một mã nghề nghiệp."}
          </h2>
          <p className={styles["demo-note"]}>
            {"Dữ liệu mẫu minh họa cách hiển thị, không phải hồ sơ hay khuyến nghị dành cho bạn."}
          </p>
        </div>
        <div className={styles["aihn-riasec__grid"]}>
          <div className={styles["riasec-bars-card"]}>
            <div className={styles["riasec-bar-unit"]}>
              <div className={styles["riasec-bar-header"]}>
                <div className={styles["riasec-bar-label"]}>
                  <span className={styles["riasec-bar-badge"]} style={{"background": "#06b6d4"}}>
                    {"I"}
                  </span>
                  <span>
                    {"Investigative — Nghiên cứu"}
                  </span>
                </div>
                <span className={styles["riasec-bar-score"]}>
                  {"92"}
                </span>
              </div>
              <div className={styles["riasec-bar-track"]}>
                <div className={styles["riasec-bar-fill"]} data-score="92" style={{"background": "#06b6d4", "width": "92%"}}>
                </div>
              </div>
            </div>
            <div className={styles["riasec-bar-unit"]}>
              <div className={styles["riasec-bar-header"]}>
                <div className={styles["riasec-bar-label"]}>
                  <span className={styles["riasec-bar-badge"]} style={{"background": "#ec4899"}}>
                    {"A"}
                  </span>
                  <span>
                    {"Artistic — Nghệ thuật"}
                  </span>
                </div>
                <span className={styles["riasec-bar-score"]}>
                  {"84"}
                </span>
              </div>
              <div className={styles["riasec-bar-track"]}>
                <div className={styles["riasec-bar-fill"]} data-score="84" style={{"background": "#ec4899", "width": "84%"}}>
                </div>
              </div>
            </div>
            <div className={styles["riasec-bar-unit"]}>
              <div className={styles["riasec-bar-header"]}>
                <div className={styles["riasec-bar-label"]}>
                  <span className={styles["riasec-bar-badge"]} style={{"background": "#3b82f6"}}>
                    {"S"}
                  </span>
                  <span>
                    {"Social — Xã hội"}
                  </span>
                </div>
                <span className={styles["riasec-bar-score"]}>
                  {"73"}
                </span>
              </div>
              <div className={styles["riasec-bar-track"]}>
                <div className={styles["riasec-bar-fill"]} data-score="73" style={{"background": "#3b82f6", "width": "73%"}}>
                </div>
              </div>
            </div>
            <div className={styles["riasec-bar-unit"]}>
              <div className={styles["riasec-bar-header"]}>
                <div className={styles["riasec-bar-label"]}>
                  <span className={styles["riasec-bar-badge"]} style={{"background": "#8b5cf6"}}>
                    {"E"}
                  </span>
                  <span>
                    {"Enterprising — Quản lý"}
                  </span>
                </div>
                <span className={styles["riasec-bar-score"]}>
                  {"56"}
                </span>
              </div>
              <div className={styles["riasec-bar-track"]}>
                <div className={styles["riasec-bar-fill"]} data-score="56" style={{"background": "#8b5cf6", "width": "56%"}}>
                </div>
              </div>
            </div>
            <div className={styles["riasec-bar-unit"]}>
              <div className={styles["riasec-bar-header"]}>
                <div className={styles["riasec-bar-label"]}>
                  <span className={styles["riasec-bar-badge"]} style={{"background": "#f59e0b"}}>
                    {"R"}
                  </span>
                  <span>
                    {"Realistic — Thực tế"}
                  </span>
                </div>
                <span className={styles["riasec-bar-score"]}>
                  {"42"}
                </span>
              </div>
              <div className={styles["riasec-bar-track"]}>
                <div className={styles["riasec-bar-fill"]} data-score="42" style={{"background": "#f59e0b", "width": "42%"}}>
                </div>
              </div>
            </div>
            <div className={styles["riasec-bar-unit"]}>
              <div className={styles["riasec-bar-header"]}>
                <div className={styles["riasec-bar-label"]}>
                  <span className={styles["riasec-bar-badge"]} style={{"background": "#94a3b8"}}>
                    {"C"}
                  </span>
                  <span>
                    {"Conventional — Nghiệp vụ"}
                  </span>
                </div>
                <span className={styles["riasec-bar-score"]}>
                  {"31"}
                </span>
              </div>
              <div className={styles["riasec-bar-track"]}>
                <div className={styles["riasec-bar-fill"]} data-score="31" style={{"background": "#94a3b8", "width": "31%"}}>
                </div>
              </div>
            </div>
            <div className={styles["riasec-topcode-banner"]}>
              <div>
                <div className={styles["topcode-tag"]}>
                  {"TopCode minh họa"}
                </div>
                <div className={styles["topcode-val"]}>
                  {"I • A • S"}
                </div>
              </div>
              <div style={{"fontSize": "13px", "color": "#575269", "textAlign": "right"}}>
                {"Người tư duy sáng tạo"}
                <br />
                {"định hướng con người"}
              </div>
            </div>
          </div>
          <div className={styles["riasec-insights-col"]}>
            <div className={styles["insight-block"]}>
              <h4 className={styles["insight-block__title"]}>
                {"Cách bạn tiếp cận vấn đề"}
              </h4>
              <p className={styles["insight-block__p"]}>
                {"Bạn thích đào sâu nguyên lý nền tảng thay vì chấp nhận giải pháp bề mặt. Khi gặp thử thách, bạn kết hợp dữ liệu khách quan với trực giác thẩm mỹ để tìm ra con đường độc đáo."}
              </p>
            </div>
            <div className={styles["insight-block"]}>
              <h4 className={styles["insight-block__title"]}>
                {"Môi trường làm việc thăng hoa"}
              </h4>
              <p className={styles["insight-block__p"]}>
                {"Bạn đạt phong độ cao nhất trong môi trường tôn trọng sự tự chủ, cho phép thử nghiệm cái mới và có không gian yên tĩnh để tập trung suy nghĩ sâu."}
              </p>
            </div>
            <div className={styles["insight-block"]}>
              <h4 className={styles["insight-block__title"]}>
                {"Phong cách cộng tác"}
              </h4>
              <p className={styles["insight-block__p"]}>
                {"Điểm Social (73) giúp bạn lắng nghe đồng nghiệp chân thành. Bạn đóng vai trò người kết nối tri thức kỹ thuật với cảm xúc của người dùng cuối."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeMatches() {
  return (
    <section className={styles["aihn-matches"] + " " + styles["section--dark"]} data-home-surface="dark" aria-label="Ví dụ khám phá nghề nghiệp">
      <div className={styles["aihn-matches__container"]}>
        <div className={styles["aihn-matches__header"]}>
          <span className={styles["editorial-tag"]}>
            {"Khớp nối nghề nghiệp thông minh"}
          </span>
          <h2 className={styles["editorial-statement"]}>
            {"Biết mình là ai."}
            <br />
            {"Tiếp theo là biết mình có thể trở thành ai."}
          </h2>
          <p className={styles["demo-note"]}>
            {"Dữ liệu mẫu minh họa cách hiển thị, không phải hồ sơ hay khuyến nghị dành cho bạn."}
          </p>
        </div>
        <div className={styles["aihn-matches__grid"]}>
          <div className={styles["editorial-career-card"]}>
            <div className={styles["career-card-top-row"]}>
              <span className={styles["career-category-tag"]}>
                {"Công nghệ & Phần mềm"}
              </span>
              <span className={styles["career-match-pill"]}>
                {"94 / 100"}
              </span>
            </div>
            <h3 className={styles["career-card-title"]}>
              {"Software Engineer"}
            </h3>
            <p className={styles["career-card-explanation"]}>
              {"Phát triển các hệ thống phần mềm mở rộng, tối ưu thuật toán và giải quyết các bài toán kỹ thuật phức tạp thông qua tư duy cấu trúc logic."}
            </p>
            <div className={styles["career-card-meta"]}>
              <div>
                <div className={styles["meta-col-label"]}>
                  {"Nhóm RIASEC minh họa"}
                </div>
                <div className={styles["meta-col-val"]} style={{"color": "#38bdf8"}}>
                  {"I • R • E (Rất cao)"}
                </div>
              </div>
              <div>
                <div className={styles["meta-col-label"]}>
                  {"Điểm kỹ năng minh họa"}
                </div>
                <div className={styles["meta-col-val"]} style={{"color": "#34d399"}}>
                  {"90 / 100"}
                </div>
              </div>
            </div>
          </div>
          <div className={styles["editorial-career-card"]}>
            <div className={styles["career-card-top-row"]}>
              <span className={styles["career-category-tag"]}>
                {"Thiết kế & Trải nghiệm"}
              </span>
              <span className={styles["career-match-pill"]}>
                {"89 / 100"}
              </span>
            </div>
            <h3 className={styles["career-card-title"]}>
              {"UX Designer"}
            </h3>
            <p className={styles["career-card-explanation"]}>
              {"Nghiên cứu hành vi người dùng, vẽ luồng trải nghiệm và thiết kế giao diện sản phẩm số kết hợp giữa tính thẩm mỹ và tiện ích thực tế."}
            </p>
            <div className={styles["career-card-meta"]}>
              <div>
                <div className={styles["meta-col-label"]}>
                  {"Nhóm RIASEC minh họa"}
                </div>
                <div className={styles["meta-col-val"]} style={{"color": "#ec4899"}}>
                  {"A • I • S (Rất cao)"}
                </div>
              </div>
              <div>
                <div className={styles["meta-col-label"]}>
                  {"Điểm kỹ năng minh họa"}
                </div>
                <div className={styles["meta-col-val"]} style={{"color": "#34d399"}}>
                  {"85 / 100"}
                </div>
              </div>
            </div>
          </div>
          <div className={styles["editorial-career-card"]}>
            <div className={styles["career-card-top-row"]}>
              <span className={styles["career-category-tag"]}>
                {"Dữ liệu & Phân tích"}
              </span>
              <span className={styles["career-match-pill"]}>
                {"87 / 100"}
              </span>
            </div>
            <h3 className={styles["career-card-title"]}>
              {"Data Analyst"}
            </h3>
            <p className={styles["career-card-explanation"]}>
              {"Khai phá tập dữ liệu kinh doanh, tìm ra xu hướng hành vi và chuyển hóa các số liệu thô thành thông điệp chiến lược rõ ràng cho tổ chức."}
            </p>
            <div className={styles["career-card-meta"]}>
              <div>
                <div className={styles["meta-col-label"]}>
                  {"Nhóm RIASEC minh họa"}
                </div>
                <div className={styles["meta-col-val"]} style={{"color": "#a78bfa"}}>
                  {"I • C • E (Cao)"}
                </div>
              </div>
              <div>
                <div className={styles["meta-col-label"]}>
                  {"Điểm kỹ năng minh họa"}
                </div>
                <div className={styles["meta-col-val"]} style={{"color": "#38bdf8"}}>
                  {"82 / 100"}
                </div>
              </div>
            </div>
          </div>
          <div className={styles["editorial-career-card"]}>
            <div className={styles["career-card-top-row"]}>
              <span className={styles["career-category-tag"]}>
                {"Sản phẩm & Đổi mới"}
              </span>
              <span className={styles["career-match-pill"]}>
                {"83 / 100"}
              </span>
            </div>
            <h3 className={styles["career-card-title"]}>
              {"Product Designer"}
            </h3>
            <p className={styles["career-card-explanation"]}>
              {"Dẫn dắt thiết kế từ tầm nhìn ý tưởng tới sản phẩm hoàn thiện, cân bằng giữa mục tiêu kinh doanh, tính khả thi công nghệ và nhu cầu con người."}
            </p>
            <div className={styles["career-card-meta"]}>
              <div>
                <div className={styles["meta-col-label"]}>
                  {"Nhóm RIASEC minh họa"}
                </div>
                <div className={styles["meta-col-val"]} style={{"color": "#f59e0b"}}>
                  {"A • E • S (Tương thích)"}
                </div>
              </div>
              <div>
                <div className={styles["meta-col-label"]}>
                  {"Điểm kỹ năng minh họa"}
                </div>
                <div className={styles["meta-col-val"]} style={{"color": "#38bdf8"}}>
                  {"80 / 100"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeSkillGap() {
  return (
    <section className={styles["aihn-skillgap"] + " " + styles["section--light"]} data-home-surface="light" aria-label="Ví dụ khoảng cách kỹ năng">
      <div className={styles["aihn-skillgap__container"]}>
        <div className={styles["aihn-skillgap__header"]}>
          <span className={styles["editorial-tag"]}>
            {"Khoảng trống năng lực"}
          </span>
          <h2 className={styles["editorial-statement"]}>
            {"Từ nghề nghiệp mong muốn đến những gì bạn cần học."}
          </h2>
          <p className={styles["demo-note"]}>
            {"Dữ liệu mẫu minh họa cách hiển thị, không phải hồ sơ hay khuyến nghị dành cho bạn."}
          </p>
        </div>
        <div className={styles["skillgap-comparison-board"]}>
          <div>
            <h3 className={styles["skill-col-heading"]}>
              <span style={{"color": "#166534"}}>
                {"✓"}
              </span>
              <span>
                {"TỰ ĐÁNH GIÁ · VÍ DỤ"}
              </span>
            </h3>
            <div className={styles["skill-items-list"]}>
              <div className={styles["skill-item-pill"] + " " + styles["have"]}>
                <span>
                  {"✓"}
                </span>
                <span>
                  {"Tư duy giải quyết vấn đề (Problem Solving)"}
                </span>
              </div>
              <div className={styles["skill-item-pill"] + " " + styles["have"]}>
                <span>
                  {"✓"}
                </span>
                <span>
                  {"Giao tiếp & Truyền đạt ý tưởng (Communication)"}
                </span>
              </div>
              <div className={styles["skill-item-pill"] + " " + styles["have"]}>
                <span>
                  {"✓"}
                </span>
                <span>
                  {"Lập trình cơ bản (Basic Programming)"}
                </span>
              </div>
            </div>
          </div>
          <div className={styles["skillgap-bridge"]}>
            <div className={styles["bridge-icon-circle"]}>
              {"→"}
            </div>
            <div className={styles["bridge-connector-line"]}>
            </div>
            <span style={{"fontSize": "11px", "fontWeight": "700", "color": "#858099", "textTransform": "uppercase"}}>
              {"LỘ TRÌNH"}
            </span>
          </div>
          <div>
            <h3 className={styles["skill-col-heading"]}>
              <span style={{"color": "#86198f"}}>
                {"○"}
              </span>
              <span>
                {"CẦN PHÁT TRIỂN · VÍ DỤ"}
              </span>
            </h3>
            <div className={styles["skill-items-list"]}>
              <div className={styles["skill-item-pill"] + " " + styles["develop"]}>
                <span>
                  {"○"}
                </span>
                <span>
                  {"Cấu trúc Dữ liệu & Giải thuật (Data Structures)"}
                </span>
              </div>
              <div className={styles["skill-item-pill"] + " " + styles["develop"]}>
                <span>
                  {"○"}
                </span>
                <span>
                  {"Thiết kế Kiến trúc Hệ thống (System Design)"}
                </span>
              </div>
              <div className={styles["skill-item-pill"] + " " + styles["develop"]}>
                <span>
                  {"○"}
                </span>
                <span>
                  {"Điện toán Đám mây & CI/CD (Cloud)"}
                </span>
              </div>
              <div className={styles["skill-item-pill"] + " " + styles["develop"]}>
                <span>
                  {"○"}
                </span>
                <span>
                  {"Tiếng Anh Chuyên ngành (English B2+)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeRoadmap() {
  return (
    <section className={styles["aihn-roadmap"] + " " + styles["section--dark"]} data-home-surface="dark" aria-label="Ví dụ lộ trình phát triển">
      <div className={styles["aihn-roadmap__container"]}>
        <div className={styles["aihn-roadmap__header"]}>
          <span className={styles["editorial-tag"]}>
            {"Lộ trình rèn luyện"}
          </span>
          <h2 className={styles["editorial-statement"]}>
            {"Biến định hướng thành một con đường có thể thực hiện."}
          </h2>
          <p className={styles["demo-note"]}>
            {"Dữ liệu mẫu minh họa cách hiển thị, không phải hồ sơ hay khuyến nghị dành cho bạn."}
          </p>
        </div>
        <div className={styles["vertical-roadmap-path"]}>
          <div className={styles["roadmap-backbone-line"]}>
          </div>
          <div className={styles["roadmap-progress-fill"]}>
          </div>
          <div className={styles["roadmap-milestone"] + " " + styles["active"]}>
            <div className={styles["milestone-node-dot"]}>
            </div>
            <div className={styles["milestone-phase"]}>
              {"ĐIỂM XUẤT PHÁT • HIỆN TẠI"}
            </div>
            <h3 className={styles["milestone-title"]}>
              {"Xác định mục tiêu: Backend Developer"}
            </h3>
            <p className={styles["milestone-desc"]}>
              {"Hoàn thành đánh giá Holland RIASEC (TopCode: IAS). Chọn ngành Kỹ thuật Phần mềm làm hướng đi chiến lược."}
            </p>
          </div>
          <div className={styles["roadmap-milestone"] + " " + styles["active"]}>
            <div className={styles["milestone-node-dot"]}>
            </div>
            <div className={styles["milestone-phase"]}>
              {"GIAI ĐOẠN 01 • NỀN TẢNG CỐT LÕI"}
            </div>
            <h3 className={styles["milestone-title"]}>
              {"Java Fundamentals & Tư duy Hướng đối tượng (OOP)"}
            </h3>
            <p className={styles["milestone-desc"]}>
              {"Nắm vững cấu trúc ngôn ngữ, bộ nhớ, Exception Handling và các mẫu thiết kế hướng đối tượng kinh điển."}
            </p>
          </div>
          <div className={styles["roadmap-milestone"]}>
            <div className={styles["milestone-node-dot"]}>
            </div>
            <div className={styles["milestone-phase"]}>
              {"GIAI ĐOẠN 02 • THỰC HÀNH SẢN PHẨM"}
            </div>
            <h3 className={styles["milestone-title"]}>
              {"Xây dựng Backend Project & RESTful API"}
            </h3>
            <p className={styles["milestone-desc"]}>
              {"Triển khai dự án quản lý thông tin với kiến trúc 3 tầng, authentication JWT và tài liệu Swagger."}
            </p>
          </div>
          <div className={styles["roadmap-milestone"]}>
            <div className={styles["milestone-node-dot"]}>
            </div>
            <div className={styles["milestone-phase"]}>
              {"GIAI ĐOẠN 03 • DỮ LIỆU & HIỆU NĂNG"}
            </div>
            <h3 className={styles["milestone-title"]}>
              {"Database & Tối ưu hóa Truy vấn"}
            </h3>
            <p className={styles["milestone-desc"]}>
              {"Thiết kế schema chuẩn hóa trong PostgreSQL/MySQL, đánh chỉ mục Indexing và kiểm soát Transaction an toàn."}
            </p>
          </div>
          <div className={styles["roadmap-milestone"]}>
            <div className={styles["milestone-node-dot"]}>
            </div>
            <div className={styles["milestone-phase"]}>
              {"GIAI ĐOẠN 04 • ENTERPRISE READY"}
            </div>
            <h3 className={styles["milestone-title"]}>
              {"Spring Boot & Microservices Architecture"}
            </h3>
            <p className={styles["milestone-desc"]}>
              {"Ứng dụng Spring Security, Message Queue (Kafka/RabbitMQ) và container hóa Docker cho môi trường sản xuất."}
            </p>
          </div>
          <div className={styles["roadmap-milestone"]}>
            <div className={styles["milestone-node-dot"]}>
            </div>
            <div className={styles["milestone-phase"]}>
              {"GIAI ĐOẠN 05 • GIA NHẬP DOANH NGHIỆP"}
            </div>
            <h3 className={styles["milestone-title"]}>
              {"Chuẩn bị Hồ sơ Thực tập & Phỏng vấn Kỹ thuật"}
            </h3>
            <p className={styles["milestone-desc"]}>
              {"Hoàn thiện CV công nghệ, ôn luyện LeetCode Medium và phỏng vấn mô phỏng cùng Cố vấn AIHN."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeAdvisor() {
  return (
    <section className={styles["aihn-advisor"] + " " + styles["section--light"]} data-home-surface="light" aria-label="Ví dụ giao diện Cố vấn AI">
      <div className={styles["aihn-advisor__container"]}>
        <div className={styles["aihn-advisor__header"]}>
          <span className={styles["editorial-tag"]}>
            {"Cố vấn theo ngữ cảnh"}
          </span>
          <h2 className={styles["editorial-statement"]}>
            {"Một cố vấn hiểu hành trình của riêng bạn."}
          </h2>
          <p className={styles["demo-note"]}>
            {"Dữ liệu mẫu minh họa cách hiển thị, không phải hồ sơ hay khuyến nghị dành cho bạn."}
          </p>
        </div>
        <div className={styles["advisor-context-chips-row"]}>
          <div className={styles["context-chip"]}>
            {"Mã RIASEC:"}
            <strong>
              {"IAS"}
            </strong>
          </div>
          <div className={styles["context-chip"]}>
            {"Mục tiêu:"}
            <strong>
              {"Backend Developer"}
            </strong>
          </div>
          <div className={styles["context-chip"]}>
            {"Tiến độ Lộ trình:"}
            <strong>
              {"42%"}
            </strong>
          </div>
          <div className={styles["context-chip"]}>
            {"Trọng tâm:"}
            <strong>
              {"Data Structures"}
            </strong>
          </div>
        </div>
        <div className={styles["advisor-chat-interface"]}>
          <div className={styles["chat-history-flow"]}>
            <div className={styles["chat-bubble-editorial"] + " " + styles["bot"]}>
              {"Cố vấn AIHN sử dụng kết quả Holland, kỹ năng tự đánh giá và mục tiêu bạn đã lưu để bổ sung ngữ cảnh."}
            </div>
            <div className={styles["chat-bubble-editorial"] + " " + styles["user"]}>
              {"Tôi nên bắt đầu từ kỹ năng nào cho nghề mục tiêu?"}
            </div>
            <div className={styles["chat-bubble-editorial"] + " " + styles["bot"]}>
              {"Bạn có thể trao đổi về lý do gợi ý nghề, khoảng cách kỹ năng và những bước tiếp theo. Mở Cố vấn AI để bắt đầu hội thoại từ hồ sơ của bạn."}
            </div>
          </div>
          <div className={styles["chat-suggested-prompts"]}>
            <Link className={styles["prompt-btn"]} to={paths.advisor} aria-label="Tại sao Software Engineer phù hợp với mình? — mở Cố vấn AI">
              {"Tại sao Software Engineer phù hợp với mình?"}
            </Link>
            <Link className={styles["prompt-btn"]} to={paths.advisor} aria-label="Mình đang thiếu kỹ năng gì? — mở Cố vấn AI">
              {"Mình đang thiếu kỹ năng gì?"}
            </Link>
            <Link className={styles["prompt-btn"]} to={paths.advisor} aria-label="Trong 6 tháng tới mình nên học gì? — mở Cố vấn AI">
              {"Trong 6 tháng tới mình nên học gì?"}
            </Link>
            <Link className={styles["prompt-btn"]} to={paths.advisor} aria-label="Backend hay Data Analyst phù hợp hơn? — mở Cố vấn AI">
              {"Backend hay Data Analyst phù hợp hơn?"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeTrust() {
  return (
    <section className={styles["aihn-trust"] + " " + styles["section--dark"]} data-home-surface="dark">
      <div className={styles["aihn-trust__container"]}>
        <div className={styles["aihn-trust__header"]}>
          <span className={styles["editorial-tag"]}>
            {"Cơ sở lý luận & Độ tin cậy"}
          </span>
          <h2 className={styles["editorial-statement"]}>
            {"Hiểu rõ cơ sở của mỗi bước định hướng."}
          </h2>
        </div>
        <div className={styles["aihn-trust__grid"]}>
          <div className={styles["trust-card"]}>
            <div className={styles["trust-card__tag"]}>
              {"NỀN TẢNG KHOA HỌC"}
            </div>
            <h3 className={styles["trust-card__heading"]}>
              {"RIASEC FOUNDATION"}
            </h3>
            <p className={styles["trust-card__p"]}>
              {"Tham khảo mô hình Holland RIASEC để khám phá sở thích nghề nghiệp. Bộ câu hỏi của đồ án chưa được thẩm định tâm lý trên một mẫu đại diện học sinh Việt Nam."}
            </p>
          </div>
          <div className={styles["trust-card"]}>
            <div className={styles["trust-card__tag"]}>
              {"MINH BẠCH DỮ LIỆU"}
            </div>
            <h3 className={styles["trust-card__heading"]}>
              {"EXPLAINABLE MATCHING"}
            </h3>
            <p className={styles["trust-card__p"]}>
              {"Chúng tôi không đưa ra những con số vô căn cứ. Điểm xếp hạng được giải thích từ những tín hiệu hiện có như sở thích và kỹ năng tự đánh giá, kèm thông tin còn thiếu."}
            </p>
          </div>
          <div className={styles["trust-card"]}>
            <div className={styles["trust-card__tag"]}>
              {"TIẾP NỐI LIÊN TỤC"}
            </div>
            <h3 className={styles["trust-card__heading"]}>
              {"PERSONAL CONTEXT"}
            </h3>
            <p className={styles["trust-card__p"]}>
              {"Các khuyến nghị không cố định mà tiến hóa liên tục cùng bạn dựa trên kết quả trắc nghiệm, kỹ năng mới tích lũy và những mục tiêu bạn đạt được trên chặng đường rèn luyện."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeFinalCta() {
  return (
    <section className={styles["aihn-final-cta"] + " " + styles["section--dark"]} data-home-surface="dark">
      <div className={styles["aihn-final-cta__container"]}>
        <h2 className={styles["final-cta-headline"]}>
          {"Con đường phù hợp"}
          <br />
          {"bắt đầu từ việc hiểu chính mình."}
        </h2>
        <p className={styles["final-cta-sub"]}>
          {"Bắt đầu với bài đánh giá Holland RIASEC với câu trả lời Có / Không hoàn toàn miễn phí."}
        </p>
        <div>
          <Link className={styles["btn-editorial-primary"]} to={paths.assessment} style={{"fontSize": "18px", "padding": "18px 48px"}}>
            <span>
              {"Khám phá ngay"}
            </span>
            <svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeFooter() {
  return (
    <footer className={styles["aihn-footer"]}>
      <div className={styles["aihn-footer__container"]}>
        <div style={{"display": "flex", "alignItems": "center", "gap": "12px"}}>
          <div className={styles["nav-brand-mark"]} style={{"width": "30px", "height": "30px", "fontSize": "12px"}}>
            {"AI"}
          </div>
          <span style={{"fontFamily": "var(--font-family-serif)", "fontSize": "18px", "color": "#ffffff"}}>
            {"AIHN Career"}
          </span>
        </div>
        <ul className={styles["footer-nav-links"]}>
          <li>
            <Link to={paths.assessment}>
              {"Trắc nghiệm Holland"}
            </Link>
          </li>
          <li>
            <Link to={paths.careers}>
              {"Thư viện nghề nghiệp"}
            </Link>
          </li>
          <li>
            <Link to={paths.roadmap}>
              {"Lộ trình học tập"}
            </Link>
          </li>
          <li>
            <Link to={paths.advisor}>
              {"Cố vấn AI"}
            </Link>
          </li>
          <li>
            <Link to={paths.login}>
              {"Đăng nhập"}
            </Link>
          </li>
        </ul>
        <div className={styles["footer-copyright"]}>
          {"© 2026 AIHN Career Platform. All rights reserved."}
        </div>
      </div>
    </footer>
  );
}
