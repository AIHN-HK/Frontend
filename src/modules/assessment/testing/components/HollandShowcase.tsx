import { useState } from 'react';
import { ShowcaseCard } from '@/shared/ui/ce/ShowcaseCard';
import student from '@/assets/aihn/hero-student.png';
import laptop from '@/assets/aihn/student-male-laptop.jpg';
import team from '@/assets/aihn/student-team-collab.jpg';
import styles from './HollandShowcase.module.css';

const slides = [
  { tag: 'AIHN CAREER · TOPCODE', title: 'Khám phá nghề nghiệp từ những điều bạn yêu thích.', image: student, alt: 'Sinh viên khám phá sở thích và nghề nghiệp', items: ['Hiểu bản thân qua 6 nhóm RIASEC', 'Xem TopCode từ kết quả đã nộp', 'Khám phá nghề có giải thích'] },
  { tag: 'HIỂU MÌNH · HIỂU NGHỀ', title: 'Mỗi sở thích là một điểm bắt đầu để tìm hiểu bản thân.', image: team, alt: 'Nhóm sinh viên cùng học tập', items: ['Chọn theo cảm nhận thực tế', 'Không có đáp án đúng hoặc sai', 'Kết quả là gợi ý để khám phá thêm'] },
  { tag: 'TỪ KHÁM PHÁ · ĐẾN HÀNH ĐỘNG', title: 'Từng bước xây dựng mục tiêu và lộ trình của riêng bạn.', image: laptop, alt: 'Sinh viên tìm hiểu lộ trình học tập trên máy tính', items: ['Bổ sung kỹ năng và sở thích', 'Chọn nghề mục tiêu', 'Theo dõi nhiệm vụ đã hoàn thành'] },
];
export function HollandShowcase() {
  const [index, setIndex] = useState(0);
  const slide = slides[index]!;
  return <div className={styles.carousel} role="region" aria-label="Giới thiệu hành trình Holland">
    <ShowcaseCard className={styles.card} media={<img src={slide.image} alt={slide.alt} />}>
      <div aria-live="polite" aria-atomic="true"><p className={styles.tag}>{slide.tag}</p><h2>{slide.title}</h2><ul>{slide.items.map(item => <li key={item}><span aria-hidden="true">•</span>{item}</li>)}</ul></div>
    </ShowcaseCard>
    <div className={styles.controls}><button type="button" aria-label="Nội dung giới thiệu trước" onClick={() => setIndex((index + slides.length - 1) % slides.length)}>‹</button><span>{index + 1} / {slides.length}</span><button type="button" aria-label="Nội dung giới thiệu tiếp theo" onClick={() => setIndex((index + 1) % slides.length)}>›</button></div>
  </div>;
}
