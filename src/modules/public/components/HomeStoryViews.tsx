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
            <div style={{"fontSize": "var(--text-sm)", "fontWeight": "700", "color": "#7a74cb", "textTransform": "uppercase", "marginBottom": "12px"}}>
              {"Hồ sơ minh họa"}
            </div>
            <h4 style={{"fontFamily": "var(--font-family-serif)", "fontSize": "var(--text-xl)", "color": "#ffffff", "marginBottom": "20px"}}>
              {"TopCode minh họa: I • A • S"}
            </h4>
            <div style={{"display": "flex", "flexDirection": "column", "gap": "14px"}}>
              <div>
                <div style={{"display": "flex", "justifyContent": "space-between", "fontSize": "var(--text-sm)", "marginBottom": "4px", "color": "#c2bdd8"}}>
                  <span>
                    {"Nghiên cứu (I)"}
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
                <div style={{"display": "flex", "justifyContent": "space-between", "fontSize": "var(--text-sm)", "marginBottom": "4px", "color": "#c2bdd8"}}>
                  <span>
                    {"Nghệ thuật (A)"}
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
                <div style={{"display": "flex", "justifyContent": "space-between", "fontSize": "var(--text-sm)", "marginBottom": "4px", "color": "#c2bdd8"}}>
                  <span>
                    {"Xã hội (S)"}
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
              <span style={{"fontSize": "var(--text-sm)", "color": "#7a74cb", "fontWeight": "700", "textTransform": "uppercase"}}>
                {"Nghề được gợi ý"}
              </span>
              <span style={{"fontSize": "var(--text-sm)", "fontWeight": "800", "color": "#34d399", "background": "rgba(16, 185, 129, 0.2)", "padding": "4px 10px", "borderRadius": "99px"}}>
                {"94 / 100 · ví dụ"}
              </span>
            </div>
            <h4 style={{"fontFamily": "var(--font-family-serif)", "fontSize": "var(--text-xl)", "color": "#ffffff", "marginBottom": "10px"}}>
              {"Kỹ sư phần mềm"}
            </h4>
            <p style={{"fontSize": "var(--text-base)", "color": "#c2bdd8", "lineHeight": "1.5", "marginBottom": "16px"}}>
              {"Trong ví dụ này, nghề được gợi ý từ sở thích nghiên cứu và giải quyết vấn đề."}
            </p>
            <div style={{"background": "rgba(255,255,255,0.05)", "padding": "12px 16px", "borderRadius": "12px", "fontSize": "var(--text-sm)", "color": "#ffffff"}}>
              {"Xem công việc, kỹ năng và nguồn tham khảo."}
            </div>
          </div>
        </div>
        <div hidden={active !== 3} id={`${id}-view-3`} role="region" aria-label="Minh họa bước 4" className={styles["product-story-view"] + " " + (active === 3 ? styles.active : "")} data-step="3">
          <div className={styles["skill-gap-mock"]}>
            <div style={{"fontSize": "var(--text-sm)", "color": "#7a74cb", "fontWeight": "700", "textTransform": "uppercase", "marginBottom": "12px"}}>
              {"Kỹ năng cần rèn thêm"}
            </div>
            <h4 style={{"fontFamily": "var(--font-family-serif)", "fontSize": "var(--text-lg)", "color": "#ffffff", "marginBottom": "16px"}}>
              {"Kỹ năng nghề kỹ sư phần mềm"}
            </h4>
            <div style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "12px"}}>
              <div style={{"background": "rgba(16, 185, 129, 0.1)", "border": "1px solid rgba(16, 185, 129, 0.25)", "padding": "12px", "borderRadius": "12px"}}>
                <div style={{"fontSize": "var(--text-xs)", "fontWeight": "700", "color": "#34d399", "marginBottom": "6px"}}>
                  {"ĐÃ CÓ"}
                </div>
                <div style={{"fontSize": "var(--text-sm)", "color": "#ffffff"}}>
                  {"✓ Giải quyết vấn đề"}
                </div>
                <div style={{"fontSize": "var(--text-sm)", "color": "#ffffff"}}>
                  {"✓ Lập trình cơ bản"}
                </div>
              </div>
              <div style={{"background": "rgba(217, 70, 239, 0.1)", "border": "1px solid rgba(217, 70, 239, 0.25)", "padding": "12px", "borderRadius": "12px"}}>
                <div style={{"fontSize": "var(--text-xs)", "fontWeight": "700", "color": "#f0abfc", "marginBottom": "6px"}}>
                  {"CẦN RÈN THÊM"}
                </div>
                <div style={{"fontSize": "var(--text-sm)", "color": "#ffffff"}}>
                  {"○ Cấu trúc dữ liệu"}
                </div>
                <div style={{"fontSize": "var(--text-sm)", "color": "#ffffff"}}>
                  {"○ Thiết kế hệ thống"}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div hidden={active !== 4} id={`${id}-view-4`} role="region" aria-label="Minh họa bước 5" className={styles["product-story-view"] + " " + (active === 4 ? styles.active : "")} data-step="4">
          <div className={styles["roadmap-mock"]}>
            <div style={{"fontSize": "var(--text-sm)", "color": "#7a74cb", "fontWeight": "700", "textTransform": "uppercase", "marginBottom": "12px"}}>
              {"Lộ trình cá nhân"}
            </div>
            <h4 style={{"fontFamily": "var(--font-family-serif)", "fontSize": "var(--text-lg)", "color": "#ffffff", "marginBottom": "16px"}}>
              {"Mục tiêu: lập trình backend"}
            </h4>
            <div style={{"display": "flex", "flexDirection": "column", "gap": "10px", "fontSize": "var(--text-sm)"}}>
              <div style={{"display": "flex", "alignItems": "center", "gap": "10px", "color": "#34d399"}}>
                <span style={{"width": "8px", "height": "8px", "borderRadius": "50%", "background": "#34d399"}}>
                </span>
                <strong>
                  {"Hiện tại:"}
                </strong>
                {"Java và cấu trúc dữ liệu"}
              </div>
              <div style={{"display": "flex", "alignItems": "center", "gap": "10px", "color": "#ffffff"}}>
                <span style={{"width": "8px", "height": "8px", "borderRadius": "50%", "background": "#7a74cb"}}>
                </span>
                <strong>
                  {"Học kỳ tới:"}
                </strong>
                {"Cơ sở dữ liệu và RESTful API"}
              </div>
              <div style={{"display": "flex", "alignItems": "center", "gap": "10px", "opacity": "0.6"}}>
                <span style={{"width": "8px", "height": "8px", "borderRadius": "50%", "background": "#666"}}>
                </span>
                <strong>
                  {"Mục tiêu năm 3:"}
                </strong>
                {"Spring Boot và thực tập"}
              </div>
            </div>
          </div>
        </div>
        <div hidden={active !== 5} id={`${id}-view-5`} role="region" aria-label="Minh họa bước 6" className={styles["product-story-view"] + " " + (active === 5 ? styles.active : "")} data-step="5">
          <div className={styles["ai-chat-mock"]}>
            <div style={{"fontSize": "var(--text-sm)", "color": "#7a74cb", "fontWeight": "700", "textTransform": "uppercase", "marginBottom": "12px"}}>
              {"Hỏi AIHN từ hồ sơ đã lưu"}
            </div>
            <div style={{"background": "rgba(255,255,255,0.06)", "padding": "12px 16px", "borderRadius": "14px", "fontSize": "var(--text-sm)", "color": "#ffffff", "marginBottom": "10px"}}>
              {"“Vì sao nghề kỹ sư phần mềm được gợi ý?”"}
            </div>
            <div style={{"background": "rgba(81, 77, 140, 0.25)", "border": "1px solid rgba(122, 116, 203, 0.3)", "padding": "14px 16px", "borderRadius": "14px", "fontSize": "var(--text-sm)", "lineHeight": "1.5", "color": "#e2dff0"}}>
              {"AIHN dựa vào kết quả và hồ sơ đã lưu. Mở Hỏi AIHN để trao đổi."}
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
    <h4 className={styles['mock-q-text']}>Bạn thích phân tích dữ liệu để tìm quy luật?</h4>
    <div className={styles['mock-options-list']} aria-label="Trả lời minh họa">
      {[true,false].map(value => <button type="button" key={String(value)} aria-pressed={answer===value} onClick={()=>setAnswer(value)} className={`${styles['mock-opt-pill']} ${answer===value?styles.selected:''}`}>{value?'Có, mình thích':'Không, mình không thích'}</button>)}
    </div>
    <p className={styles['demo-note']}>Câu hỏi minh họa · Câu trả lời không được lưu.</p>
  </div>;
}
