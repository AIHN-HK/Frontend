import { useState } from 'react';
import styles from '../pages/HomePage.module.css';

export function HomeStoryViews({active,id}:{active:number;id:string}) {
  return (
    <div className={styles["story-visual-col"]}>
      <div className={styles["story-visual-sticky"]}>
        <p className={styles["demo-note"]}>
          {"Ví dụ giao diện · Dữ liệu mẫu"}
        </p>
        <div hidden={active !== 0} id={`${id}-view-0`} role="region" aria-label="Minh họa bước 1" className={styles["product-story-view"] + " " + (active === 0 ? styles.active : "")} data-step="0">
          <AssessmentDemo />
        </div>
        <div hidden={active !== 1} id={`${id}-view-1`} role="region" aria-label="Minh họa bước 2" className={styles["product-story-view"] + " " + (active === 1 ? styles.active : "")} data-step="1">
          <div className={styles["riasec-result-mock"]}>
            <div style={{"fontSize": "12px", "fontWeight": "700", "color": "#7a74cb", "textTransform": "uppercase", "marginBottom": "12px"}}>
              {"Hồ sơ minh họa"}
            </div>
            <h4 style={{"fontFamily": "var(--font-family-serif)", "fontSize": "24px", "color": "#ffffff", "marginBottom": "20px"}}>
              {"TopCode minh họa: I • A • S"}
            </h4>
            <div style={{"display": "flex", "flexDirection": "column", "gap": "14px"}}>
              <div>
                <div style={{"display": "flex", "justifyContent": "space-between", "fontSize": "13px", "marginBottom": "4px", "color": "#c2bdd8"}}>
                  <span>
                    {"Investigative (Nghiên cứu)"}
                  </span>
                  <strong>
                    {"92%"}
                  </strong>
                </div>
                <div style={{"height": "6px", "background": "rgba(255,255,255,0.1)", "borderRadius": "99px"}}>
                  <div style={{"width": "92%", "height": "100%", "background": "#06b6d4", "borderRadius": "99px"}}>
                  </div>
                </div>
              </div>
              <div>
                <div style={{"display": "flex", "justifyContent": "space-between", "fontSize": "13px", "marginBottom": "4px", "color": "#c2bdd8"}}>
                  <span>
                    {"Artistic (Nghệ thuật)"}
                  </span>
                  <strong>
                    {"84%"}
                  </strong>
                </div>
                <div style={{"height": "6px", "background": "rgba(255,255,255,0.1)", "borderRadius": "99px"}}>
                  <div style={{"width": "84%", "height": "100%", "background": "#ec4899", "borderRadius": "99px"}}>
                  </div>
                </div>
              </div>
              <div>
                <div style={{"display": "flex", "justifyContent": "space-between", "fontSize": "13px", "marginBottom": "4px", "color": "#c2bdd8"}}>
                  <span>
                    {"Social (Xã hội)"}
                  </span>
                  <strong>
                    {"73%"}
                  </strong>
                </div>
                <div style={{"height": "6px", "background": "rgba(255,255,255,0.1)", "borderRadius": "99px"}}>
                  <div style={{"width": "73%", "height": "100%", "background": "#3b82f6", "borderRadius": "99px"}}>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div hidden={active !== 2} id={`${id}-view-2`} role="region" aria-label="Minh họa bước 3" className={styles["product-story-view"] + " " + (active === 2 ? styles.active : "")} data-step="2">
          <div className={styles["career-match-mock"]}>
            <div style={{"display": "flex", "justifyContent": "space-between", "alignItems": "center", "marginBottom": "12px"}}>
              <span style={{"fontSize": "12px", "color": "#7a74cb", "fontWeight": "700", "textTransform": "uppercase"}}>
                {"Khớp nối hàng đầu"}
              </span>
              <span style={{"fontSize": "12px", "fontWeight": "800", "color": "#34d399", "background": "rgba(16, 185, 129, 0.2)", "padding": "4px 10px", "borderRadius": "99px"}}>
                {"94 / 100 · ví dụ"}
              </span>
            </div>
            <h4 style={{"fontFamily": "var(--font-family-serif)", "fontSize": "24px", "color": "#ffffff", "marginBottom": "10px"}}>
              {"Software Engineer"}
            </h4>
            <p style={{"fontSize": "14px", "color": "#c2bdd8", "lineHeight": "1.5", "marginBottom": "16px"}}>
              {"Phù hợp xuất sắc với tư duy trừu tượng, đam mê giải quyết bài toán phức tạp và tính cách độc lập."}
            </p>
            <div style={{"background": "rgba(255,255,255,0.05)", "padding": "12px 16px", "borderRadius": "12px", "fontSize": "13px", "color": "#ffffff"}}>
              {"Xem mô tả công việc, kỹ năng và nguồn nghề trong danh mục."}
            </div>
          </div>
        </div>
        <div hidden={active !== 3} id={`${id}-view-3`} role="region" aria-label="Minh họa bước 4" className={styles["product-story-view"] + " " + (active === 3 ? styles.active : "")} data-step="3">
          <div className={styles["skill-gap-mock"]}>
            <div style={{"fontSize": "12px", "color": "#7a74cb", "fontWeight": "700", "textTransform": "uppercase", "marginBottom": "12px"}}>
              {"Phân tích khoảng trống"}
            </div>
            <h4 style={{"fontFamily": "var(--font-family-serif)", "fontSize": "22px", "color": "#ffffff", "marginBottom": "16px"}}>
              {"Software Engineer Skill Matrix"}
            </h4>
            <div style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "12px"}}>
              <div style={{"background": "rgba(16, 185, 129, 0.1)", "border": "1px solid rgba(16, 185, 129, 0.25)", "padding": "12px", "borderRadius": "12px"}}>
                <div style={{"fontSize": "11px", "fontWeight": "700", "color": "#34d399", "marginBottom": "6px"}}>
                  {"ĐÃ CÓ (HAVE)"}
                </div>
                <div style={{"fontSize": "13px", "color": "#ffffff"}}>
                  {"✓ Problem Solving"}
                </div>
                <div style={{"fontSize": "13px", "color": "#ffffff"}}>
                  {"✓ Basic Programming"}
                </div>
              </div>
              <div style={{"background": "rgba(217, 70, 239, 0.1)", "border": "1px solid rgba(217, 70, 239, 0.25)", "padding": "12px", "borderRadius": "12px"}}>
                <div style={{"fontSize": "11px", "fontWeight": "700", "color": "#f0abfc", "marginBottom": "6px"}}>
                  {"CẦN BỔ SUNG (GAP)"}
                </div>
                <div style={{"fontSize": "13px", "color": "#ffffff"}}>
                  {"○ Data Structures"}
                </div>
                <div style={{"fontSize": "13px", "color": "#ffffff"}}>
                  {"○ System Design"}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div hidden={active !== 4} id={`${id}-view-4`} role="region" aria-label="Minh họa bước 5" className={styles["product-story-view"] + " " + (active === 4 ? styles.active : "")} data-step="4">
          <div className={styles["roadmap-mock"]}>
            <div style={{"fontSize": "12px", "color": "#7a74cb", "fontWeight": "700", "textTransform": "uppercase", "marginBottom": "12px"}}>
              {"Lộ trình cá nhân"}
            </div>
            <h4 style={{"fontFamily": "var(--font-family-serif)", "fontSize": "22px", "color": "#ffffff", "marginBottom": "16px"}}>
              {"Target: Backend Developer"}
            </h4>
            <div style={{"display": "flex", "flexDirection": "column", "gap": "10px", "fontSize": "13px"}}>
              <div style={{"display": "flex", "alignItems": "center", "gap": "10px", "color": "#34d399"}}>
                <span style={{"width": "8px", "height": "8px", "borderRadius": "50%", "background": "#34d399"}}>
                </span>
                <strong>
                  {"Hiện tại:"}
                </strong>
                {"Nền tảng Java & Cấu trúc Dữ liệu"}
              </div>
              <div style={{"display": "flex", "alignItems": "center", "gap": "10px", "color": "#ffffff"}}>
                <span style={{"width": "8px", "height": "8px", "borderRadius": "50%", "background": "#7a74cb"}}>
                </span>
                <strong>
                  {"Học kỳ tới:"}
                </strong>
                {"Database & Xây dựng RESTful API"}
              </div>
              <div style={{"display": "flex", "alignItems": "center", "gap": "10px", "opacity": "0.6"}}>
                <span style={{"width": "8px", "height": "8px", "borderRadius": "50%", "background": "#666"}}>
                </span>
                <strong>
                  {"Mục tiêu năm 3:"}
                </strong>
                {"Spring Boot & Thực tập doanh nghiệp"}
              </div>
            </div>
          </div>
        </div>
        <div hidden={active !== 5} id={`${id}-view-5`} role="region" aria-label="Minh họa bước 6" className={styles["product-story-view"] + " " + (active === 5 ? styles.active : "")} data-step="5">
          <div className={styles["ai-chat-mock"]}>
            <div style={{"fontSize": "12px", "color": "#7a74cb", "fontWeight": "700", "textTransform": "uppercase", "marginBottom": "12px"}}>
              {"Cố vấn AI theo ngữ cảnh"}
            </div>
            <div style={{"background": "rgba(255,255,255,0.06)", "padding": "12px 16px", "borderRadius": "14px", "fontSize": "13.5px", "color": "#ffffff", "marginBottom": "10px"}}>
              {"“Tại sao Software Engineer lại phù hợp nhất với hồ sơ của mình?”"}
            </div>
            <div style={{"background": "rgba(81, 77, 140, 0.25)", "border": "1px solid rgba(122, 116, 203, 0.3)", "padding": "14px 16px", "borderRadius": "14px", "fontSize": "13px", "lineHeight": "1.5", "color": "#e2dff0"}}>
              {"Cố vấn sử dụng kết quả và hồ sơ đã lưu để bổ sung ngữ cảnh. Mở trang Cố vấn để bắt đầu hội thoại thật."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssessmentDemo() {
  const [answer,setAnswer] = useState(true);
  return <div className={styles['assessment-mock-card']}>
    <p className={styles['mock-q-meta']}>Câu hỏi minh họa · Nhóm Nghiên cứu (I)</p>
    <h4 className={styles['mock-q-text']}>Bạn có hứng thú với việc phân tích dữ liệu để tìm ra quy luật trong các hiện tượng phức tạp?</h4>
    <div className={styles['mock-options-list']} aria-label="Trả lời minh họa">
      {[true,false].map(value => <button type="button" key={String(value)} aria-pressed={answer===value} onClick={()=>setAnswer(value)} className={`${styles['mock-opt-pill']} ${answer===value?styles.selected:''}`}>{value?'Có — Hứng thú':'Không — Không hứng thú'}</button>)}
    </div>
    <p className={styles['demo-note']}>Chỉ thử giao diện · Câu trả lời không được lưu.</p>
  </div>;
}
