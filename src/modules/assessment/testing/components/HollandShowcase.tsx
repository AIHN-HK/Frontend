import { useState } from 'react';
import { ShowcaseCard } from '@/shared/ui/ce/ShowcaseCard';
import student from '@/assets/aihn/hero-student.png';
import laptop from '@/assets/aihn/student-male-laptop.jpg';
import team from '@/assets/aihn/student-team-collab.jpg';
import styles from './HollandShowcase.module.css';

const slides = [
  { tag: 'AIHN CAREER · TOPCODE', title: 'Bắt đầu từ điều bạn thích.', image: student, alt: 'Sinh viên tìm hiểu sở thích và nghề', items: ['Nhìn lại sở thích qua 6 nhóm RIASEC', 'Xem mã nhóm nổi bật (TopCode)', 'Hiểu lý do gợi ý nghề'] },
  { tag: 'HIỂU MÌNH · HIỂU NGHỀ', title: 'Cứ chọn theo cảm nhận của bạn.', image: team, alt: 'Nhóm sinh viên cùng học tập', items: ['Chọn điều gần với bạn', 'Không có đáp án đúng hoặc sai', 'Kết quả là một góc nhìn để tham khảo'] },
  { tag: 'CHỌN BƯỚC TIẾP THEO', title: 'Thử một bước nhỏ về phía mình muốn đến.', image: laptop, alt: 'Sinh viên tìm hiểu lộ trình học tập trên máy tính', items: ['Bổ sung kỹ năng và sở thích', 'Chọn nghề mục tiêu', 'Theo dõi nhiệm vụ đã hoàn thành'] },
];

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points={direction === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
    </svg>
  );
}

export function HollandShowcase() {
  const [index, setIndex] = useState(0);
  const slide = slides[index]!;
  return <div className={styles.carousel} role="region" aria-label="Giới thiệu bài Holland">
    <ShowcaseCard className={styles.card} media={<img src={slide.image} alt={slide.alt} />}>
      <div aria-live="polite" aria-atomic="true"><p className={styles.tag}>{slide.tag}</p><h2>{slide.title}</h2><ul>{slide.items.map(item => <li key={item}><span aria-hidden="true">•</span>{item}</li>)}</ul></div>
    </ShowcaseCard>
    <div className={styles.controls}>
      <button type="button" aria-label="Nội dung giới thiệu trước" onClick={() => setIndex((index + slides.length - 1) % slides.length)}>
        <ChevronIcon direction="left" />
      </button>
      <span>{index + 1} / {slides.length}</span>
      <button type="button" aria-label="Nội dung giới thiệu tiếp theo" onClick={() => setIndex((index + 1) % slides.length)}>
        <ChevronIcon direction="right" />
      </button>
    </div>
  </div>;
}
