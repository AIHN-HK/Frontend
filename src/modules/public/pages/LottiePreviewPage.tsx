import { useState } from 'react';
import { LottieIllustration } from '@/shared/ui/lottie/LottieIllustration';
import { lottieAssets } from '@/shared/ui/lottie/assets';
import type { LottieIllustrationKind } from '@/shared/ui/lottie/assets';
import styles from './LottiePreviewPage.module.css';

const examples: { kind: LottieIllustrationKind; title: string; description: string }[] = [
  { kind: 'advisor', title: 'Cố vấn đang chờ phản hồi', description: 'Robot tím minh họa lúc đợi câu trả lời đầu tiên. Trạng thái và nội dung hội thoại vẫn do hệ thống xác nhận.' },
  { kind: 'empty', title: 'Chưa có nghề phù hợp', description: 'Hộp trống đi cùng thông báo và thao tác đổi bộ lọc; không dùng thay cho thông báo lỗi kết nối.' },
  { kind: 'complete', title: 'Hoàn thành Holland', description: 'Dấu tích chạy một lần khi đã có kết quả. Bài làm của khách vẫn chưa được lưu vào tài khoản.' },
];

export function LottiePreviewPage() {
  const [animate, setAnimate] = useState(true), [version, setVersion] = useState(0);
  return <div className={styles.page}>
    <p className={styles.eyebrow}>BẢN THỬ NGHIỆM · LOTTIEFILES</p>
    <h1>Chuyển động cho AIHN</h1>
    <p>Ba mẫu minh họa để đánh giá màu sắc, kích thước và nhịp chuyển động. Đây là bản xem thử, không phải trạng thái tài khoản hay cuộc tư vấn thật.</p>
    <div className={styles.controls}>
      <button type="button" className="btn btn-primary" onClick={() => setVersion(value => value + 1)}>Phát lại các mẫu</button>
      <button type="button" className="btn btn-secondary" aria-pressed={!animate} onClick={() => setAnimate(value => !value)}>{animate ? 'Dùng hình tĩnh' : 'Bật chuyển động'}</button>
    </div>
    <div className={styles.grid}>{examples.map(example => <article className={styles.card} key={example.kind}>
      <div className={styles.art}><LottieIllustration key={version} kind={example.kind} size={160} animate={animate} /></div>
      <h2>{example.title}</h2><p>{example.description}</p>
      <a href={lottieAssets[example.kind].source} target="_blank" rel="noreferrer">Mẫu gốc · {lottieAssets[example.kind].author}</a>
    </article>)}</div>
    <p>Ưu tiên giảm chuyển động của thiết bị luôn được tôn trọng. Khi tắt chuyển động, mỗi mẫu hiển thị hình tĩnh tương ứng.</p>
  </div>;
}
