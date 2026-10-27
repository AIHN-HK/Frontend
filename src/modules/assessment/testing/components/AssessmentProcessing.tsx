import { useEffect, useRef } from 'react';
import { LottieIllustration } from '@/shared/ui/lottie/LottieIllustration';
import styles from '../pages/HollandTestPage.module.css';

export function AssessmentProcessing({ checking = false }: { checking?: boolean }) {
  const status = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = status.current;
    if (!node) return;
    const bounds = node.getBoundingClientRect();
    // Submission can start from the bottom of a long mobile question page.
    if (bounds.top < 64 || bounds.bottom > window.innerHeight) node.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, []);
  return <section ref={status} className={styles.processing} role="status" aria-label="AIHN đang xử lý bài làm">
    <LottieIllustration kind="advisor" size={64} />
    <div><h2>{checking ? 'Đang đối chiếu kết quả đã nộp' : 'AIHN đang tổng hợp kết quả'}</h2><p>{checking ? 'Đáp án được giữ trong lúc kiểm tra với hệ thống.' : 'Đang xác nhận bài làm và tổng hợp các nhóm sở thích RIASEC của bạn.'}</p></div>
  </section>;
}
