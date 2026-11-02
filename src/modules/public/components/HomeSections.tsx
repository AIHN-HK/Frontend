import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import styles from '../pages/HomePage.module.css';

export function HomeHero() {
  return (
    <section className={styles["aihn-hero"] + " " + styles["section--dark"]} data-home-surface="dark" aria-label="Tìm hướng đi của bạn">
      <div className={styles["aihn-hero__container"]}>
        <div className={styles["aihn-hero__content"]}>
          <div className={styles["hero-pill-badge"]}>
            <span>
              {"Bắt đầu bằng Holland RIASEC"}
            </span>
          </div>
          <h1 className={styles["aihn-hero__title"]}>
            <span data-home-title-line="">{"Hiểu mình trước"}</span>
            <br />
            <em data-home-title-line="">
              {"khi chọn đường."}
            </em>
          </h1>
          <p className={styles["aihn-hero__desc"]}>
            {"Nhìn lại điều bạn thích, tìm hiểu nghề và chọn một bước để bắt đầu."}
          </p>
          <div className={styles["aihn-hero__actions"]}>
            <Link className={styles["btn-editorial-primary"]} to={paths.assessment}>
              <span>
                {"Bắt đầu"}
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
            {"Giao diện mẫu · Không phải kết quả của bạn"}
          </p>
          <div className={styles["aihn-journey-stack"]}>
            <div className={styles["journey-card"]}>
              <div className={styles["journey-card-header"]}>
                <span className={styles["journey-step-tag"]}>
                  {"Nghề minh họa"}
                </span>
                <span className={styles["journey-match-badge"]}>
                  {"94 / 100"}
                </span>
              </div>
              <h3 className={styles["journey-card-title"]}>
                {"Kỹ sư phần mềm"}
              </h3>
              <p className={styles["journey-card-desc"]}>
                {"Thiết kế hệ thống và giải các bài toán bằng phần mềm."}
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
                  {"Thiết kế và con người"}
                </span>
                <span className={styles["journey-match-badge"]} style={{"color": "#38bdf8", "background": "rgba(56, 189, 248, 0.18)", "borderColor": "rgba(56, 189, 248, 0.35)"}}>
                  {"89 / 100"}
                </span>
              </div>
              <h3 className={styles["journey-card-title"]}>
                {"Thiết kế trải nghiệm"}
              </h3>
              <p className={styles["journey-card-desc"]}>
                {"Tìm hiểu người dùng để thiết kế trải nghiệm dễ sử dụng."}
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
                  {"Dữ liệu và quyết định"}
                </span>
                <span className={styles["journey-match-badge"]} style={{"color": "#a78bfa", "background": "rgba(167, 139, 250, 0.18)", "borderColor": "rgba(167, 139, 250, 0.35)"}}>
                  {"86 / 100"}
                </span>
              </div>
              <h3 className={styles["journey-card-title"]}>
                {"Phân tích dữ liệu"}
              </h3>
              <p className={styles["journey-card-desc"]}>
                {"Phân tích dữ liệu để hiểu vấn đề và hỗ trợ quyết định."}
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
            {"Cách AIHN giúp bạn"}
          </span>
          <h2 className={styles["editorial-statement"]}>
            {"Chọn nghề cũng cần hiểu lý do."}
          </h2>
        </div>
        <div className={styles["aihn-intro__grid"]}>
          <div className={styles["intro-column"]}>
            <div className={styles["intro-column__num"]}>
              {"01"}
            </div>
            <h3 className={styles["intro-column__title"]}>
              {"HIỂU MÌNH"}
            </h3>
            <p className={styles["intro-column__p"]}>
              {"Nhận ra những hoạt động và cách làm việc bạn yêu thích qua Holland RIASEC."}
            </p>
          </div>
          <div className={styles["intro-column"]}>
            <div className={styles["intro-column__num"]}>
              {"02"}
            </div>
            <h3 className={styles["intro-column__title"]}>
              {"HIỂU NGHỀ"}
            </h3>
            <p className={styles["intro-column__p"]}>
              {"Tìm hiểu những nghề gần với sở thích, kỹ năng của bạn và lý do được gợi ý."}
            </p>
          </div>
          <div className={styles["intro-column"]}>
            <div className={styles["intro-column__num"]}>
              {"03"}
            </div>
            <h3 className={styles["intro-column__title"]}>
              {"THỬ TỪNG BƯỚC"}
            </h3>
            <p className={styles["intro-column__p"]}>
              {"Nhìn lại kỹ năng đang có, chọn điều cần học và chia thành từng bước."}
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
            {"Sở thích của bạn"}
          </span>
          <h2 className={styles["editorial-statement"]}>
            {"Một góc nhìn để hiểu mình hơn."}
          </h2>
          <p className={styles["demo-note"]}>
            {"Dữ liệu minh họa · Không phải kết quả hay gợi ý của bạn."}
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
                    {"Nghiên cứu (I)"}
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
                    {"Nghệ thuật (A)"}
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
                    {"Xã hội (S)"}
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
                    {"Quản lý (E)"}
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
                    {"Thực tế (R)"}
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
                    {"Nghiệp vụ (C)"}
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
              <div style={{"fontSize": "var(--text-sm)", "color": "#575269", "textAlign": "right"}}>
                {"Tìm hiểu, sáng tạo"}
                <br />
                {"và làm việc cùng người khác"}
              </div>
            </div>
          </div>
          <div className={styles["riasec-insights-col"]}>
            <div className={styles["insight-block"]}>
              <h4 className={styles["insight-block__title"]}>
                {"Cách bạn tiếp cận vấn đề"}
              </h4>
              <p className={styles["insight-block__p"]}>
                {"Trong ví dụ này, nhóm Nghiên cứu và Nghệ thuật gợi ý sở thích tìm nguyên nhân và thử cách làm mới."}
              </p>
            </div>
            <div className={styles["insight-block"]}>
              <h4 className={styles["insight-block__title"]}>
                {"Môi trường đáng thử"}
              </h4>
              <p className={styles["insight-block__p"]}>
                {"Công việc có khoảng riêng để tập trung và thử ý tưởng có thể là một hướng tìm hiểu."}
              </p>
            </div>
            <div className={styles["insight-block"]}>
              <h4 className={styles["insight-block__title"]}>
                {"Cách làm việc cùng nhau"}
              </h4>
              <p className={styles["insight-block__p"]}>
                {"Nhóm Xã hội gợi ý sự quan tâm đến con người. Trải nghiệm thực tế sẽ giúp hiểu rõ hơn cách cộng tác."}
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
    <section className={styles["aihn-matches"] + " " + styles["section--dark"]} data-home-surface="dark" aria-label="Ví dụ nghề nên tìm hiểu">
      <div className={styles["aihn-matches__container"]}>
        <div className={styles["aihn-matches__header"]}>
          <span className={styles["editorial-tag"]}>
            {"Những hướng đáng cân nhắc"}
          </span>
          <h2 className={styles["editorial-statement"]}>
            {"Có nhiều hướng đáng để bạn thử."}
          </h2>
          <p className={styles["demo-note"]}>
            {"Dữ liệu minh họa · Không phải kết quả hay gợi ý của bạn."}
          </p>
        </div>
        <div className={styles["aihn-matches__grid"]}>
          <div className={styles["editorial-career-card"]}>
            <div className={styles["career-card-top-row"]}>
              <span className={styles["career-category-tag"]}>
                {"Công nghệ và phần mềm"}
              </span>
              <span className={styles["career-match-pill"]}>
                {"94 / 100"}
              </span>
            </div>
            <h3 className={styles["career-card-title"]}>
              {"Kỹ sư phần mềm"}
            </h3>
            <p className={styles["career-card-explanation"]}>
              {"Xây dựng phần mềm, tổ chức hệ thống và giải quyết vấn đề kỹ thuật."}
            </p>
            <div className={styles["career-card-meta"]}>
              <div>
                <div className={styles["meta-col-label"]}>
                  {"Nhóm RIASEC minh họa"}
                </div>
                <div className={styles["meta-col-val"]} style={{"color": "#38bdf8"}}>
                  {"I • R • E"}
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
                {"Thiết kế và trải nghiệm"}
              </span>
              <span className={styles["career-match-pill"]}>
                {"89 / 100"}
              </span>
            </div>
            <h3 className={styles["career-card-title"]}>
              {"Thiết kế trải nghiệm"}
            </h3>
            <p className={styles["career-card-explanation"]}>
              {"Tìm hiểu người dùng và thiết kế giao diện rõ ràng, dễ sử dụng."}
            </p>
            <div className={styles["career-card-meta"]}>
              <div>
                <div className={styles["meta-col-label"]}>
                  {"Nhóm RIASEC minh họa"}
                </div>
                <div className={styles["meta-col-val"]} style={{"color": "#ec4899"}}>
                  {"A • I • S"}
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
                {"Dữ liệu và phân tích"}
              </span>
              <span className={styles["career-match-pill"]}>
                {"87 / 100"}
              </span>
            </div>
            <h3 className={styles["career-card-title"]}>
              {"Phân tích dữ liệu"}
            </h3>
            <p className={styles["career-card-explanation"]}>
              {"Tìm quy luật trong dữ liệu và trình bày điều có ích cho quyết định."}
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
                {"Thiết kế sản phẩm"}
              </span>
              <span className={styles["career-match-pill"]}>
                {"83 / 100"}
              </span>
            </div>
            <h3 className={styles["career-card-title"]}>
              {"Thiết kế sản phẩm"}
            </h3>
            <p className={styles["career-card-explanation"]}>
              {"Phát triển ý tưởng thành sản phẩm, cân nhắc nhu cầu người dùng và khả năng thực hiện."}
            </p>
            <div className={styles["career-card-meta"]}>
              <div>
                <div className={styles["meta-col-label"]}>
                  {"Nhóm RIASEC minh họa"}
                </div>
                <div className={styles["meta-col-val"]} style={{"color": "#f59e0b"}}>
                  {"A • E • S"}
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
            {"Kỹ năng cần rèn thêm"}
          </span>
          <h2 className={styles["editorial-statement"]}>
            {"Biết mình cần học thêm gì."}
          </h2>
          <p className={styles["demo-note"]}>
            {"Dữ liệu minh họa · Không phải kết quả hay gợi ý của bạn."}
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
                  {"Giải quyết vấn đề"}
                </span>
              </div>
              <div className={styles["skill-item-pill"] + " " + styles["have"]}>
                <span>
                  {"✓"}
                </span>
                <span>
                  {"Giao tiếp và trình bày ý tưởng"}
                </span>
              </div>
              <div className={styles["skill-item-pill"] + " " + styles["have"]}>
                <span>
                  {"✓"}
                </span>
                <span>
                  {"Lập trình cơ bản"}
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
            <span style={{"fontSize": "var(--text-xs)", "fontWeight": "700", "color": "#858099", "textTransform": "uppercase"}}>
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
                  {"Cấu trúc dữ liệu và giải thuật"}
                </span>
              </div>
              <div className={styles["skill-item-pill"] + " " + styles["develop"]}>
                <span>
                  {"○"}
                </span>
                <span>
                  {"Thiết kế hệ thống"}
                </span>
              </div>
              <div className={styles["skill-item-pill"] + " " + styles["develop"]}>
                <span>
                  {"○"}
                </span>
                <span>
                  {"Điện toán đám mây và CI/CD"}
                </span>
              </div>
              <div className={styles["skill-item-pill"] + " " + styles["develop"]}>
                <span>
                  {"○"}
                </span>
                <span>
                  {"Tiếng Anh chuyên ngành (B2+)"}
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
            {"Con đường phía trước"}
          </span>
          <h2 className={styles["editorial-statement"]}>
            {"Mỗi bước đều có thể bắt đầu."}
          </h2>
          <p className={styles["demo-note"]}>
            {"Dữ liệu minh họa · Không phải kết quả hay gợi ý của bạn."}
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
              {"Chọn mục tiêu: lập trình backend"}
            </h3>
            <p className={styles["milestone-desc"]}>
              {"Xem kết quả Holland, tìm hiểu nghề và chọn kỹ thuật phần mềm làm mục tiêu thử sức."}
            </p>
          </div>
          <div className={styles["roadmap-milestone"] + " " + styles["active"]}>
            <div className={styles["milestone-node-dot"]}>
            </div>
            <div className={styles["milestone-phase"]}>
              {"GIAI ĐOẠN 01 • NỀN TẢNG"}
            </div>
            <h3 className={styles["milestone-title"]}>
              {"Java và lập trình hướng đối tượng"}
            </h3>
            <p className={styles["milestone-desc"]}>
              {"Học cú pháp Java, bộ nhớ, xử lý lỗi và các mẫu thiết kế cơ bản."}
            </p>
          </div>
          <div className={styles["roadmap-milestone"]}>
            <div className={styles["milestone-node-dot"]}>
            </div>
            <div className={styles["milestone-phase"]}>
              {"GIAI ĐOẠN 02 • THỰC HÀNH SẢN PHẨM"}
            </div>
            <h3 className={styles["milestone-title"]}>
              {"Làm dự án backend và RESTful API"}
            </h3>
            <p className={styles["milestone-desc"]}>
              {"Làm ứng dụng quản lý với kiến trúc 3 tầng, xác thực JWT và tài liệu Swagger."}
            </p>
          </div>
          <div className={styles["roadmap-milestone"]}>
            <div className={styles["milestone-node-dot"]}>
            </div>
            <div className={styles["milestone-phase"]}>
              {"GIAI ĐOẠN 03 • DỮ LIỆU & HIỆU NĂNG"}
            </div>
            <h3 className={styles["milestone-title"]}>
              {"Cơ sở dữ liệu và truy vấn"}
            </h3>
            <p className={styles["milestone-desc"]}>
              {"Thiết kế bảng trong PostgreSQL hoặc MySQL, học chỉ mục và giao dịch."}
            </p>
          </div>
          <div className={styles["roadmap-milestone"]}>
            <div className={styles["milestone-node-dot"]}>
            </div>
            <div className={styles["milestone-phase"]}>
              {"GIAI ĐOẠN 04 • VẬN HÀNH"}
            </div>
            <h3 className={styles["milestone-title"]}>
              {"Spring Boot và microservices"}
            </h3>
            <p className={styles["milestone-desc"]}>
              {"Thử Spring Security, hàng đợi tin nhắn và đóng gói ứng dụng bằng Docker."}
            </p>
          </div>
          <div className={styles["roadmap-milestone"]}>
            <div className={styles["milestone-node-dot"]}>
            </div>
            <div className={styles["milestone-phase"]}>
              {"GIAI ĐOẠN 05 • TÌM NƠI THỰC TẬP"}
            </div>
            <h3 className={styles["milestone-title"]}>
              {"Chuẩn bị CV và phỏng vấn"}
            </h3>
            <p className={styles["milestone-desc"]}>
              {"Viết CV, luyện bài tập kỹ thuật và tập trả lời phỏng vấn cùng AIHN."}
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
            {"Hỏi AIHN"}
          </span>
          <h2 className={styles["editorial-statement"]}>
            {"Cùng gỡ từng điều còn phân vân."}
          </h2>
          <p className={styles["demo-note"]}>
            {"Dữ liệu minh họa · Không phải kết quả hay gợi ý của bạn."}
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
              {"Lập trình backend"}
            </strong>
          </div>
          <div className={styles["context-chip"]}>
            {"Tiến độ:"}
            <strong>
              {"42%"}
            </strong>
          </div>
          <div className={styles["context-chip"]}>
            {"Trọng tâm:"}
            <strong>
              {"Cấu trúc dữ liệu"}
            </strong>
          </div>
        </div>
        <div className={styles["advisor-chat-interface"]}>
          <div className={styles["chat-history-flow"]}>
            <div className={styles["chat-bubble-editorial"] + " " + styles["bot"]}>
              {"AIHN dựa vào kết quả Holland, kỹ năng và mục tiêu bạn đã lưu khi trao đổi."}
            </div>
            <div className={styles["chat-bubble-editorial"] + " " + styles["user"]}>
              {"Mình nên học kỹ năng nào trước?"}
            </div>
            <div className={styles["chat-bubble-editorial"] + " " + styles["bot"]}>
              {"Hãy bắt đầu từ kỹ năng còn cần rèn cho nghề mục tiêu. Bạn có thể cùng AIHN xem lại hồ sơ và chọn bước tiếp theo."}
            </div>
          </div>
          <div className={styles["chat-suggested-prompts"]}>
            <Link className={styles["prompt-btn"]} to={paths.advisor}>
              {"Vì sao nghề kỹ sư phần mềm được gợi ý?"}
            </Link>
            <Link className={styles["prompt-btn"]} to={paths.advisor}>
              {"Mình nên rèn thêm kỹ năng gì?"}
            </Link>
            <Link className={styles["prompt-btn"]} to={paths.advisor}>
              {"Sáu tháng tới nên học gì?"}
            </Link>
            <Link className={styles["prompt-btn"]} to={paths.advisor}>
              {"Nên thử backend hay phân tích dữ liệu?"}
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
            {"Cơ sở của gợi ý"}
          </span>
          <h2 className={styles["editorial-statement"]}>
            {"Mỗi gợi ý đều cần có lý do."}
          </h2>
        </div>
        <div className={styles["aihn-trust__grid"]}>
          <div className={styles["trust-card"]}>
            <div className={styles["trust-card__tag"]}>
              {"MÔ HÌNH THAM KHẢO"}
            </div>
            <h3 className={styles["trust-card__heading"]}>
              {"Holland RIASEC"}
            </h3>
            <p className={styles["trust-card__p"]}>
              {"AIHN tham khảo Holland RIASEC để tìm hiểu sở thích nghề. Bộ câu hỏi chưa được thẩm định tâm lý trên mẫu đại diện học sinh Việt Nam."}
            </p>
          </div>
          <div className={styles["trust-card"]}>
            <div className={styles["trust-card__tag"]}>
              {"MINH BẠCH DỮ LIỆU"}
            </div>
            <h3 className={styles["trust-card__heading"]}>
              {"Lý do gợi ý nghề"}
            </h3>
            <p className={styles["trust-card__p"]}>
              {"Điểm xếp hạng dựa trên sở thích và kỹ năng tự đánh giá. Bạn có thể xem cách tính và thông tin còn thiếu."}
            </p>
          </div>
          <div className={styles["trust-card"]}>
            <div className={styles["trust-card__tag"]}>
              {"THEO HỒ SƠ CỦA BẠN"}
            </div>
            <h3 className={styles["trust-card__heading"]}>
              {"Hồ sơ và mục tiêu"}
            </h3>
            <p className={styles["trust-card__p"]}>
              {"Khi sở thích, kỹ năng hay mục tiêu thay đổi, bạn có thể cập nhật hồ sơ và tạo gợi ý mới."}
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
          {"Chưa cần biết hết để bắt đầu."}
        </h2>
        <p className={styles["final-cta-sub"]}>
          {"Một bài Holland RIASEC với câu trả lời Có / Không. Miễn phí, không cần tài khoản."}
        </p>
        <div>
          <Link className={styles["btn-editorial-primary"]} to={paths.assessment} style={{"fontSize": "var(--text-md)", "padding": "18px 48px"}}>
            <span>
              {"Bắt đầu"}
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
          <div className={styles["nav-brand-mark"]} style={{"width": "30px", "height": "30px", "fontSize": "var(--text-sm)"}}>
            {"AI"}
          </div>
          <span style={{"fontFamily": "var(--font-family-serif)", "fontSize": "var(--text-md)", "color": "#ffffff"}}>
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
              {"Danh mục nghề"}
            </Link>
          </li>
          <li>
            <Link to={paths.roadmap}>
              {"Lộ trình"}
            </Link>
          </li>
          <li>
            <Link to={paths.advisor}>
              {"Hỏi AIHN"}
            </Link>
          </li>
          <li>
            <Link to={paths.login}>
              {"Đăng nhập"}
            </Link>
          </li>
        </ul>
        <div className={styles["footer-copyright"]}>
          {"© 2026 AIHN Career."}
        </div>
      </div>
    </footer>
  );
}
