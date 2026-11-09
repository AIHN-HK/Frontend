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
      <h2 className={styles['editorial-statement']}>Hiểu mình rồi chọn bước tiếp theo.</h2>
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
            {"Trả lời Có / Không theo cảm nhận của bạn."}
          </span>
        </button>
        <button type="button" aria-label="02 Xem kết quả" aria-pressed={active === 1} aria-controls={`${id}-view-1`} onClick={() => selectStep(1)} className={styles["story-step-item"] + " " + (active === 1 ? styles.active : "")} data-step="1">
          <span className={styles["story-step-num"]}>
            {"02"}
          </span>
          <span className={styles["story-step-title"]}>
            {"Xem kết quả"}
          </span>
          <span className={styles["story-step-desc"]}>
            {"Xem sáu nhóm sở thích và mã nhóm nổi bật (TopCode)."}
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
            {"Tìm nghề gần với sở thích, kỹ năng và xem lý do được gợi ý."}
          </span>
        </button>
        <button type="button" aria-label="04 Kỹ năng cần rèn thêm" aria-pressed={active === 3} aria-controls={`${id}-view-3`} onClick={() => selectStep(3)} className={styles["story-step-item"] + " " + (active === 3 ? styles.active : "")} data-step="3">
          <span className={styles["story-step-num"]}>
            {"04"}
          </span>
          <span className={styles["story-step-title"]}>
            {"Kỹ năng cần rèn thêm"}
          </span>
          <span className={styles["story-step-desc"]}>
            {"So sánh kỹ năng tự đánh giá với mức tham khảo của nghề."}
          </span>
        </button>
        <button type="button" aria-label="05 Tạo lộ trình" aria-pressed={active === 4} aria-controls={`${id}-view-4`} onClick={() => selectStep(4)} className={styles["story-step-item"] + " " + (active === 4 ? styles.active : "")} data-step="4">
          <span className={styles["story-step-num"]}>
            {"05"}
          </span>
          <span className={styles["story-step-title"]}>
            {"Tạo lộ trình"}
          </span>
          <span className={styles["story-step-desc"]}>
            {"Chia việc học và thực hành thành các bước vừa sức."}
          </span>
        </button>
        <button type="button" aria-label="06 Hỏi AIHN" aria-pressed={active === 5} aria-controls={`${id}-view-5`} onClick={() => selectStep(5)} className={styles["story-step-item"] + " " + (active === 5 ? styles.active : "")} data-step="5">
          <span className={styles["story-step-num"]}>
            {"06"}
          </span>
          <span className={styles["story-step-title"]}>
            {"Hỏi AIHN"}
          </span>
          <span className={styles["story-step-desc"]}>
            {"Trao đổi về lựa chọn và điều còn phân vân từ hồ sơ đã lưu."}
          </span>
        </button>
      </div>
      </div>
      <HomeStoryViews active={active} id={id}/>
    </div>
  </section>;
}
