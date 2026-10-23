import { useId, useRef, useState } from 'react';
import { useHomeStoryMotion } from '../hooks/useHomeStoryMotion';
import { HomeStoryViews } from './HomeStoryViews';
import styles from '../pages/HomePage.module.css';

export function HomeStory() {
  const root = useRef<HTMLElement>(null), id=useId();
  const [active,setActive] = useState(0);
  const scrollToStep = useHomeStoryMotion(root,setActive);
  const selectStep = (index:number) => { setActive(index); scrollToStep(index); };
  return <section ref={root} id="how-it-works" className={`${styles['aihn-howitworks']} ${styles['section--dark']}`} data-home-surface="dark" aria-label="AIHN hoạt động thế nào">
    <div className={styles['aihn-howitworks__header']}>
      <span className={styles['editorial-tag']}>Trải nghiệm tương tác</span>
      <h2 className={styles['editorial-statement']}>Hành trình chuyển hóa từ hiểu mình đến hiện thực</h2>
    </div>
    <div className={styles['aihn-howitworks__layout']}>
      <div className={styles['story-stepper-col']}>
      <div className={styles["story-stepper-sticky"]}>
        <button type="button" aria-label="01 Hiểu bản thân" aria-pressed={active === 0} aria-controls={`${id}-view-0`} onClick={() => selectStep(0)} className={styles["story-step-item"] + " " + (active === 0 ? styles.active : "")} data-step="0">
          <span className={styles["story-step-num"]}>
            {"01"}
          </span>
          <span className={styles["story-step-title"]}>
            {"Hiểu bản thân"}
          </span>
          <span className={styles["story-step-desc"]}>
            {"Hoàn thành bài trắc nghiệm Holland RIASEC với câu trả lời Có / Không để giải mã thiên hướng tự nhiên."}
          </span>
        </button>
        <button type="button" aria-label="02 Khám phá kết quả" aria-pressed={active === 1} aria-controls={`${id}-view-1`} onClick={() => selectStep(1)} className={styles["story-step-item"] + " " + (active === 1 ? styles.active : "")} data-step="1">
          <span className={styles["story-step-num"]}>
            {"02"}
          </span>
          <span className={styles["story-step-title"]}>
            {"Khám phá kết quả"}
          </span>
          <span className={styles["story-step-desc"]}>
            {"Thấu hiểu 3 nhóm tính cách vượt trội (TopCode) và bản đồ năng lượng nghề nghiệp."}
          </span>
        </button>
        <button type="button" aria-label="03 Tìm nghề phù hợp" aria-pressed={active === 2} aria-controls={`${id}-view-2`} onClick={() => selectStep(2)} className={styles["story-step-item"] + " " + (active === 2 ? styles.active : "")} data-step="2">
          <span className={styles["story-step-num"]}>
            {"03"}
          </span>
          <span className={styles["story-step-title"]}>
            {"Tìm nghề phù hợp"}
          </span>
          <span className={styles["story-step-desc"]}>
            {"Nhận danh mục nghề nghiệp cá nhân hóa dựa trên sự tương thích năng khiếu và sở thích."}
          </span>
        </button>
        <button type="button" aria-label="04 Phân tích Skill Gap" aria-pressed={active === 3} aria-controls={`${id}-view-3`} onClick={() => selectStep(3)} className={styles["story-step-item"] + " " + (active === 3 ? styles.active : "")} data-step="3">
          <span className={styles["story-step-num"]}>
            {"04"}
          </span>
          <span className={styles["story-step-title"]}>
            {"Phân tích Skill Gap"}
          </span>
          <span className={styles["story-step-desc"]}>
            {"Nhìn rõ những kỹ năng bạn đã có và những năng lực thực tế cần rèn luyện bổ sung."}
          </span>
        </button>
        <button type="button" aria-label="05 Xây dựng Roadmap" aria-pressed={active === 4} aria-controls={`${id}-view-4`} onClick={() => selectStep(4)} className={styles["story-step-item"] + " " + (active === 4 ? styles.active : "")} data-step="4">
          <span className={styles["story-step-num"]}>
            {"05"}
          </span>
          <span className={styles["story-step-title"]}>
            {"Xây dựng Roadmap"}
          </span>
          <span className={styles["story-step-desc"]}>
            {"Tạo lộ trình học tập, dự án và tích lũy kinh nghiệm cụ thể cho từng giai đoạn."}
          </span>
        </button>
        <button type="button" aria-label="06 Đồng hành cùng AI" aria-pressed={active === 5} aria-controls={`${id}-view-5`} onClick={() => selectStep(5)} className={styles["story-step-item"] + " " + (active === 5 ? styles.active : "")} data-step="5">
          <span className={styles["story-step-num"]}>
            {"06"}
          </span>
          <span className={styles["story-step-title"]}>
            {"Đồng hành cùng AI"}
          </span>
          <span className={styles["story-step-desc"]}>
            {"Hỏi đáp trực tiếp cùng Cố vấn AI dựa trên hồ sơ cá nhân và bối cảnh thực tế của riêng bạn."}
          </span>
        </button>
      </div>
      </div>
      <HomeStoryViews active={active} id={id}/>
    </div>
  </section>;
}
